"""تكامل WhatsApp Business Platform (Cloud API) الرسمية — اختياري.

لا أتمتة لـ WhatsApp Web. الأسرار تُقرأ من متغيرات البيئة فقط.
الإرسال لا يتم إلا من server.py بعد معاينة وموافقة صريحة ولمستلم من القائمة المعتمدة.
"""
import json
import os
import re
import urllib.error
import urllib.request
import uuid

E164 = re.compile(r"^\+[1-9]\d{7,14}$")
MAX_TEXT = 4096  # الحد الأقصى لنص رسالة واتساب


def valid_phone(p: str) -> bool:
    return bool(E164.match(p or ""))


def config() -> dict:
    token = os.environ.get("WHATSAPP_ACCESS_TOKEN", "").strip()
    pid = os.environ.get("WHATSAPP_PHONE_NUMBER_ID", "").strip()
    missing = [n for n, v in (("WHATSAPP_ACCESS_TOKEN", token), ("WHATSAPP_PHONE_NUMBER_ID", pid)) if not v]
    return {
        "configured": not missing, "missing": missing, "token": token, "phone_number_id": pid,
        "version": os.environ.get("WHATSAPP_API_VERSION", "v21.0").strip(),
        "base": os.environ.get("WHATSAPP_API_BASE", "https://graph.facebook.com").rstrip("/"),
        "template": os.environ.get("WHATSAPP_TEMPLATE_NAME", "").strip(),
        "template_lang": os.environ.get("WHATSAPP_TEMPLATE_LANG", "ar").strip(),
    }


def public_status() -> dict:
    c = config()
    msg = ""
    if not c["configured"]:
        msg = ("تكامل واتساب غير مُعدّ: المتغيرات الناقصة: " + "، ".join(c["missing"]) +
               ". يمكنك معاينة الرسائل ونسخها، أما الإرسال فيتطلب إعداد Meta (انظر README). بقية التطبيق تعمل كاملة.")
    return {"configured": c["configured"], "message": msg, "mode": "template" if c["template"] else "text",
            "template": c["template"], "api_version": c["version"]}


class WhatsAppError(Exception):
    pass


def _call(req: urllib.request.Request) -> dict:
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode("utf-8") or "{}")
    except urllib.error.HTTPError as e:
        try:
            err = json.loads(e.read().decode("utf-8")).get("error", {})
            detail = f"{err.get('message', '')} (code {err.get('code', '')})"
        except Exception:
            detail = ""
        raise WhatsAppError(f"رفضت منصة واتساب الطلب (HTTP {e.code}) {detail}".strip())
    except urllib.error.URLError as e:
        raise WhatsAppError(f"تعذّر الاتصال بمنصة واتساب: {e.reason}")


def _post_json(c: dict, payload: dict) -> dict:
    url = f"{c['base']}/{c['version']}/{c['phone_number_id']}/messages"
    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), method="POST", headers={
        "Authorization": f"Bearer {c['token']}", "Content-Type": "application/json"})
    return _call(req)


def _msg_id(resp: dict) -> str:
    try:
        return resp["messages"][0]["id"]
    except (KeyError, IndexError, TypeError):
        return ""


def send_text(phone: str, body: str) -> str:
    """يرسل نصاً (أو قالباً إن ضُبط WHATSAPP_TEMPLATE_NAME). يعيد معرّف الرسالة."""
    c = config()
    if not c["configured"]:
        raise WhatsAppError(public_status()["message"])
    to = phone.lstrip("+")
    if c["template"]:
        # متغيرات القوالب لا تقبل أسطراً جديدة ولا مسافات متتالية كثيرة
        param = re.sub(r"\s*\n\s*", " ▪ ", body.strip())
        param = re.sub(r"\s{4,}", "   ", param)[:1024]
        payload = {"messaging_product": "whatsapp", "to": to, "type": "template", "template": {
            "name": c["template"], "language": {"code": c["template_lang"]},
            "components": [{"type": "body", "parameters": [{"type": "text", "text": param}]}]}}
    else:
        payload = {"messaging_product": "whatsapp", "recipient_type": "individual", "to": to,
                   "type": "text", "text": {"preview_url": False, "body": body}}
    return _msg_id(_post_json(c, payload))


def send_document(phone: str, filename: str, data: bytes, mime: str, caption: str) -> str:
    """يرفع الملف إلى وسائط واتساب ثم يرسله مستنداً. (مستند حر: يتطلب نافذة 24 ساعة مفتوحة)."""
    c = config()
    if not c["configured"]:
        raise WhatsAppError(public_status()["message"])
    boundary = uuid.uuid4().hex
    def part(name, value):
        return (f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n').encode()
    body = part("messaging_product", "whatsapp") + part("type", mime) + (
        f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="minutes.{filename.rsplit(".", 1)[-1]}"\r\n'
        f"Content-Type: {mime}\r\n\r\n").encode() + data + f"\r\n--{boundary}--\r\n".encode()
    req = urllib.request.Request(f"{c['base']}/{c['version']}/{c['phone_number_id']}/media", data=body, method="POST",
                                 headers={"Authorization": f"Bearer {c['token']}",
                                          "Content-Type": f"multipart/form-data; boundary={boundary}"})
    media_id = _call(req).get("id")
    if not media_id:
        raise WhatsAppError("لم تُعِد منصة واتساب معرّف الوسائط بعد رفع الملف.")
    payload = {"messaging_product": "whatsapp", "recipient_type": "individual", "to": phone.lstrip("+"),
               "type": "document", "document": {"id": media_id, "filename": filename, "caption": caption[:1024]}}
    return _msg_id(_post_json(c, payload))
