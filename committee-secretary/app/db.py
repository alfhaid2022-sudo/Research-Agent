"""قاعدة البيانات (SQLite) والبيانات التجريبية."""
import datetime as dt
import hashlib
import json
import os
import secrets
import sqlite3

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.environ.get("DATA_DIR") or os.path.join(BASE, "data")
DB_PATH = os.path.join(DATA_DIR, "secretary.db")
UPLOAD_DIR = os.path.join(DATA_DIR, "uploads")

SCHEMA = """
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY, username TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('secretary','chair','member')),
  salt TEXT NOT NULL, pw_hash TEXT NOT NULL, demo_password INTEGER DEFAULT 0, active INTEGER DEFAULT 1);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, user_id INTEGER NOT NULL, expires TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE IF NOT EXISTS meetings(
  id INTEGER PRIMARY KEY, number TEXT, type TEXT, date TEXT, time TEXT, end_time TEXT, location TEXT,
  hijri_date TEXT, hijri_source TEXT, chair TEXT, secretary TEXT, attendance TEXT DEFAULT '[]',
  opening TEXT DEFAULT '', closing TEXT DEFAULT '', pending TEXT DEFAULT '[]', raw_notes TEXT DEFAULT '',
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft','review','approved')),
  approved_by TEXT, approved_at TEXT, created_at TEXT, updated_at TEXT);
CREATE TABLE IF NOT EXISTS agenda_items(
  id INTEGER PRIMARY KEY, meeting_id INTEGER NOT NULL REFERENCES meetings(id),
  position INTEGER NOT NULL, title TEXT NOT NULL, presenter TEXT DEFAULT '', discussion TEXT DEFAULT '');
CREATE TABLE IF NOT EXISTS attachments(
  id INTEGER PRIMARY KEY, agenda_item_id INTEGER NOT NULL REFERENCES agenda_items(id),
  label TEXT NOT NULL, ref TEXT DEFAULT '', stored_name TEXT, orig_name TEXT, size INTEGER, created_at TEXT);
CREATE TABLE IF NOT EXISTS decisions(
  id INTEGER PRIMARY KEY, meeting_id INTEGER NOT NULL REFERENCES meetings(id), agenda_item_id INTEGER,
  number TEXT DEFAULT '', kind TEXT DEFAULT 'قرار', text TEXT NOT NULL, owner TEXT DEFAULT '',
  due_date TEXT DEFAULT '', due_text TEXT DEFAULT '', status TEXT DEFAULT 'لم يبدأ',
  needs_confirm INTEGER DEFAULT 0, confirm_reasons TEXT DEFAULT '[]', created_at TEXT, updated_at TEXT);
CREATE TABLE IF NOT EXISTS followups(
  id INTEGER PRIMARY KEY, decision_id INTEGER NOT NULL REFERENCES decisions(id), note TEXT NOT NULL, user TEXT, ts TEXT);
CREATE TABLE IF NOT EXISTS versions(
  id INTEGER PRIMARY KEY, meeting_id INTEGER NOT NULL, content TEXT NOT NULL, note TEXT, user TEXT, ts TEXT);
CREATE TABLE IF NOT EXISTS contacts(
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, title TEXT DEFAULT '', phone TEXT NOT NULL, approved INTEGER DEFAULT 0, note TEXT DEFAULT '');
CREATE TABLE IF NOT EXISTS wa_pending(
  id TEXT PRIMARY KEY, contact_id INTEGER NOT NULL, name TEXT, phone TEXT, kind TEXT, body TEXT,
  meeting_id INTEGER, doc_format TEXT, user_id INTEGER, expires TEXT);
CREATE TABLE IF NOT EXISTS wa_log(
  id INTEGER PRIMARY KEY, contact_id INTEGER, name TEXT, phone TEXT, kind TEXT, body TEXT, meeting_id INTEGER,
  status TEXT, wa_message_id TEXT, error TEXT, user TEXT, ts TEXT);
CREATE TABLE IF NOT EXISTS audit_log(
  id INTEGER PRIMARY KEY, ts TEXT, user TEXT, role TEXT, action TEXT, entity TEXT, entity_id TEXT, details TEXT);
"""


def now():
    return dt.datetime.now().astimezone().isoformat(timespec="seconds")


def connect():
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    c = sqlite3.connect(DB_PATH, timeout=15)
    c.row_factory = sqlite3.Row
    c.execute("PRAGMA journal_mode=WAL")
    c.execute("PRAGMA foreign_keys=ON")
    return c


