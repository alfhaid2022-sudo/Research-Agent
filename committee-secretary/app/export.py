"""تصدير المحضر إلى Word (‎.docx) دون مكتبات خارجية، وإلى PDF عبر LibreOffice إن وُجد."""
import io
import os
import shutil
import subprocess
import tempfile
import zipfile
from xml.sax.saxutils import escape

FONT = "Sakkal Majalla"  # يستبدله Word/LibreOffice بخط عربي متاح إن لم يوجد
PLACEHOLDER = "[يُستكمل]"


def _run(text, bold=False, size=28, color=None):
    props = f'<w:rFonts w:ascii="{FONT}" w:hAnsi="{FONT}" w:cs="{FONT}"/>'
    if bold:
        props += "<w:b/><w:bCs/>"
    if color:
        props += f'<w:color w:val="{color}"/>'
    props += f'<w:sz w:val="{size}"/><w:szCs w:val="{size}"/><w:rtl/>'
    parts = str(text if text is not None else "").split("\n")
    body = "<w:br/>".join(f'<w:t xml:space="preserve">{escape(p)}</w:t>' for p in parts)
    return f"<w:r><w:rPr>{props}</w:rPr>{body}</w:r>"


def _p(text="", bold=False, size=28, align="both", color=None, space_after=120, runs=None):
    ppr = f'<w:pPr><w:bidi/><w:spacing w:after="{space_after}"/><w:jc w:val="{align}"/></w:pPr>'
    return f"<w:p>{ppr}{runs if runs is not None else _run(text, bold, size, color)}</w:p>"


def _table(rows, widths, header=True):
    """rows: قائمة صفوف، كل صف قائمة نصوص. الأعمدة تُعرض من اليمين (bidiVisual)."""
    borders = "".join(f'<w:{s} w:val="single" w:sz="6" w:space="0" w:color="666666"/>'
                      for s in ("top", "left", "bottom", "right", "insideH", "insideV"))
    out = ['<w:tbl><w:tblPr><w:bidiVisual/><w:tblW w:w="5000" w:type="pct"/>'
           f"<w:tblBorders>{borders}</w:tblBorders><w:tblLayout w:type=\"fixed\"/></w:tblPr><w:tblGrid>"]
    out += [f'<w:gridCol w:w="{w}"/>' for w in widths]
    out.append("</w:tblGrid>")
    for ri, row in enumerate(rows):
        out.append("<w:tr>")
        for ci, cell in enumerate(row):
            head = header and ri == 0
            shade = '<w:shd w:val="clear" w:color="auto" w:fill="E7EEF0"/>' if head else ""
            out.append(f'<w:tc><w:tcPr><w:tcW w:w="{widths[ci]}" w:type="dxa"/>{shade}</w:tcPr>'
                       + _p(cell, bold=head, size=24, align="start", space_after=40) + "</w:tc>")
        out.append("</w:tr>")
    out.append("</w:tbl>")
    return "".join(out) + _p("", space_after=60)


def _v(x):
    return x if (x is not None and str(x).strip()) else PLACEHOLDER


