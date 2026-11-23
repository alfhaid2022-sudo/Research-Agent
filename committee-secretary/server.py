#!/usr/bin/env python3
"""سكرتير اللجنة التنفيذية — خادم الويب (مكتبة Python القياسية فقط).

التشغيل:   python3 server.py
نسخة احتياطية: python3 server.py backup [المسار]
"""
import datetime as dt
import json
import mimetypes
import os
import re
import secrets
import sqlite3
import sys
import time
import urllib.parse
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

BASE = os.path.dirname(os.path.abspath(__file__))


def load_env():
    p = os.path.join(BASE, ".env")
    if os.path.exists(p):
        for line in open(p, encoding="utf-8"):
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


load_env()
sys.path.insert(0, BASE)
from app import db, export, hijri, organizer, whatsapp  # noqa: E402

STATIC = os.path.join(BASE, "static")
ROLE_LABEL = {"secretary": "المقرر", "chair": "الرئيس", "member": "عضو"}
DECISION_STATUS = ["لم يبدأ", "قيد التنفيذ", "منجز", "مؤجل", "ملغى"]
OPEN_STATUS = ("لم يبدأ", "قيد التنفيذ")
STATUS_LABEL = {"draft": "مسودة", "review": "قيد المراجعة", "approved": "معتمد"}
MAX_JSON = 2 * 1024 * 1024
MAX_UPLOAD = 15 * 1024 * 1024
_login_fail = {}


class HTTPError(Exception):
    def __init__(self, code, msg):
        self.code, self.msg = code, msg


def today():
    return dt.date.today().isoformat()


def is_overdue(d):
    return bool(d["due_date"]) and d["due_date"] < today() and d["status"] in OPEN_STATUS


def valid_date(s):
    try:
        dt.date.fromisoformat(s)
        return True
    except (ValueError, TypeError):
        return False


# ------------------------------------------------------------------ تركيب المحضر
def decision_dict(c, r, with_followups=True):
    d = dict(r)
    d["confirm_reasons"] = json.loads(d.get("confirm_reasons") or "[]")
    d["needs_confirm"] = bool(d["needs_confirm"])
    d["overdue"] = is_overdue(d)
    if with_followups:
        d["followups"] = [dict(x) for x in c.execute("SELECT * FROM followups WHERE decision_id=? ORDER BY id", (d["id"],))]
    return d


def compose(c, mid):
    m = c.execute("SELECT * FROM meetings WHERE id=?", (mid,)).fetchone()
    if not m:
        raise HTTPError(404, "الاجتماع غير موجود")
    m = dict(m)
    m["attendance"] = json.loads(m["attendance"] or "[]")
    m["pending_manual"] = json.loads(m["pending"] or "[]")
    m["status_label"] = STATUS_LABEL[m["status"]]
    st = {r["key"]: r["value"] for r in c.execute("SELECT * FROM settings")}
    m["org_name"], m["committee_name"] = st.get("org_name", ""), st.get("committee_name", "")
    decs = [decision_dict(c, r) for r in c.execute("SELECT * FROM decisions WHERE meeting_id=? ORDER BY id", (mid,))]
    items = []
    for r in c.execute("SELECT * FROM agenda_items WHERE meeting_id=? ORDER BY position,id", (mid,)):
        it = dict(r)
        it["attachments"] = [dict(a) for a in c.execute(
            "SELECT id,label,ref,orig_name,size FROM attachments WHERE agenda_item_id=? ORDER BY id", (it["id"],))]
        it["outcomes"] = [d for d in decs if d["agenda_item_id"] == it["id"]]
        items.append(it)
    ids = {i["id"] for i in items}
    m["items"] = items
    m["unassigned"] = [d for d in decs if d["agenda_item_id"] not in ids]
    # قائمة «يحتاج تأكيد»: يدوية + مشتقة آلياً من حالة البيانات
    auto = []
    for f, label in (("number", "رقم الاجتماع"), ("date", "تاريخ الاجتماع"), ("location", "المكان"),
                     ("chair", "رئيس الاجتماع"), ("secretary", "مقرر الاجتماع")):
        if not (m.get(f) or "").strip():
            auto.append(f"{label} غير مُدخل")
    if not any(a.get("status") for a in m["attendance"]):
        auto.append("لم تُسجَّل حالة الحضور والاعتذارات")
    for d in decs:
        for reason in d["confirm_reasons"] or (["موسوم يدوياً"] if d["needs_confirm"] else []):
            if d["needs_confirm"]:
                auto.append(f"{d['kind']} «{d['text'][:60]}»: {reason}")
    for d in m["unassigned"]:
        auto.append(f"{d['kind']} «{d['text'][:60]}» غير منسوب إلى بند في جدول الأعمال")
    m["pending_auto"] = auto
    m["pending"] = m["pending_manual"] + auto
    return m


def snapshot(c, mid, user, note):
    m = compose(c, mid)
    m.pop("raw_notes", None)
    c.execute("INSERT INTO versions(meeting_id,content,note,user,ts) VALUES(?,?,?,?,?)",
              (mid, json.dumps(m, ensure_ascii=False), note, user["name"], db.now()))


def minutes_text(m, summary=False):
    """نص المحضر/الملخص لرسالة واتساب."""
    tag = {"draft": "مسودة غير معتمدة", "review": "مسودة قيد المراجعة", "approved": "معتمد"}[m["status"]]
    L = [f"*{m['org_name']}*", f"{m['committee_name']} — محضر الاجتماع رقم ({m['number'] or '؟'}) [{tag}]",
         f"التاريخ: {m['date'] or '—'} م | {m['hijri_date'] or '—'}", f"المكان: {m['location'] or '—'}", ""]
    for it in m["items"]:
        L.append(f"*{it['position']}. {it['title']}*")
        if not summary and it["discussion"]:
            L.append(it["discussion"])
        for o in it["outcomes"]:
            extra = " — ".join(x for x in (o["owner"] and f"المسؤول: {o['owner']}", (o["due_date"] or o["due_text"]) and f"الموعد: {o['due_date'] or o['due_text']}") if x)
            L.append(f"• {o['kind']}{' ' + o['number'] if o['number'] else ''}: {o['text']}" + (f" ({extra})" if extra else "")
                     + (" «يحتاج تأكيد»" if o["needs_confirm"] else ""))
        L.append("")
    if m["status"] != "approved":
        L.append("تنبيه: هذه مسودة للمراجعة وليست محضراً معتمداً.")
    return "\n".join(L).strip()