def hash_pw(password, salt=None):
    salt = salt or secrets.token_hex(16)
    h = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), 200_000).hex()
    return salt, h


def audit(c, user, action, entity, entity_id="", details=""):
    c.execute("INSERT INTO audit_log(ts,user,role,action,entity,entity_id,details) VALUES(?,?,?,?,?,?,?)",
              (now(), user["name"] if user else "النظام", user["role"] if user else "", action, entity,
               str(entity_id), details if isinstance(details, str) else json.dumps(details, ensure_ascii=False)))


def init():
    c = connect()
    c.executescript(SCHEMA)
    if c.execute("SELECT COUNT(*) FROM users").fetchone()[0] == 0:
        if os.environ.get("SEED_DEMO", "1") == "1":
            seed_demo(c)
        else:
            pw = secrets.token_urlsafe(9)
            s, h = hash_pw(pw)
            c.execute("INSERT INTO users(username,name,role,salt,pw_hash) VALUES('muqarrir','مقرر اللجنة','secretary',?,?)", (s, h))
            print(f"[إعداد] أُنشئ حساب المقرر: muqarrir / {pw}  — غيّر كلمة المرور بعد الدخول.")
        for k, v in (("org_name", "جمعية أهلية (اسم تجريبي — عدّله من الإعدادات)"), ("committee_name", "اللجنة التنفيذية")):
            c.execute("INSERT OR IGNORE INTO settings VALUES(?,?)", (k, v))
    c.commit()
    c.close()


# ------------------------------------------------------------------ بيانات تجريبية (غير حقيقية)
DEMO_PASSWORD = "demo-1234"
HIJRI_SEED_SRC = "تقويم أم القرى عبر محرك Intl (بيانات ICU) — حُسب عند إعداد البيانات التجريبية"