def build_docx(m: dict) -> bytes:
    """m: الناتج المركّب من server.compose_minutes()."""
    b = []
    watermark = {"draft": "مسودة — غير معتمدة", "review": "مسودة قيد المراجعة — غير معتمدة"}.get(m["status"])
    if watermark:
        b.append(_p(watermark, bold=True, size=24, align="center", color="B00020"))
    b.append(_p(m["org_name"], bold=True, size=36, align="center", space_after=40))
    b.append(_p(m["committee_name"], bold=True, size=30, align="center", space_after=40))
    b.append(_p(f"محضر الاجتماع {('ال' + m['type']) if m['type'] and not m['type'].startswith('ال') else (m['type'] or '')} رقم ({_v(m['number'])})", bold=True, size=32, align="center", space_after=200))

    b.append(_p("أولاً: بيانات الاجتماع", bold=True, size=30, align="start"))
    hij = _v(m["hijri_date"])
    b.append(_table([
        ["البيان", "التفصيل"],
        ["التاريخ الميلادي", _v(m["date"])],
        ["التاريخ الهجري", f"{hij}\n(مصدر التحويل: {m['hijri_source'] or 'غير محدد'})"],
        ["الوقت", _v(m["time"]) + (f" — {m['end_time']}" if m.get("end_time") else "")],
        ["المكان", _v(m["location"])],
        ["رئيس الاجتماع", _v(m["chair"])],
        ["مقرر الاجتماع", _v(m["secretary"])],
    ], [2600, 6800]))

    b.append(_p("ثانياً: الحضور والاعتذارات", bold=True, size=30, align="start"))
    att = [["م", "الاسم", "الصفة", "الحالة"]]
    for i, a in enumerate(m["attendance"], 1):
        att.append([str(i), a.get("name", ""), a.get("title", ""), a.get("status", "")])
    if len(att) == 1:
        att.append(["", PLACEHOLDER, "", ""])
    b.append(_table(att, [700, 3900, 2600, 2200]))

    if m.get("opening"):
        b.append(_p(m["opening"]))

    if m["pending"]:
        b.append(_p("نقاط تحتاج تأكيداً قبل الاعتماد", bold=True, size=28, align="start", color="B00020"))
        for x in m["pending"]:
            b.append(_p("• " + x, size=24, align="start", color="B00020", space_after=40))

    b.append(_p("ثالثاً: الموضوعات وما دار حولها", bold=True, size=30, align="start"))
    for it in m["items"]:
        b.append(_p(f"البند ({it['position']}): {it['title']}", bold=True, size=28, align="start"))
        b.append(_p(f"مقدم الموضوع: {_v(it['presenter'])}", size=26, align="start", space_after=40))
        if it["attachments"]:
            b.append(_p("المرفقات: " + "؛ ".join(a.get("label", "") for a in it["attachments"]), size=26, align="start", space_after=40))
        b.append(_p("ملخص العرض والمناقشة:", bold=True, size=26, align="start", space_after=40))
        b.append(_p(_v(it["discussion"])))
        if it["outcomes"]:
            rows = [["النوع", "الرقم", "النص", "المسؤول عن التنفيذ", "الموعد المستهدف"]]
            for o in it["outcomes"]:
                flag = " «يحتاج تأكيد»" if o["needs_confirm"] else ""
                rows.append([o["kind"], _v(o["number"]), o["text"] + flag, _v(o["owner"]), _v(o["due_date"] or o.get("due_text"))])
            b.append(_table(rows, [1100, 1100, 3900, 1800, 1500]))
        else:
            b.append(_p("لم يُسجَّل قرار أو توصية في هذا البند.", size=26, align="start"))

    b.append(_p("رابعاً: سجل القرارات والتوصيات", bold=True, size=30, align="start"))
    rows = [["الرقم", "النوع", "النص", "المسؤول", "الموعد", "الحالة"]]
    for it in m["items"]:
        for o in it["outcomes"]:
            rows.append([_v(o["number"]), o["kind"], o["text"], _v(o["owner"]), _v(o["due_date"] or o.get("due_text")), o["status"]])
    if len(rows) == 1:
        rows.append(["", "", "لا توجد", "", "", ""])
    b.append(_table(rows, [1000, 1000, 3600, 1500, 1300, 1000]))

    if m.get("closing"):
        b.append(_p(m["closing"]))

    b.append(_p("التوقيعات", bold=True, size=30, align="start"))
    b.append(_table([
        ["الصفة", "الاسم", "التوقيع"],
        ["رئيس الاجتماع", _v(m["chair"]), ""],
        ["مقرر الاجتماع", _v(m["secretary"]), ""],
    ], [2400, 4000, 3000]))
    if m["status"] == "approved":
        b.append(_p(f"حالة المحضر في النظام: معتمد إلكترونياً بواسطة {m.get('approved_by') or ''} بتاريخ {m.get('approved_at') or ''}. "
                    "هذا القيد ليس توقيعاً؛ التوقيع الخطي أعلاه هو المعتبر.", size=22, align="start"))

    sect = ('<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>'
            '<w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/>'
            "<w:bidi/></w:sectPr>")
    doc = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
           '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
           f"<w:body>{''.join(b)}{sect}</w:body></w:document>")
    ct = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
          '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
          '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
          '<Default Extension="xml" ContentType="application/xml"/>'
          '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
          "</Types>")
    rels = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'
            "</Relationships>")
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", ct)
        z.writestr("_rels/.rels", rels)
        z.writestr("word/document.xml", doc)
    return buf.getvalue()


def soffice_path():
    return shutil.which("soffice") or shutil.which("libreoffice")


def docx_to_pdf(docx_bytes: bytes) -> bytes:
    """يحوّل عبر LibreOffice. يرمي RuntimeError إن لم يكن مثبتاً أو فشل التحويل."""
    exe = soffice_path()
    if not exe:
        raise RuntimeError("تصدير PDF يتطلب LibreOffice مثبتاً على الخادم. البديل: افتح «نسخة الطباعة» واختر «حفظ كـ PDF» من المتصفح، أو صدّر Word وحوّله.")
    with tempfile.TemporaryDirectory() as d:
        src = os.path.join(d, "minutes.docx")
        with open(src, "wb") as f:
            f.write(docx_bytes)
        env = dict(os.environ, HOME=d)
        r = subprocess.run([exe, "--headless", "--convert-to", "pdf", "--outdir", d, src],
                           capture_output=True, timeout=120, env=env)
        out = os.path.join(d, "minutes.pdf")
        if r.returncode != 0 or not os.path.exists(out):
            raise RuntimeError("فشل تحويل المحضر إلى PDF عبر LibreOffice.")
        with open(out, "rb") as f:
            return f.read()