# ------------------------------------------------------------------ معالج الطلبات
class Handler(BaseHTTPRequestHandler):
    server_version = "CommitteeSecretary/0.1"

    def log_message(self, fmt, *args):
        if os.environ.get("QUIET") != "1":
            sys.stderr.write("%s - %s\n" % (self.log_date_time_string(), fmt % args))

    # --- أدوات الاستجابة
    def send(self, code, body=b"", ctype="application/json; charset=utf-8", headers=None):
        if isinstance(body, (dict, list)):
            body = json.dumps(body, ensure_ascii=False).encode("utf-8")
        elif isinstance(body, str):
            body = body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Security-Policy", "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:")
        for k, v in (headers or {}).items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body)

    def body_json(self):
        n = int(self.headers.get("Content-Length") or 0)
        if n > MAX_JSON:
            raise HTTPError(413, "حجم الطلب أكبر من المسموح")
        if not n:
            return {}
        try:
            return json.loads(self.rfile.read(n).decode("utf-8"))
        except (ValueError, UnicodeDecodeError):
            raise HTTPError(400, "صيغة الطلب غير صحيحة")

    def current_user(self, c):
        cookie = self.headers.get("Cookie") or ""
        m = re.search(r"(?:^|;\s*)sid=([A-Za-z0-9_\-]+)", cookie)
        if not m:
            return None
        r = c.execute("SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires>? AND u.active=1",
                      (m.group(1), db.now())).fetchone()
        return dict(r) if r else None

    def need(self, *roles):
        if not self.user:
            raise HTTPError(401, "يلزم تسجيل الدخول")
        if roles and self.user["role"] not in roles:
            raise HTTPError(403, "صلاحيتك (" + ROLE_LABEL[self.user["role"]] + ") لا تسمح بهذا الإجراء")

    def editable(self, c, mid):
        m = c.execute("SELECT status FROM meetings WHERE id=?", (mid,)).fetchone()
        if not m:
            raise HTTPError(404, "الاجتماع غير موجود")
        if m["status"] == "approved":
            raise HTTPError(409, "المحضر معتمد ومقفل. يلزم أن يعيد الرئيس فتحه قبل التعديل.")

    # --- التوزيع
    def do_GET(self):
        self.dispatch("GET")

    def do_POST(self):
        self.dispatch("POST")

    def do_PUT(self):
        self.dispatch("PUT")

    def do_DELETE(self):
        self.dispatch("DELETE")

    def dispatch(self, method):
        url = urllib.parse.urlsplit(self.path)
        path = url.path
        self.q = {k: v[0] for k, v in urllib.parse.parse_qs(url.query).items()}
        if not path.startswith("/api/"):
            return self.static(path) if method == "GET" else self.send(405, {"error": "غير مسموح"})
        c = db.connect()
        try:
            # حماية من الطلبات العابرة للمواقع: كل تعديل يجب أن يحمل ترويسة مخصّصة
            if method != "GET" and self.headers.get("X-Requested-With") != "secretary-app":
                raise HTTPError(403, "طلب غير موثوق")
            self.user = self.current_user(c)
            for m, pattern, fn in ROUTES:
                mt = re.fullmatch(pattern, path)
                if m == method and mt:
                    out = fn(self, c, *[int(g) if g.isdigit() else g for g in mt.groups()])
                    c.commit()
                    if out is not None:
                        self.send(200, out)
                    return
            raise HTTPError(404, "المسار غير موجود")
        except HTTPError as e:
            c.rollback()
            self.send(e.code, {"error": e.msg})
        except sqlite3.Error as e:
            c.rollback()
            self.send(500, {"error": f"خطأ في قاعدة البيانات: {e}"})
        finally:
            c.close()

    def static(self, path):
        rel = "index.html" if path in ("/", "") else path.lstrip("/")
        full = os.path.realpath(os.path.join(STATIC, rel))
        if not full.startswith(os.path.realpath(STATIC) + os.sep) or not os.path.isfile(full):
            return self.send(404, "غير موجود", "text/plain; charset=utf-8")
        ctype = mimetypes.guess_type(full)[0] or "application/octet-stream"
        if ctype.startswith("text/") or ctype.endswith("javascript"):
            ctype += "; charset=utf-8"
        with open(full, "rb") as f:
            self.send(200, f.read(), ctype)


# ------------------------------------------------------------------ المسارات
def r_login(h, c):
    b = h.body_json()
    u = (b.get("username") or "").strip().lower()
    fails = [t for t in _login_fail.get(u, []) if t > time.time() - 300]
    if len(fails) >= 5:
        raise HTTPError(429, "محاولات كثيرة؛ انتظر خمس دقائق")
    row = c.execute("SELECT * FROM users WHERE username=? AND active=1", (u,)).fetchone()
    ok = bool(row) and secrets.compare_digest(db.hash_pw(b.get("password") or "", row["salt"])[1], row["pw_hash"])
    if not ok:
        _login_fail[u] = fails + [time.time()]
        time.sleep(0.4)
        raise HTTPError(401, "اسم المستخدم أو كلمة المرور غير صحيحة")
    token = secrets.token_urlsafe(32)
    exp = (dt.datetime.now().astimezone() + dt.timedelta(hours=12)).isoformat(timespec="seconds")
    c.execute("DELETE FROM sessions WHERE expires<?", (db.now(),))
    c.execute("INSERT INTO sessions VALUES(?,?,?)", (token, row["id"], exp))
    db.audit(c, dict(row), "دخول", "جلسة")
    c.commit()
    secure = "; Secure" if os.environ.get("COOKIE_SECURE") == "1" else ""
    h.send(200, {"ok": True}, headers={"Set-Cookie": f"sid={token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200{secure}"})


def r_logout(h, c):
    m = re.search(r"sid=([A-Za-z0-9_\-]+)", h.headers.get("Cookie") or "")
    if m:
        c.execute("DELETE FROM sessions WHERE token=?", (m.group(1),))
    c.commit()
    h.send(200, {"ok": True}, headers={"Set-Cookie": "sid=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0"})


def r_me(h, c):
    if not h.user:
        return {"user": None}
    u = h.user
    return {"user": {"name": u["name"], "username": u["username"], "role": u["role"], "role_label": ROLE_LABEL[u["role"]],
                     "demo_password": bool(u["demo_password"])},
            "settings": {r["key"]: r["value"] for r in c.execute("SELECT * FROM settings")},
            "whatsapp": whatsapp.public_status(), "llm": organizer.llm_status(),
            "pdf": bool(export.soffice_path()), "decision_status": DECISION_STATUS, "kinds": organizer.KINDS,
            "today": today(), "hijri_sources": {"browser": hijri.SOURCE_BROWSER, "manual": hijri.SOURCE_MANUAL}}


def r_password(h, c):
    h.need()
    b = h.body_json()
    if db.hash_pw(b.get("current") or "", h.user["salt"])[1] != h.user["pw_hash"]:
        raise HTTPError(400, "كلمة المرور الحالية غير صحيحة")
    new = b.get("new") or ""
    if len(new) < 10 or new == db.DEMO_PASSWORD:
        raise HTTPError(400, "كلمة المرور الجديدة يجب ألا تقل عن 10 أحرف")
    s, hh = db.hash_pw(new)
    c.execute("UPDATE users SET salt=?,pw_hash=?,demo_password=0 WHERE id=?", (s, hh, h.user["id"]))
    c.execute("DELETE FROM sessions WHERE user_id=? AND token NOT IN (SELECT token FROM sessions WHERE user_id=? ORDER BY expires DESC LIMIT 1)",
              (h.user["id"], h.user["id"]))
    db.audit(c, h.user, "تغيير كلمة المرور", "مستخدم", h.user["id"])
    return {"ok": True}


def r_settings_put(h, c):
    h.need("secretary")
    b = h.body_json()
    for k in ("org_name", "committee_name"):
        if k in b:
            c.execute("INSERT INTO settings VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", (k, str(b[k])[:200]))
    db.audit(c, h.user, "تعديل", "الإعدادات", "", b)
    return {"ok": True}


