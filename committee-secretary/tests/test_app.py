"""اختبارات تكاملية: python3 -m unittest discover -s tests -v
تشغّل الخادم على منفذ مؤقت بقاعدة بيانات مؤقتة، وخادماً وهمياً يحاكي Graph API (لا اتصال حقيقي بواتساب)."""
import json
import os
import sys
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
import zipfile
import io
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TMP = tempfile.mkdtemp()
os.environ.update(DATA_DIR=TMP, QUIET="1", SEED_DEMO="1")
for k in ("WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_TEMPLATE_NAME", "ANTHROPIC_API_KEY"):
    os.environ.pop(k, None)
sys.path.insert(0, ROOT)
import server  # noqa: E402
from app import db, hijri, organizer  # noqa: E402

GRAPH_CALLS = []


class FakeGraph(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def do_POST(self):
        body = self.rfile.read(int(self.headers["Content-Length"]))
        GRAPH_CALLS.append((self.path, self.headers.get("Authorization"), self.headers.get("Content-Type"), body))
        out = {"id": "MEDIA1"} if self.path.endswith("/media") else {"messages": [{"id": "wamid.TEST"}]}
        data = json.dumps(out).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


class Client:
    def __init__(self, base):
        self.base, self.cookie = base, ""

    def req(self, method, path, body=None, headers=None, raw=False):
        h = {"X-Requested-With": "secretary-app", "Cookie": self.cookie, **(headers or {})}
        data = None
        if body is not None:
            data = body if isinstance(body, bytes) else json.dumps(body).encode()
            h.setdefault("Content-Type", "application/json")
        r = urllib.request.Request(self.base + path, data=data, method=method, headers=h)
        try:
            with urllib.request.urlopen(r) as resp:
                if resp.headers.get("Set-Cookie"):
                    self.cookie = resp.headers["Set-Cookie"].split(";")[0]
                content = resp.read()
                return resp.status, content if raw else json.loads(content)
        except urllib.error.HTTPError as e:
            data = e.read()
            e.close()
            try:
                return e.code, json.loads(data or b"{}")
            except ValueError:
                return e.code, {}

    def login(self, u, p=db.DEMO_PASSWORD):
        return self.req("POST", "/api/login", {"username": u, "password": p})


class AppTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        db.init()
        cls.srv = ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)
        cls.graph = ThreadingHTTPServer(("127.0.0.1", 0), FakeGraph)
        for s in (cls.srv, cls.graph):
            threading.Thread(target=s.serve_forever, daemon=True).start()
        base = f"http://127.0.0.1:{cls.srv.server_port}"
        cls.sec, cls.chair, cls.mem = Client(base), Client(base), Client(base)
        assert cls.sec.login("muqarrir")[0] == 200
        assert cls.chair.login("raees")[0] == 200
        assert cls.mem.login("odw")[0] == 200

    @classmethod
    def tearDownClass(cls):
        for s in (cls.srv, cls.graph):
            s.shutdown()
            s.server_close()

    # --- الدخول والصلاحيات
    def test_auth_required_and_bad_password(self):
        anon = Client(self.sec.base)
        self.assertEqual(anon.req("GET", "/api/meetings")[0], 401)
        self.assertEqual(anon.login("muqarrir", "wrong")[0], 401)

    def test_csrf_header_required(self):
        r = urllib.request.Request(self.sec.base + "/api/meetings", data=b"{}", method="POST", headers={"Cookie": self.sec.cookie, "Content-Type": "application/json"})
        with self.assertRaises(urllib.error.HTTPError) as e:
            urllib.request.urlopen(r)
        self.assertEqual(e.exception.code, 403)

    def test_member_is_read_only(self):
        self.assertEqual(self.mem.req("GET", "/api/meetings")[0], 200)
        self.assertEqual(self.mem.req("POST", "/api/meetings", {"number": "9"})[0], 403)
        self.assertEqual(self.mem.req("PUT", "/api/decisions/1", {"status": "منجز"})[0], 403)
        self.assertEqual(self.mem.req("GET", "/api/contacts")[0], 403)
        self.assertEqual(self.mem.req("GET", "/api/backup")[0], 403)

    def test_path_traversal_blocked(self):
        for path in ("/%2e%2e/server.py", "/../server.py", "/..%2f.env.example"):
            self.assertEqual(Client(self.sec.base).req("GET", path)[0], 404)

    # --- التاريخ الهجري
    def test_hijri_fallback_is_labelled(self):
        s, r = self.sec.req("POST", "/api/meetings", {"number": "H1", "date": "2026-11-23"})
        m = self.sec.req("GET", f"/api/meetings/{r['id']}")[1]
        self.assertIn("1448", m["hijri_date"])
        self.assertEqual(m["hijri_source"], hijri.SOURCE_TABULAR)
        self.assertIn("يحتاج تأكيد", m["hijri_source"])

    # --- المنظِّم لا يختلق
    def test_organizer_no_fabrication_and_flags(self):
        agenda = [{"id": 1, "position": 1, "title": "الموازنة"}, {"id": 2, "position": 2, "title": "ما يستجد"}]
        notes = "البند 1: الموازنة\nنقاش عام حول الأرقام\nقرار: اعتماد الموازنة\nيكلف خالد بإعداد عرض قبل نهاية الشهر\nقرار: شراء أجهزة، المسؤول: سالم، الموعد 2026-12-20"
        out = organizer.organize_rules(notes, agenda, ["سالم"])
        o = out["items"][0]["outcomes"]
        self.assertEqual(len(o), 3)
        self.assertEqual((o[0]["owner"], o[0]["due_date"]), ("", ""))       # لم يُذكرا فلا يُخترعان
        self.assertTrue(o[0]["needs_confirm"])
        self.assertTrue(o[1]["needs_confirm"])                               # اسم غير معروف + موعد مبهم
        self.assertEqual(o[1]["due_date"], "")
        self.assertEqual((o[2]["owner"], o[2]["due_date"], o[2]["needs_confirm"]), ("سالم", "2026-12-20", False))
        every = json.dumps(out, ensure_ascii=False)
        for o_ in o:                                                         # كل نص مخرج مأخوذ من الملاحظات حرفياً
            self.assertIn(o_["text"], notes)
        self.assertTrue(any("ما يستجد" in p for p in out["pending"]))        # بند بلا ملاحظات يُنبَّه عليه
        self.assertNotIn("تصويت", every)

    # --- دورة المحضر الكاملة
    def test_minutes_lifecycle(self):
        mid = self.sec.req("POST", "/api/meetings", {"number": "77", "type": "عادي", "date": "2026-12-01", "location": "المقر", "chair": "منصور", "secretary": "سالم",
                                                    "hijri_date": "22 جمادى الآخرة 1448 هـ", "hijri_source": "إدخال يدوي"})[1]["id"]
        self.sec.req("PUT", f"/api/meetings/{mid}", {"attendance": [{"name": "منصور", "title": "رئيس", "status": "حاضر"}, {"name": "سالم", "title": "مقرر", "status": "معتذر"}]})
        a = self.sec.req("POST", f"/api/meetings/{mid}/agenda", {"title": "الموازنة", "presenter": "سالم"})[1]["id"]
        b = self.sec.req("POST", f"/api/meetings/{mid}/agenda", {"title": "المتطوعون"})[1]["id"]
        self.assertEqual(self.sec.req("POST", f"/api/meetings/{mid}/agenda/reorder", {"ids": [b, a]})[0], 200)
        m = self.sec.req("GET", f"/api/meetings/{mid}")[1]
        self.assertEqual([i["title"] for i in m["items"]], ["المتطوعون", "الموازنة"])
        self.assertEqual(self.sec.req("POST", f"/api/agenda/{a}/attachments", {"label": "مذكرة 5", "ref": "5/ت"})[0], 200)
        s, up = self.sec.req("POST", f"/api/agenda/{a}/attachments", b"PDFDATA", {"Content-Type": "application/octet-stream", "X-Filename": "memo.pdf"})
        self.assertEqual(self.sec.req("GET", f"/api/attachments/{up['id']}/file", raw=True)[1], b"PDFDATA")
        # ملاحظات فارغة تُرفض
        self.assertEqual(self.sec.req("POST", f"/api/meetings/{mid}/organize", {"raw_notes": " "})[0], 400)
        s, prop = self.sec.req("POST", f"/api/meetings/{mid}/organize", {"raw_notes": "الموازنة\nعرض سالم المشروع\nقرار: اعتماد الموازنة ربما بعد التعديل"})
        self.assertEqual(s, 200)
        self.assertEqual(self.sec.req("POST", f"/api/meetings/{mid}/apply", {"proposal": prop})[1]["added"], 1)
        m = self.sec.req("GET", f"/api/meetings/{mid}")[1]
        dec = m["items"][1]["outcomes"][0]
        self.assertTrue(dec["needs_confirm"] and m["pending"])
        self.assertEqual(dec["number"], "")                                  # لا ترقيم آلي دون طلب
        # الاعتماد: المقرر لا يعتمد، والرئيس لا يعتمد مع وجود «يحتاج تأكيد»
        self.assertEqual(self.sec.req("POST", f"/api/meetings/{mid}/minutes/status", {"status": "review"})[0], 200)
        self.assertEqual(self.sec.req("POST", f"/api/meetings/{mid}/minutes/status", {"status": "approved"})[0], 403)
        self.assertEqual(self.chair.req("POST", f"/api/meetings/{mid}/minutes/status", {"status": "approved"})[0], 409)
        self.sec.req("PUT", f"/api/decisions/{dec['id']}", {"text": "اعتماد الموازنة بعد التعديل", "owner": "سالم", "due_date": "2020-01-01", "needs_confirm": False})
        self.sec.req("PUT", f"/api/meetings/{mid}/minutes", {"pending": []})
        self.sec.req("PUT", f"/api/agenda/{b}", {"discussion": "أُجّل البند."})
        self.assertEqual(self.sec.req("POST", f"/api/meetings/{mid}/decisions/number", {})[1]["numbered"], 1)
        m = self.sec.req("GET", f"/api/meetings/{mid}")[1]
        self.assertEqual(m["pending"], [])
        self.assertEqual(m["items"][1]["outcomes"][0]["number"], "77/1")
        self.assertTrue(m["items"][1]["outcomes"][0]["overdue"])            # موعد فائت وحالة مفتوحة
        self.assertEqual(self.chair.req("POST", f"/api/meetings/{mid}/minutes/status", {"status": "approved"})[0], 200)
        # بعد الاعتماد: النص مقفل، والمتابعة متاحة
        self.assertEqual(self.sec.req("PUT", f"/api/agenda/{a}", {"discussion": "x"})[0], 409)
        self.assertEqual(self.sec.req("PUT", f"/api/decisions/{dec['id']}", {"text": "تحريف"})[0], 409)
        self.assertEqual(self.chair.req("PUT", f"/api/decisions/{dec['id']}", {"status": "منجز", "followup": "نُفّذ"})[0], 200)
        d = [x for x in self.sec.req("GET", "/api/decisions?q=77/1")[1]]
        self.assertEqual((len(d), d[0]["status"], d[0]["overdue"], d[0]["followups"][0]["note"]), (1, "منجز", False, "نُفّذ"))
        # النسخ وسجل التعديلات
        self.assertGreaterEqual(len(self.sec.req("GET", f"/api/meetings/{mid}/versions")[1]), 4)
        audit = self.sec.req("GET", "/api/audit?q=" + urllib.request.quote("تغيير حالة المحضر"))[1]
        self.assertTrue(any("معتمد" in r["details"] for r in audit))
        # البحث مع توحيد الهمزات والتاء المربوطة
        hits = self.sec.req("GET", "/api/search?q=" + urllib.request.quote("الموازنه") + "&from=2026-12-01&to=2026-12-01")[1]
        self.assertEqual([x["number"] for x in hits], ["77"])
        # التصدير
        s, docx = self.sec.req("GET", f"/api/meetings/{mid}/export.docx", raw=True)
        xml = zipfile.ZipFile(io.BytesIO(docx)).read("word/document.xml").decode()
        self.assertIn("اعتماد الموازنة بعد التعديل", xml)
        self.assertIn("<w:bidi/>", xml)
        self.assertNotIn("غير معتمدة", xml)

    def test_overdue_alert_in_seed(self):
        od = self.sec.req("GET", "/api/decisions?overdue=1")[1]
        self.assertTrue(od and all(d["overdue"] for d in od))

    # --- واتساب
    def test_whatsapp_gates(self):
        s, c = self.sec.req("POST", "/api/contacts", {"name": "جهة اختبار", "phone": "0501234567", "approved": True})
        self.assertEqual(s, 400)                                             # ليست صيغة دولية
        cid = self.sec.req("POST", "/api/contacts", {"name": "جهة اختبار", "phone": "+966 50 000 0099", "approved": False})[1]["id"]
        body = {"contact_id": cid, "kind": "custom", "body": "تذكير تجريبي"}
        self.assertEqual(self.sec.req("POST", "/api/whatsapp/preview", body)[0], 403)   # غير معتمد
        self.sec.req("PUT", f"/api/contacts/{cid}", {"name": "جهة اختبار", "phone": "+966500000099", "approved": True})
        s, p = self.sec.req("POST", "/api/whatsapp/preview", body)
        self.assertEqual((s, p["name"], p["phone"], p["body"], p["configured"]), (200, "جهة اختبار", "+966500000099", "تذكير تجريبي", False))
        self.assertIn("WHATSAPP_ACCESS_TOKEN", p["setup_message"])
        # بلا موافقة صريحة لا إرسال؛ وبلا إعداد رسالة واضحة
        self.assertEqual(self.sec.req("POST", "/api/whatsapp/send", {"pending_id": p["pending_id"]})[0], 400)
        self.assertEqual(self.sec.req("POST", "/api/whatsapp/send", {"pending_id": p["pending_id"], "confirm": True})[0], 503)
        self.assertEqual(GRAPH_CALLS, [])
        # مع الإعداد (نحو خادم وهمي)
        os.environ.update(WHATSAPP_ACCESS_TOKEN="TESTTOKEN", WHATSAPP_PHONE_NUMBER_ID="111", WHATSAPP_API_BASE=f"http://127.0.0.1:{self.graph.server_port}")
        try:
            # معاينة مستخدم آخر لا تُستعمل
            self.assertEqual(self.chair.req("POST", "/api/whatsapp/send", {"pending_id": p["pending_id"], "confirm": True})[0], 410)
            s, r = self.sec.req("POST", "/api/whatsapp/send", {"pending_id": p["pending_id"], "confirm": True})
            self.assertEqual((s, r["ok"], r["wa_message_id"]), (200, True, "wamid.TEST"))
            path, auth, _, raw = GRAPH_CALLS[-1]
            sent = json.loads(raw)
            self.assertEqual((path, auth, sent["to"], sent["type"], sent["text"]["body"]), ("/v21.0/111/messages", "Bearer TESTTOKEN", "966500000099", "text", "تذكير تجريبي"))
            # المعاينة تُستخدم مرة واحدة
            self.assertEqual(self.sec.req("POST", "/api/whatsapp/send", {"pending_id": p["pending_id"], "confirm": True})[0], 410)
            # تعديل الجهة بعد المعاينة يبطلها
            p2 = self.sec.req("POST", "/api/whatsapp/preview", body)[1]
            self.sec.req("PUT", f"/api/contacts/{cid}", {"name": "جهة اختبار", "phone": "+966500000098", "approved": True})
            self.assertEqual(self.sec.req("POST", "/api/whatsapp/send", {"pending_id": p2["pending_id"], "confirm": True})[0], 410)
            # إرسال ملف المحضر: رفع وسائط ثم رسالة مستند
            n = len(GRAPH_CALLS)
            p3 = self.sec.req("POST", "/api/whatsapp/preview", {"contact_id": cid, "kind": "document", "meeting_id": 1})[1]
            r3 = self.sec.req("POST", "/api/whatsapp/send", {"pending_id": p3["pending_id"], "confirm": True})[1]
            self.assertTrue(r3["ok"], r3)
            self.assertTrue(GRAPH_CALLS[n][0].endswith("/media") and GRAPH_CALLS[n][2].startswith("multipart/form-data"))
            self.assertEqual(json.loads(GRAPH_CALLS[n + 1][3])["document"]["id"], "MEDIA1")
            # نص أطول من حد واتساب يُرفض ولا يُقتطع
            self.assertEqual(self.sec.req("POST", "/api/whatsapp/preview", {"contact_id": cid, "kind": "custom", "body": "س" * 5000})[0], 400)
            log = self.sec.req("GET", "/api/whatsapp/log")[1]
            self.assertEqual((log[-1]["status"], log[-1]["wa_message_id"], bool(log[-1]["ts"])), ("أُرسل إلى المنصة", "wamid.TEST", True))
        finally:
            for k in ("WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_API_BASE"):
                os.environ.pop(k, None)

    def test_demo_contacts_not_approved(self):
        cs = self.sec.req("GET", "/api/contacts")[1]
        self.assertTrue(all(not c["approved"] for c in cs if "تجريبي" in c["name"]))

    def test_no_secrets_in_repo_files(self):
        for root, _, files in os.walk(ROOT):
            if "/data" in root or "__pycache__" in root or "/tests" in root:
                continue
            for f in files:
                with open(os.path.join(root, f), encoding="utf-8", errors="ignore") as fh:
                    txt = fh.read()
                self.assertNotRegex(txt, r"EAA[A-Za-z0-9]{20,}|sk-ant-[A-Za-z0-9\-]{10,}", f)


if __name__ == "__main__":
    unittest.main()