def seed_demo(c):
    t = now()
    for u, n, r in (("muqarrir", "سالم التجريبي (المقرر)", "secretary"),
                    ("raees", "منصور التجريبي (الرئيس)", "chair"),
                    ("odw", "نورة التجريبية (عضو)", "member")):
        s, h = hash_pw(DEMO_PASSWORD)
        c.execute("INSERT INTO users(username,name,role,salt,pw_hash,demo_password) VALUES(?,?,?,?,?,1)", (u, n, r, s, h))
    people = [("منصور التجريبي", "رئيس اللجنة"), ("سالم التجريبي", "مقرر اللجنة"), ("نورة التجريبية", "عضو"),
              ("فهد التجريبي", "عضو"), ("هند التجريبية", "المدير التنفيذي")]
    # أرقام وهمية وغير معتمدة عمداً: لا يمكن الإرسال إليها قبل إدخال رقم حقيقي واعتماده.
    for i, (n, ti) in enumerate(people, 1):
        c.execute("INSERT INTO contacts(name,title,phone,approved,note) VALUES(?,?,?,0,?)",
                  (n, ti, f"+96650000000{i}", "رقم وهمي تجريبي — استبدله ثم اعتمده"))

    def att(statuses):
        return json.dumps([{"name": n, "title": ti, "status": s} for (n, ti), s in zip(people, statuses)], ensure_ascii=False)

    def meeting(number, typ, date, hij, status, statuses, opening="", closing="", approved=False):
        cur = c.execute(
            "INSERT INTO meetings(number,type,date,time,end_time,location,hijri_date,hijri_source,chair,secretary,attendance,"
            "opening,closing,status,approved_by,approved_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            (number, typ, date, "16:30", "18:00", "قاعة الاجتماعات بمقر الجمعية (تجريبي)", hij, HIJRI_SEED_SRC,
             "منصور التجريبي", "سالم التجريبي", att(statuses), opening, closing, status,
             "منصور التجريبي (الرئيس)" if approved else None, t if approved else None, t, t))
        return cur.lastrowid

    def item(mid, pos, title, presenter, discussion=""):
        return c.execute("INSERT INTO agenda_items(meeting_id,position,title,presenter,discussion) VALUES(?,?,?,?,?)",
                         (mid, pos, title, presenter, discussion)).lastrowid

    def dec(mid, iid, number, kind, text, owner, due, status, confirm=None):
        return c.execute(
            "INSERT INTO decisions(meeting_id,agenda_item_id,number,kind,text,owner,due_date,status,needs_confirm,confirm_reasons,created_at,updated_at)"
            " VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
            (mid, iid, number, kind, text, owner, due, status, 1 if confirm else 0,
             json.dumps(confirm or [], ensure_ascii=False), t, t)).lastrowid

    op = "افتتح رئيس الاجتماع الجلسة بعد اكتمال النصاب، ثم شرعت اللجنة في مناقشة جدول الأعمال."
    cl = "وحيث لم يكن هناك ما يستجد من أعمال، اختُتم الاجتماع في الوقت المدوَّن أعلاه."
    m1 = meeting("1", "عادي", "2026-10-12", "1 جمادى الأولى 1448 هـ", "approved", ["حاضر", "حاضر", "حاضر", "معتذر", "حاضر"], op, cl, True)
    a = item(m1, 1, "خطة الأنشطة للربع القادم (تجريبي)", "هند التجريبية", "عرضت المدير التنفيذي مسودة الخطة، وناقش الأعضاء أولويات التنفيذ والموارد المتاحة.")
    c.execute("INSERT INTO attachments(agenda_item_id,label,ref,created_at) VALUES(?,?,?,?)", (a, "مذكرة خطة الأنشطة رقم (ت/1) — تجريبية", "ت/1", t))
    d1 = dec(m1, a, "1/1", "قرار", "اعتماد خطة الأنشطة للربع القادم مع الأخذ بملاحظات الأعضاء.", "هند التجريبية", "2026-10-31", "منجز")
    dec(m1, a, "1/2", "تكليف", "إعداد تقرير متابعة شهري عن تنفيذ الخطة وعرضه على اللجنة.", "هند التجريبية", "2026-11-15", "قيد التنفيذ")
    b = item(m1, 2, "تحديث لائحة المتطوعين (تجريبي)", "نورة التجريبية", "استعرضت العضو مقترح التحديث، ورأت اللجنة حاجته إلى مراجعة إضافية.")
    dec(m1, b, "1/3", "توصية", "مراجعة مقترح لائحة المتطوعين وإعادة عرضه في اجتماع قادم.", "نورة التجريبية", "2026-11-05", "لم يبدأ")
    c.execute("INSERT INTO followups(decision_id,note,user,ts) VALUES(?,?,?,?)", (d1, "نُفّذ القرار وأُبلغت الإدارة التنفيذية (ملاحظة تجريبية).", "سالم التجريبي (المقرر)", t))

    m2 = meeting("2", "عادي", "2026-11-09", "29 جمادى الأولى 1448 هـ", "review", ["حاضر", "حاضر", "معتذر", "حاضر", "حاضر"], op, cl)
    a = item(m2, 1, "متابعة قرارات الاجتماع السابق (تجريبي)", "سالم التجريبي", "استعرض المقرر موقف تنفيذ قرارات الاجتماع الأول.")
    dec(m2, a, "2/1", "إحاطة", "أحيطت اللجنة بموقف تنفيذ قرارات الاجتماع الأول.", "", "", "منجز")
    b = item(m2, 2, "مبادرة كسوة الشتاء (تجريبي)", "فهد التجريبي", "قدّم العضو تصوراً للمبادرة، ودار نقاش حول آلية التوزيع ومصادر التمويل.")
    dec(m2, b, "2/2", "قرار", "الموافقة المبدئية على مبادرة كسوة الشتاء.", "فهد التجريبي", "", "قيد التنفيذ",
        ["الموعد غير محدد بتاريخ («قبل دخول الشتاء»)", "لم يتضح هل الموافقة نهائية أم مبدئية"])

    m3 = meeting("3", "عادي", "2026-12-07", "27 جمادى الآخرة 1448 هـ", "draft", ["", "", "", "", ""])
    item(m3, 1, "متابعة قرارات الاجتماع السابق (تجريبي)", "سالم التجريبي")
    item(m3, 2, "مشروع الموازنة التقديرية (تجريبي)", "هند التجريبية")
    item(m3, 3, "ما يستجد من أعمال", "")
    c.execute("UPDATE meetings SET raw_notes=? WHERE id=?", (
        "البند الأول: متابعة قرارات الاجتماع السابق\n"
        "عرض المقرر الموقف وذكر أن تقرير المتابعة الشهري تأخر\n"
        "مشروع الموازنة التقديرية\n"
        "عرضت المدير التنفيذي المشروع وناقش الأعضاء بند المصروفات التشغيلية\n"
        "قرار: اعتماد مشروع الموازنة بعد تعديل بند المصروفات، المسؤول: هند التجريبية، الموعد 2026-12-20\n"
        "توصية: دراسة تنويع مصادر الدخل ربما في الربع القادم\n"
        "يكلف خالد بإعداد عرض عن الأوقاف قبل نهاية الشهر\n", m3))
    audit(c, None, "تهيئة", "النظام", "", "أُنشئت بيانات تجريبية غير حقيقية")