def r_users(h, c):
    h.need("secretary")
    return [dict(r) for r in c.execute("SELECT id,username,name,role,active,demo_password FROM users ORDER BY id")]


def r_user_post(h, c):
    h.need("secretary")
    b = h.body_json()
    u, n, role, pw = (b.get("username") or "").strip().lower(), (b.get("name") or "").strip(), b.get("role"), b.get("password") or ""
    if not re.fullmatch(r"[a-z0-9_.\-]{3,30}", u) or not n or role not in ROLE_LABEL or len(pw) < 10:
        raise HTTPError(400, "بيانات المستخدم غير مكتملة (اسم دخول لاتيني، اسم، دور، كلمة مرور ≥ 10 أحرف)")
    s, hh = db.hash_pw(pw)
    try:
        c.execute("INSERT INTO users(username,name,role,salt,pw_hash) VALUES(?,?,?,?,?)", (u, n, role, s, hh))
    except sqlite3.IntegrityError:
        raise HTTPError(409, "اسم الدخول مستخدم")
    db.audit(c, h.user, "إنشاء", "مستخدم", u, {"name": n, "role": role})
    return {"ok": True}


def r_user_put(h, c, uid):
    h.need("secretary")
    b = h.body_json()
    if "active" in b:
        if uid == h.user["id"]:
            raise HTTPError(400, "لا يمكن تعطيل حسابك الحالي")
        c.execute("UPDATE users SET active=? WHERE id=?", (1 if b["active"] else 0, uid))
        if not b["active"]:
            c.execute("DELETE FROM sessions WHERE user_id=?", (uid,))
    if b.get("role") in ROLE_LABEL and uid != h.user["id"]:
        c.execute("UPDATE users SET role=? WHERE id=?", (b["role"], uid))
    db.audit(c, h.user, "تعديل", "مستخدم", uid, {k: b[k] for k in ("active", "role") if k in b})
    return {"ok": True}


# --- الاجتماعات
MEETING_FIELDS = ("number", "type", "date", "time", "end_time", "location", "hijri_date", "hijri_source", "chair", "secretary")


def clean_meeting(b):
    d = {k: str(b.get(k) or "").strip()[:300] for k in MEETING_FIELDS if k in b}
    if "date" in d and d["date"] and not valid_date(d["date"]):
        raise HTTPError(400, "صيغة التاريخ الميلادي غير صحيحة (YYYY-MM-DD)")
    if d.get("date") and not d.get("hijri_date") and "hijri_date" in d:
        d["hijri_date"], d["hijri_source"] = hijri.tabular_text(d["date"]), hijri.SOURCE_TABULAR
    if "attendance" in b:
        att = []
        for a in b["attendance"] or []:
            if (a.get("name") or "").strip():
                att.append({"name": a["name"].strip()[:120], "title": (a.get("title") or "").strip()[:120],
                            "status": a.get("status") if a.get("status") in ("حاضر", "معتذر", "غائب") else ""})
        d["attendance"] = json.dumps(att, ensure_ascii=False)
    return d


def r_meetings(h, c):
    h.need()
    out = []
    for r in c.execute("SELECT id,number,type,date,time,location,hijri_date,chair,status FROM meetings ORDER BY date DESC,id DESC"):
        m = dict(r)
        m["status_label"] = STATUS_LABEL[m["status"]]
        m["items"] = c.execute("SELECT COUNT(*) FROM agenda_items WHERE meeting_id=?", (m["id"],)).fetchone()[0]
        m["decisions"] = c.execute("SELECT COUNT(*) FROM decisions WHERE meeting_id=?", (m["id"],)).fetchone()[0]
        out.append(m)
    return out


def r_meeting_post(h, c):
    h.need("secretary")
    d = clean_meeting({**{k: "" for k in MEETING_FIELDS}, **h.body_json()})
    d.setdefault("attendance", "[]")
    t = db.now()
    cols = list(d) + ["created_at", "updated_at"]
    cur = c.execute(f"INSERT INTO meetings({','.join(cols)}) VALUES({','.join('?' * len(cols))})", list(d.values()) + [t, t])
    db.audit(c, h.user, "إنشاء", "اجتماع", cur.lastrowid, {"number": d.get("number"), "date": d.get("date")})
    return {"id": cur.lastrowid}


def r_meeting_get(h, c, mid):
    h.need()
    return compose(c, mid)


def r_meeting_put(h, c, mid):
    h.need("secretary")
    h.editable(c, mid)
    d = clean_meeting(h.body_json())
    if d:
        c.execute(f"UPDATE meetings SET {','.join(k + '=?' for k in d)},updated_at=? WHERE id=?", list(d.values()) + [db.now(), mid])
        db.audit(c, h.user, "تعديل", "اجتماع", mid, {k: v for k, v in d.items() if k != "attendance"} | ({"attendance": "عُدّل"} if "attendance" in d else {}))
    return {"ok": True}


# --- جدول الأعمال
def r_agenda_post(h, c, mid):
    h.need("secretary")
    h.editable(c, mid)
    b = h.body_json()
    title = (b.get("title") or "").strip()
    if not title:
        raise HTTPError(400, "عنوان الموضوع مطلوب")
    pos = c.execute("SELECT COALESCE(MAX(position),0)+1 FROM agenda_items WHERE meeting_id=?", (mid,)).fetchone()[0]
    cur = c.execute("INSERT INTO agenda_items(meeting_id,position,title,presenter) VALUES(?,?,?,?)",
                    (mid, pos, title[:300], (b.get("presenter") or "").strip()[:120]))
    db.audit(c, h.user, "إضافة", "بند جدول الأعمال", cur.lastrowid, title)
    return {"id": cur.lastrowid}


def item_row(c, iid):
    r = c.execute("SELECT * FROM agenda_items WHERE id=?", (iid,)).fetchone()
    if not r:
        raise HTTPError(404, "البند غير موجود")
    return r


def r_agenda_put(h, c, iid):
    h.need("secretary", "chair")
    it = item_row(c, iid)
    h.editable(c, it["meeting_id"])
    b = h.body_json()
    allowed = ("title", "presenter", "discussion") if h.user["role"] == "secretary" else ("discussion",)
    d = {k: str(b[k]).strip()[:20000] for k in allowed if k in b}
    if "title" in d and not d["title"]:
        raise HTTPError(400, "عنوان الموضوع مطلوب")
    if d:
        c.execute(f"UPDATE agenda_items SET {','.join(k + '=?' for k in d)} WHERE id=?", list(d.values()) + [iid])
        c.execute("UPDATE meetings SET updated_at=? WHERE id=?", (db.now(), it["meeting_id"]))
        db.audit(c, h.user, "تعديل", "بند جدول الأعمال", iid, {k: (v if len(v) < 200 else v[:200] + "…") for k, v in d.items()})
        if "discussion" in d:
            snapshot(c, it["meeting_id"], h.user, f"تعديل مناقشة البند ({it['position']})")
    return {"ok": True}


def r_agenda_delete(h, c, iid):
    h.need("secretary")
    it = item_row(c, iid)
    h.editable(c, it["meeting_id"])
    if c.execute("SELECT 1 FROM decisions WHERE agenda_item_id=?", (iid,)).fetchone() or (it["discussion"] or "").strip():
        raise HTTPError(409, "لا يُحذف بند له مناقشة أو قرارات مسجّلة. احذفها أو انقلها أولاً.")
    for a in c.execute("SELECT stored_name FROM attachments WHERE agenda_item_id=?", (iid,)):
        if a["stored_name"]:
            try:
                os.remove(os.path.join(db.UPLOAD_DIR, a["stored_name"]))
            except OSError:
                pass
    c.execute("DELETE FROM attachments WHERE agenda_item_id=?", (iid,))
    c.execute("DELETE FROM agenda_items WHERE id=?", (iid,))
    for n, r in enumerate(c.execute("SELECT id FROM agenda_items WHERE meeting_id=? ORDER BY position,id", (it["meeting_id"],)).fetchall(), 1):
        c.execute("UPDATE agenda_items SET position=? WHERE id=?", (n, r["id"]))
    db.audit(c, h.user, "حذف", "بند جدول الأعمال", iid, it["title"])
    return {"ok": True}


def r_agenda_reorder(h, c, mid):
    h.need("secretary")
    h.editable(c, mid)
    ids = h.body_json().get("ids") or []
    have = {r["id"] for r in c.execute("SELECT id FROM agenda_items WHERE meeting_id=?", (mid,))}
    if set(ids) != have or len(ids) != len(have):
        raise HTTPError(400, "قائمة الترتيب لا تطابق بنود الاجتماع")
    for n, i in enumerate(ids, 1):
        c.execute("UPDATE agenda_items SET position=? WHERE id=?", (n, i))
    db.audit(c, h.user, "إعادة ترتيب", "جدول الأعمال", mid, ids)
    return {"ok": True}


def r_attach_post(h, c, iid):
    h.need("secretary")
    it = item_row(c, iid)
    h.editable(c, it["meeting_id"])
    if (h.headers.get("Content-Type") or "").startswith("application/json"):
        b = h.body_json()
        label = (b.get("label") or "").strip()
        if not label:
            raise HTTPError(400, "وصف المرفق مطلوب")
        cur = c.execute("INSERT INTO attachments(agenda_item_id,label,ref,created_at) VALUES(?,?,?,?)",
                        (iid, label[:300], (b.get("ref") or "").strip()[:300], db.now()))
    else:
        n = int(h.headers.get("Content-Length") or 0)
        if n <= 0 or n > MAX_UPLOAD:
            raise HTTPError(413, "حجم الملف يجب ألا يتجاوز 15 ميغابايت")
        orig = os.path.basename(urllib.parse.unquote(h.headers.get("X-Filename") or "file"))[:200]
        label = urllib.parse.unquote(h.headers.get("X-Label") or "").strip()[:300] or orig
        stored = uuid.uuid4().hex
        with open(os.path.join(db.UPLOAD_DIR, stored), "wb") as f:
            left = n
            while left > 0:
                chunk = h.rfile.read(min(65536, left))
                if not chunk:
                    break
                f.write(chunk)
                left -= len(chunk)
        cur = c.execute("INSERT INTO attachments(agenda_item_id,label,stored_name,orig_name,size,created_at) VALUES(?,?,?,?,?,?)",
                        (iid, label, stored, orig, n, db.now()))
    db.audit(c, h.user, "إضافة", "مرفق", cur.lastrowid, label)
    return {"id": cur.lastrowid}


def r_attach_file(h, c, aid):
    h.need()
    a = c.execute("SELECT * FROM attachments WHERE id=?", (aid,)).fetchone()
    if not a or not a["stored_name"]:
        raise HTTPError(404, "لا يوجد ملف لهذا المرفق")
    with open(os.path.join(db.UPLOAD_DIR, a["stored_name"]), "rb") as f:
        data = f.read()
    h.send(200, data, "application/octet-stream",
           {"Content-Disposition": "attachment; filename*=UTF-8''" + urllib.parse.quote(a["orig_name"] or "file")})


def r_attach_delete(h, c, aid):
    h.need("secretary")
    a = c.execute("SELECT a.*,i.meeting_id FROM attachments a JOIN agenda_items i ON i.id=a.agenda_item_id WHERE a.id=?", (aid,)).fetchone()
    if not a:
        raise HTTPError(404, "المرفق غير موجود")
    h.editable(c, a["meeting_id"])
    if a["stored_name"]:
        try:
            os.remove(os.path.join(db.UPLOAD_DIR, a["stored_name"]))
        except OSError:
            pass
    c.execute("DELETE FROM attachments WHERE id=?", (aid,))
    db.audit(c, h.user, "حذف", "مرفق", aid, a["label"])
    return {"ok": True}


# --- المحضر
def r_organize(h, c, mid):
    h.need("secretary")
    h.editable(c, mid)
    b = h.body_json()
    notes = (b.get("raw_notes") or "").strip()
    if not notes:
        raise HTTPError(400, "أدخل الملاحظات الخام أو نص التفريغ أولاً. لا يُصاغ محضر من فراغ.")
    c.execute("UPDATE meetings SET raw_notes=? WHERE id=?", (notes, mid))
    m = compose(c, mid)
    agenda = [{"id": i["id"], "position": i["position"], "title": i["title"]} for i in m["items"]]
    names = sorted({a["name"] for a in m["attendance"]} | {r["name"] for r in c.execute("SELECT name FROM contacts")}
                   | {x for x in (m["chair"], m["secretary"]) if x})
    engine = b.get("engine") or "rules"
    if engine == "claude":
        st = organizer.llm_status()
        if not st["available"]:
            raise HTTPError(503, st["reason"])
        try:
            out = organizer.organize_llm(notes, agenda, names)
        except RuntimeError as e:
            raise HTTPError(502, str(e))
        except Exception as e:  # استجابة غير متوقعة من الخدمة
            raise HTTPError(502, f"تعذّر تنظيم الملاحظات عبر Claude: {type(e).__name__}")
    else:
        out = organizer.organize_rules(notes, agenda, names)
    db.audit(c, h.user, "تنظيم الملاحظات", "محضر", mid, out["engine_label"])
    return out


def clean_outcome(o):
    kind = o.get("kind") if o.get("kind") in organizer.KINDS else "قرار"
    due = (o.get("due_date") or "").strip()
    reasons = [str(x)[:300] for x in (o.get("confirm_reasons") or [])]
    if due and not valid_date(due):
        reasons.append(f"صيغة الموعد «{due}» غير صحيحة")
        o = {**o, "due_text": due}
        due = ""
    return {"kind": kind, "text": (o.get("text") or "").strip()[:5000], "owner": (o.get("owner") or "").strip()[:200],
            "due_date": due, "due_text": (o.get("due_text") or "").strip()[:200],
            "needs_confirm": 1 if (o.get("needs_confirm") or reasons) else 0,
            "confirm_reasons": json.dumps(reasons, ensure_ascii=False)}


def insert_decision(c, mid, iid, o, number=""):
    d = clean_outcome(o)
    if not d["text"]:
        raise HTTPError(400, "نص القرار مطلوب")
    t = db.now()
    return c.execute(
        "INSERT INTO decisions(meeting_id,agenda_item_id,number,kind,text,owner,due_date,due_text,needs_confirm,confirm_reasons,created_at,updated_at)"
        " VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
        (mid, iid, number, d["kind"], d["text"], d["owner"], d["due_date"], d["due_text"], d["needs_confirm"], d["confirm_reasons"], t, t)).lastrowid


def r_apply(h, c, mid):
    """تطبيق اقتراح المنظِّم بعد مراجعة المقرر له."""
    h.need("secretary")
    h.editable(c, mid)
    p = h.body_json().get("proposal") or {}
    ids = {r["id"]: r for r in c.execute("SELECT * FROM agenda_items WHERE meeting_id=?", (mid,))}
    n = 0
    for it in p.get("items") or []:
        row = ids.get(it.get("agenda_item_id"))
        if not row:
            continue
        disc = (it.get("discussion") or "").strip()
        if disc:
            merged = (row["discussion"].rstrip() + "\n" + disc) if (row["discussion"] or "").strip() else disc
            c.execute("UPDATE agenda_items SET discussion=? WHERE id=?", (merged, row["id"]))
        for o in it.get("outcomes") or []:
            insert_decision(c, mid, row["id"], o)
            n += 1
    un = p.get("unassigned") or {}
    for o in un.get("outcomes") or []:
        insert_decision(c, mid, None, {**o, "needs_confirm": True})
        n += 1
    manual = json.loads(c.execute("SELECT pending FROM meetings WHERE id=?", (mid,)).fetchone()["pending"] or "[]")
    if (un.get("discussion") or "").strip():
        manual.append("ملاحظات غير منسوبة إلى بند: " + un["discussion"].strip()[:1000])
    for x in p.get("pending") or []:
        # الملاحظات المتعلقة بقرارات تُشتق آلياً من القرارات نفسها؛ نحفظ هنا ما سواها
        if not re.match(r"^(قرار|توصية|إحاطة|تكليف) «", x) and x not in manual:
            manual.append(str(x)[:1000])
    c.execute("UPDATE meetings SET pending=?,updated_at=? WHERE id=?", (json.dumps(manual, ensure_ascii=False), db.now(), mid))
    db.audit(c, h.user, "تطبيق اقتراح المنظِّم", "محضر", mid, f"{n} مخرجات — {p.get('engine_label', '')}")
    snapshot(c, mid, h.user, "تطبيق اقتراح المنظِّم")
    return {"ok": True, "added": n}


def r_minutes_put(h, c, mid):
    h.need("secretary", "chair")
    h.editable(c, mid)
    b = h.body_json()
    d = {k: str(b[k]).strip()[:20000] for k in ("opening", "closing") if k in b}
    if "pending" in b:
        d["pending"] = json.dumps([str(x).strip()[:1000] for x in b["pending"] if str(x).strip()], ensure_ascii=False)
    if "raw_notes" in b and h.user["role"] == "secretary":
        d["raw_notes"] = str(b["raw_notes"])[:500000]
    if d:
        c.execute(f"UPDATE meetings SET {','.join(k + '=?' for k in d)},updated_at=? WHERE id=?", list(d.values()) + [db.now(), mid])
        db.audit(c, h.user, "تعديل", "محضر", mid, "، ".join(d))
        if set(d) - {"raw_notes"}:
            snapshot(c, mid, h.user, "تعديل نص المحضر")
    return {"ok": True}


def r_minutes_status(h, c, mid):
    h.need("secretary", "chair")
    new = h.body_json().get("status")
    m = compose(c, mid)
    cur = m["status"]
    role = h.user["role"]
    ok = ((cur, new) in (("draft", "review"), ("review", "draft")) or
          (role == "chair" and (cur, new) in (("review", "approved"), ("approved", "review"))))
    if not ok:
        raise HTTPError(403, "هذا الانتقال غير متاح. المسار: مسودة ← قيد المراجعة (المقرر أو الرئيس) ← معتمد (الرئيس فقط). وإعادة الفتح للرئيس فقط.")
    if new == "approved":
        if m["pending"]:
            raise HTTPError(409, f"لا يُعتمد المحضر وفيه {len(m['pending'])} نقطة «يحتاج تأكيد». عالجها أولاً.")
        c.execute("UPDATE meetings SET status='approved',approved_by=?,approved_at=?,updated_at=? WHERE id=?",
                  (h.user["name"], db.now(), db.now(), mid))
    else:
        c.execute("UPDATE meetings SET status=?,approved_by=NULL,approved_at=NULL,updated_at=? WHERE id=?", (new, db.now(), mid))
    db.audit(c, h.user, "تغيير حالة المحضر", "محضر", mid, f"{STATUS_LABEL[cur]} ← {STATUS_LABEL[new]}")
    snapshot(c, mid, h.user, f"الحالة: {STATUS_LABEL[cur]} ← {STATUS_LABEL[new]}")
    return {"ok": True}


def r_versions(h, c, mid):
    h.need()
    return [dict(r) for r in c.execute("SELECT id,note,user,ts FROM versions WHERE meeting_id=? ORDER BY id DESC", (mid,))]


def r_version(h, c, vid):
    h.need()
    r = c.execute("SELECT * FROM versions WHERE id=?", (vid,)).fetchone()
    if not r:
        raise HTTPError(404, "النسخة غير موجودة")
    return {"id": r["id"], "note": r["note"], "user": r["user"], "ts": r["ts"], "content": json.loads(r["content"])}


def r_export(h, c, mid, fmt):
    h.need()
    m = compose(c, mid)
    docx = export.build_docx(m)
    name = f"محضر-{m['number'] or mid}-{m['date'] or ''}-{STATUS_LABEL[m['status']]}"
    if fmt == "pdf":
        try:
            data, ctype = export.docx_to_pdf(docx), "application/pdf"
        except RuntimeError as e:
            raise HTTPError(501, str(e))
    else:
        data, ctype = docx, "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    db.audit(c, h.user, "تصدير", "محضر", mid, fmt)
    c.commit()
    h.send(200, data, ctype, {"Content-Disposition": "attachment; filename*=UTF-8''" + urllib.parse.quote(f"{name}.{fmt}")})


# --- القرارات
def r_decisions(h, c):
    h.need()
    q = organizer.normalize(h.q.get("q", ""))
    out = []
    for r in c.execute("SELECT d.*,m.number AS meeting_number,m.date AS meeting_date,m.status AS meeting_status,i.title AS item_title"
                       " FROM decisions d JOIN meetings m ON m.id=d.meeting_id LEFT JOIN agenda_items i ON i.id=d.agenda_item_id"
                       " ORDER BY m.date DESC,d.id DESC"):
        d = decision_dict(c, r)
        if h.q.get("status") and d["status"] != h.q["status"]:
            continue
        if h.q.get("overdue") == "1" and not d["overdue"]:
            continue
        if h.q.get("kind") and d["kind"] != h.q["kind"]:
            continue
        if h.q.get("from") and (d["meeting_date"] or "") < h.q["from"]:
            continue
        if h.q.get("to") and (d["meeting_date"] or "9999") > h.q["to"]:
            continue
        hay = organizer.normalize(" ".join([d["number"], d["text"], d["owner"], d["item_title"] or "", d["kind"]] + [f["note"] for f in d["followups"]]))
        if q and not all(w in hay for w in q.split()):
            continue
        out.append(d)
    return out


def r_decision_post(h, c, mid):
    h.need("secretary")
    h.editable(c, mid)
    b = h.body_json()
    iid = b.get("agenda_item_id")
    if iid and not c.execute("SELECT 1 FROM agenda_items WHERE id=? AND meeting_id=?", (iid, mid)).fetchone():
        raise HTTPError(400, "البند لا يتبع هذا الاجتماع")
    did = insert_decision(c, mid, iid or None, b, (b.get("number") or "").strip()[:40])
    db.audit(c, h.user, "إضافة", "قرار", did, b.get("text", "")[:200])
    snapshot(c, mid, h.user, "إضافة قرار")
    return {"id": did}


def decision_row(c, did):
    r = c.execute("SELECT d.*,m.status AS meeting_status FROM decisions d JOIN meetings m ON m.id=d.meeting_id WHERE d.id=?", (did,)).fetchone()
    if not r:
        raise HTTPError(404, "القرار غير موجود")
    return r


def r_decision_put(h, c, did):
    h.need("secretary", "chair")
    old = decision_row(c, did)
    b = h.body_json()
    d = {}
    # المتابعة (الحالة والملاحظات) متاحة دائماً؛ نص القرار وبياناته تُقفل باعتماد المحضر
    if "status" in b:
        if b["status"] not in DECISION_STATUS:
            raise HTTPError(400, "حالة غير معروفة")
        d["status"] = b["status"]
    content_keys = [k for k in ("number", "kind", "text", "owner", "due_date", "due_text", "needs_confirm", "agenda_item_id") if k in b]
    if content_keys:
        if h.user["role"] != "secretary":
            raise HTTPError(403, "تعديل نص القرار وبياناته للمقرر فقط")
        if old["meeting_status"] == "approved":
            raise HTTPError(409, "المحضر معتمد؛ نص القرار وبياناته مقفلة. يمكن تحديث الحالة وإضافة ملاحظات متابعة فقط.")
        merged = {**dict(old), **b}
        if "needs_confirm" in b and not b["needs_confirm"]:
            merged["needs_confirm"], merged["confirm_reasons"] = False, []
        else:
            merged["confirm_reasons"] = b.get("confirm_reasons") or json.loads(old["confirm_reasons"] or "[]")
        cl = clean_outcome(merged)
        if not cl["text"]:
            raise HTTPError(400, "نص القرار مطلوب")
        d.update(cl)
        d["number"] = str(merged.get("number") or "").strip()[:40]
        if "agenda_item_id" in b:
            iid = b["agenda_item_id"]
            if iid and not c.execute("SELECT 1 FROM agenda_items WHERE id=? AND meeting_id=?", (iid, old["meeting_id"])).fetchone():
                raise HTTPError(400, "البند لا يتبع هذا الاجتماع")
            d["agenda_item_id"] = iid or None
    if d:
        c.execute(f"UPDATE decisions SET {','.join(k + '=?' for k in d)},updated_at=? WHERE id=?", list(d.values()) + [db.now(), did])
        changes = {k: {"من": old[k], "إلى": v} for k, v in d.items() if str(old[k]) != str(v) and k != "confirm_reasons"}
        db.audit(c, h.user, "تعديل", "قرار", did, changes)
        if content_keys:
            snapshot(c, old["meeting_id"], h.user, "تعديل قرار")
    note = (b.get("followup") or "").strip()
    if note:
        c.execute("INSERT INTO followups(decision_id,note,user,ts) VALUES(?,?,?,?)", (did, note[:2000], h.user["name"], db.now()))
        db.audit(c, h.user, "ملاحظة متابعة", "قرار", did, note[:200])
    return {"ok": True}


def r_decision_delete(h, c, did):
    h.need("secretary")
    old = decision_row(c, did)
    if old["meeting_status"] == "approved":
        raise HTTPError(409, "لا يُحذف قرار من محضر معتمد")
    c.execute("DELETE FROM followups WHERE decision_id=?", (did,))
    c.execute("DELETE FROM decisions WHERE id=?", (did,))
    db.audit(c, h.user, "حذف", "قرار", did, {"number": old["number"], "text": old["text"]})
    snapshot(c, old["meeting_id"], h.user, "حذف قرار")
    return {"ok": True}


def r_decisions_number(h, c, mid):
    """ترقيم القرارات غير المرقمة: رقم الاجتماع/تسلسل. يُنفَّذ بطلب صريح من المقرر فقط."""
    h.need("secretary")
    h.editable(c, mid)
    m = c.execute("SELECT number FROM meetings WHERE id=?", (mid,)).fetchone()
    if not (m["number"] or "").strip():
        raise HTTPError(400, "أدخل رقم الاجتماع أولاً؛ الترقيم مبني عليه")
    rows = c.execute("SELECT d.id,d.number FROM decisions d LEFT JOIN agenda_items i ON i.id=d.agenda_item_id"
                     " WHERE d.meeting_id=? ORDER BY COALESCE(i.position,999),d.id", (mid,)).fetchall()
    used = {r["number"] for r in rows if r["number"]}
    seq, n = 0, 0
    for r in rows:
        if r["number"]:
            continue
        seq += 1
        while f"{m['number']}/{seq}" in used:
            seq += 1
        c.execute("UPDATE decisions SET number=? WHERE id=?", (f"{m['number']}/{seq}", r["id"]))
        used.add(f"{m['number']}/{seq}")
        n += 1
    db.audit(c, h.user, "ترقيم القرارات", "اجتماع", mid, f"{n} قرار")
    return {"ok": True, "numbered": n}


# --- البحث في الأرشيف
def r_search(h, c):
    h.need()
    q = organizer.normalize(h.q.get("q", ""))
    words = q.split()
    out = []
    for r in c.execute("SELECT id FROM meetings ORDER BY date DESC,id DESC").fetchall():
        m = compose(c, r["id"])
        if h.q.get("from") and (m["date"] or "") < h.q["from"]:
            continue
        if h.q.get("to") and (m["date"] or "9999") > h.q["to"]:
            continue
        if h.q.get("status") and m["status"] != h.q["status"]:
            continue
        hits = []
        fields = [("بيانات الاجتماع", " ".join(str(m.get(k) or "") for k in ("number", "type", "date", "hijri_date", "location", "chair", "secretary")))]
        for it in m["items"]:
            fields.append((f"البند {it['position']}: {it['title']}", " ".join([it["title"], it["presenter"], it["discussion"]] + [a["label"] for a in it["attachments"]])))
            for o in it["outcomes"]:
                fields.append((f"{o['kind']} {o['number']}".strip(), " ".join([o["number"], o["text"], o["owner"]])))
        for label, text in fields:
            if words and all(w in organizer.normalize(text) for w in words):
                hits.append({"where": label, "snippet": text.strip()[:220]})
        if not words or hits:
            out.append({"id": m["id"], "number": m["number"], "type": m["type"], "date": m["date"], "hijri_date": m["hijri_date"],
                        "status": m["status"], "status_label": m["status_label"], "hits": hits[:8]})
    return out


# --- جهات واتساب المعتمدة
def r_contacts(h, c):
    h.need("secretary", "chair")
    return [dict(r) for r in c.execute("SELECT * FROM contacts ORDER BY name")]


def clean_contact(b):
    name, phone = (b.get("name") or "").strip(), re.sub(r"[\s\-()]", "", b.get("phone") or "")
    if not name:
        raise HTTPError(400, "اسم المستلم مطلوب")
    if not whatsapp.valid_phone(phone):
        raise HTTPError(400, "رقم الجوال يجب أن يكون بالصيغة الدولية E.164، مثل ‎+9665XXXXXXXX")
    return name[:120], (b.get("title") or "").strip()[:120], phone, 1 if b.get("approved") else 0, (b.get("note") or "").strip()[:300]


def r_contact_post(h, c):
    h.need("secretary")
    v = clean_contact(h.body_json())
    cur = c.execute("INSERT INTO contacts(name,title,phone,approved,note) VALUES(?,?,?,?,?)", v)
    db.audit(c, h.user, "إضافة", "جهة واتساب", cur.lastrowid, {"name": v[0], "phone": v[2], "approved": v[3]})
    return {"id": cur.lastrowid}


def r_contact_put(h, c, cid):
    h.need("secretary")
    v = clean_contact(h.body_json())
    c.execute("UPDATE contacts SET name=?,title=?,phone=?,approved=?,note=? WHERE id=?", v + (cid,))
    c.execute("DELETE FROM wa_pending WHERE contact_id=?", (cid,))  # أي معاينة سابقة تبطل بتعديل الجهة
    db.audit(c, h.user, "تعديل", "جهة واتساب", cid, {"name": v[0], "phone": v[2], "approved": v[3]})
    return {"ok": True}


# --- واتساب: معاينة ثم موافقة صريحة ثم إرسال
WA_KINDS = {"meeting_reminder": "تذكير بموعد اجتماع", "decisions_reminder": "تذكير بالقرارات المفتوحة",
            "summary": "ملخص المحضر", "minutes_text": "مسودة المحضر (نص)", "document": "ملف المحضر", "custom": "رسالة حرة"}


def default_body(c, kind, m, contact):
    if kind == "meeting_reminder":
        L = [f"تذكير: اجتماع {m['committee_name']} {m['type'] or ''} رقم ({m['number'] or '—'})",
             f"التاريخ: {m['date'] or '—'} م | {m['hijri_date'] or '—'}", f"الوقت: {m['time'] or '—'}", f"المكان: {m['location'] or '—'}"]
        if m["items"]:
            L += ["", "جدول الأعمال:"] + [f"{i['position']}. {i['title']}" for i in m["items"]]
        return "\n".join(L)
    if kind == "decisions_reminder":
        rows = [decision_dict(c, r, False) for r in c.execute(
            "SELECT * FROM decisions WHERE status IN ('لم يبدأ','قيد التنفيذ')" + (" AND meeting_id=?" if m else ""), (m["id"],) if m else ())]
        cn = organizer.normalize(contact["name"])
        mine = [d for d in rows if d["owner"] and (organizer.normalize(d["owner"]) in cn or cn in organizer.normalize(d["owner"]))]
        rows = mine or rows
        L = ["تذكير بالقرارات والتكليفات المفتوحة" + (f" المسندة إلى {contact['name']}:" if mine else ":")]
        for d in rows:
            L.append(f"• {d['kind']} {d['number']}: {d['text']}".replace("  ", " ") +
                     (f" — الموعد: {d['due_date']}" if d["due_date"] else "") + (" (متأخر)" if d["overdue"] else ""))
        if len(L) == 1:
            L.append("لا توجد قرارات مفتوحة.")
        return "\n".join(L)
    if kind == "summary":
        return minutes_text(m, summary=True)
    if kind == "minutes_text":
        return minutes_text(m)
    if kind == "document":
        return f"مرفق {'مسودة ' if m['status'] != 'approved' else ''}محضر الاجتماع رقم ({m['number'] or '—'}) بتاريخ {m['date'] or '—'}" + \
               ("" if m["status"] == "approved" else " — للمراجعة، غير معتمد.")
    return ""


def r_wa_preview(h, c):
    """يبني الرسالة ويثبّتها في سجل مؤقت. لا يُرسل شيئاً."""
    h.need("secretary", "chair")
    b = h.body_json()
    kind = b.get("kind")
    if kind not in WA_KINDS:
        raise HTTPError(400, "نوع الرسالة غير معروف")
    contact = c.execute("SELECT * FROM contacts WHERE id=?", (b.get("contact_id"),)).fetchone()
    if not contact:
        raise HTTPError(400, "اختر مستلماً من قائمة الجهات")
    if not contact["approved"]:
        raise HTTPError(403, f"المستلم «{contact['name']}» غير معتمد للإرسال. يعتمده المقرر من صفحة الجهات أولاً.")
    if not whatsapp.valid_phone(contact["phone"]):
        raise HTTPError(400, "رقم المستلم ليس بالصيغة الدولية")
    mid = b.get("meeting_id")
    m = compose(c, mid) if mid else None
    if kind != "custom" and kind != "decisions_reminder" and not m:
        raise HTTPError(400, "اختر الاجتماع")
    body = (b.get("body") or "").strip() or default_body(c, kind, m, dict(contact))
    if not body:
        raise HTTPError(400, "نص الرسالة فارغ")
    limit = 1024 if kind == "document" else whatsapp.MAX_TEXT
    if len(body) > limit:
        raise HTTPError(400, f"نص الرسالة ({len(body)} حرفاً) يتجاوز حد واتساب ({limit}). اختصره، أو أرسل «ملخص المحضر» أو «ملف المحضر». لن يُقتطع النص آلياً.")
    fmt = None
    if kind == "document":
        fmt = "pdf" if export.soffice_path() else "docx"
    pid = secrets.token_urlsafe(18)
    exp = (dt.datetime.now().astimezone() + dt.timedelta(minutes=15)).isoformat(timespec="seconds")
    c.execute("DELETE FROM wa_pending WHERE expires<? OR user_id=?", (db.now(), h.user["id"]))
    c.execute("INSERT INTO wa_pending VALUES(?,?,?,?,?,?,?,?,?,?)",
              (pid, contact["id"], contact["name"], contact["phone"], kind, body, mid, fmt, h.user["id"], exp))
    st = whatsapp.public_status()
    return {"pending_id": pid, "name": contact["name"], "phone": contact["phone"], "kind": kind, "kind_label": WA_KINDS[kind],
            "body": body, "doc_format": fmt, "configured": st["configured"], "setup_message": st["message"], "mode": st["mode"],
            "template": st["template"], "expires": exp}


def r_wa_send(h, c):
    """يرسل بالضبط ما عُرض في المعاينة، بعد موافقة صريحة فقط."""
    h.need("secretary", "chair")
    b = h.body_json()
    if b.get("confirm") is not True:
        raise HTTPError(400, "الإرسال يتطلب موافقة صريحة")
    p = c.execute("SELECT * FROM wa_pending WHERE id=? AND user_id=? AND expires>?", (b.get("pending_id"), h.user["id"], db.now())).fetchone()
    if not p:
        raise HTTPError(410, "انتهت صلاحية المعاينة أو استُخدمت. أعد المعاينة.")
    contact = c.execute("SELECT * FROM contacts WHERE id=?", (p["contact_id"],)).fetchone()
    if not contact or not contact["approved"] or contact["phone"] != p["phone"] or contact["name"] != p["name"]:
        c.execute("DELETE FROM wa_pending WHERE id=?", (p["id"],))
        raise HTTPError(403, "تغيّرت بيانات المستلم أو أُلغي اعتماده بعد المعاينة. أعد المعاينة.")
    if not whatsapp.config()["configured"]:
        raise HTTPError(503, whatsapp.public_status()["message"])
    c.execute("DELETE FROM wa_pending WHERE id=?", (p["id"],))  # استخدام واحد فقط
    c.commit()
    status, msg_id, err = "أُرسل إلى المنصة", "", ""
    try:
        if p["kind"] == "document":
            m = compose(c, p["meeting_id"])
            docx = export.build_docx(m)
            if p["doc_format"] == "pdf":
                data, mime = export.docx_to_pdf(docx), "application/pdf"
            else:
                data, mime = docx, "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            fname = f"محضر-{m['number'] or m['id']}-{STATUS_LABEL[m['status']]}.{p['doc_format']}"
            msg_id = whatsapp.send_document(p["phone"], fname, data, mime, p["body"])
        else:
            msg_id = whatsapp.send_text(p["phone"], p["body"])
    except (whatsapp.WhatsAppError, RuntimeError) as e:
        status, err = "فشل", str(e)
    ts = db.now()
    c.execute("INSERT INTO wa_log(contact_id,name,phone,kind,body,meeting_id,status,wa_message_id,error,user,ts) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
              (p["contact_id"], p["name"], p["phone"], WA_KINDS[p["kind"]], p["body"], p["meeting_id"], status, msg_id, err, h.user["name"], ts))
    db.audit(c, h.user, "إرسال واتساب", "رسالة", msg_id or "-", {"to": p["name"], "phone": p["phone"], "kind": WA_KINDS[p["kind"]], "result": status, "error": err})
    return {"ok": status != "فشل", "status": status, "wa_message_id": msg_id, "error": err, "ts": ts,
            "note": "قبول المنصة للرسالة لا يعني تسليمها؛ حالة التسليم والقراءة تتطلب Webhook غير مُنفَّذ في هذه النسخة."}


def r_wa_log(h, c):
    h.need("secretary", "chair")
    return [dict(r) for r in c.execute("SELECT * FROM wa_log ORDER BY id DESC LIMIT 200")]


def r_audit(h, c):
    h.need("secretary", "chair")
    q = organizer.normalize(h.q.get("q", ""))
    rows = [dict(r) for r in c.execute("SELECT * FROM audit_log ORDER BY id DESC LIMIT 1000")]
    return [r for r in rows if not q or q in organizer.normalize(" ".join(str(v) for v in r.values()))][:300]


def backup_bytes():
    tmp = os.path.join(db.DATA_DIR, f".backup-{uuid.uuid4().hex}.db")
    src, dst = db.connect(), sqlite3.connect(tmp)
    try:
        src.backup(dst)
    finally:
        dst.close()
        src.close()
    with open(tmp, "rb") as f:
        data = f.read()
    os.remove(tmp)
    return data


def r_backup(h, c):
    h.need("secretary")
    db.audit(c, h.user, "نسخة احتياطية", "قاعدة البيانات")
    c.commit()
    h.send(200, backup_bytes(), "application/octet-stream",
           {"Content-Disposition": f'attachment; filename="secretary-backup-{today()}.db"'})


ROUTES = [
    ("POST", r"/api/login", r_login), ("POST", r"/api/logout", r_logout), ("GET", r"/api/me", r_me),
    ("POST", r"/api/password", r_password), ("PUT", r"/api/settings", r_settings_put),
    ("GET", r"/api/users", r_users), ("POST", r"/api/users", r_user_post), ("PUT", r"/api/users/(\d+)", r_user_put),
    ("GET", r"/api/meetings", r_meetings), ("POST", r"/api/meetings", r_meeting_post),
    ("GET", r"/api/meetings/(\d+)", r_meeting_get), ("PUT", r"/api/meetings/(\d+)", r_meeting_put),
    ("POST", r"/api/meetings/(\d+)/agenda", r_agenda_post), ("POST", r"/api/meetings/(\d+)/agenda/reorder", r_agenda_reorder),
    ("PUT", r"/api/agenda/(\d+)", r_agenda_put), ("DELETE", r"/api/agenda/(\d+)", r_agenda_delete),
    ("POST", r"/api/agenda/(\d+)/attachments", r_attach_post), ("GET", r"/api/attachments/(\d+)/file", r_attach_file),
    ("DELETE", r"/api/attachments/(\d+)", r_attach_delete),
    ("POST", r"/api/meetings/(\d+)/organize", r_organize), ("POST", r"/api/meetings/(\d+)/apply", r_apply),
    ("PUT", r"/api/meetings/(\d+)/minutes", r_minutes_put), ("POST", r"/api/meetings/(\d+)/minutes/status", r_minutes_status),
    ("GET", r"/api/meetings/(\d+)/versions", r_versions), ("GET", r"/api/versions/(\d+)", r_version),
    ("GET", r"/api/meetings/(\d+)/export\.(docx|pdf)", r_export),
    ("GET", r"/api/decisions", r_decisions), ("POST", r"/api/meetings/(\d+)/decisions", r_decision_post),
    ("POST", r"/api/meetings/(\d+)/decisions/number", r_decisions_number),
    ("PUT", r"/api/decisions/(\d+)", r_decision_put), ("DELETE", r"/api/decisions/(\d+)", r_decision_delete),
    ("GET", r"/api/search", r_search),
    ("GET", r"/api/contacts", r_contacts), ("POST", r"/api/contacts", r_contact_post), ("PUT", r"/api/contacts/(\d+)", r_contact_put),
    ("POST", r"/api/whatsapp/preview", r_wa_preview), ("POST", r"/api/whatsapp/send", r_wa_send), ("GET", r"/api/whatsapp/log", r_wa_log),
    ("GET", r"/api/audit", r_audit), ("GET", r"/api/backup", r_backup),
]


def main():
    db.init()
    if len(sys.argv) > 1 and sys.argv[1] == "backup":
        out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(BASE, f"secretary-backup-{today()}.db")
        with open(out, "wb") as f:
            f.write(backup_bytes())
        print(f"حُفظت النسخة الاحتياطية في: {out}\nتذكير: انسخ أيضاً مجلد المرفقات: {db.UPLOAD_DIR}")
        return
    host, port = os.environ.get("HOST", "127.0.0.1"), int(os.environ.get("PORT", "8765"))
    srv = ThreadingHTTPServer((host, port), Handler)
    print(f"سكرتير اللجنة التنفيذية يعمل على: http://{host}:{port}")
    print(whatsapp.public_status()["message"] or "تكامل واتساب مُعدّ.")
    if host not in ("127.0.0.1", "localhost"):
        print("تنبيه: الخادم مكشوف على الشبكة دون تشفير. ضعه خلف HTTPS (وكيل عكسي) واضبط COOKIE_SECURE=1.")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
