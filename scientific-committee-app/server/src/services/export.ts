import type { Database } from 'better-sqlite3';
import { HttpError, parseJson } from '../lib/util.js';
import type { Verdict } from './citations.js';
import type { SourceConflict } from './readiness.js';
import { VERDICT_LABELS, getStudy } from './study.js';

export interface StudyExportModel {
  org: { university: string; college: string; department: string; committee: string };
  scope: string;
  request: { refNo: string; title: string; typeName: string; applicant: string; unit: string; submittedDate: string };
  study: { version: number; status: string; createdAt: string; finalizedAt: string; mode: string };
  summary: string;
  memo: string;
  recommendation: string;
  completionItems: string[];
  minuteDraft: string;
  readiness: Array<{ label: string; ok: boolean; blocking: boolean; detail: string }>;
  conflicts: SourceConflict[];
  findings: Array<{
    ordinal: number;
    requirementText: string;
    basis: string;
    basisQuote: string;
    evidence: string;
    evidenceQuote: string;
    verdict: Verdict;
    verdictReason: string;
    facts: string;
    inference: string;
    calculation: string;
    notes: string;
    gap: string;
  }>;
  revisions: Array<{ at: string; field: string; oldValue: string; newValue: string; reason: string; actor: string }>;
  templateNotice: string;
  demoNotice: string;
}

function settingValue(db: Database, key: string, fallback: string): string {
  return db.prepare<[string], { value: string }>(`SELECT value FROM settings WHERE key = ?`).get(key)?.value ?? fallback;
}

export function buildStudyExportModel(db: Database, studyId: string): StudyExportModel {
  const study = getStudy(db, studyId);
  const request = db
    .prepare<[string], {
      ref_no: string; title: string; type_id: string | null; applicant_name: string;
      applicant_unit: string; submitted_date: string; scope: string;
    }>(
      `SELECT ref_no, title, type_id, applicant_name, applicant_unit, submitted_date, scope
         FROM requests WHERE id = ?`,
    )
    .get(study.request_id);
  if (!request) throw new HttpError(404, 'الطلب غير موجود.');

  const typeName = request.type_id
    ? db.prepare<[string], { name: string }>(`SELECT name FROM request_types WHERE id = ?`).get(request.type_id)?.name ?? ''
    : '';

  const findings = db
    .prepare<[string], {
      ordinal: number; requirement_text: string; basis_locator: string; basis_quote: string;
      basis_source_id: string | null; evidence_attachment_id: string | null; evidence_locator: string;
      evidence_quote: string; verdict: string; verdict_reason: string; facts: string; inference: string;
      calculation: string; notes: string; gap: string;
    }>(`SELECT * FROM findings WHERE study_id = ? ORDER BY ordinal`)
    .all(studyId)
    .map((row) => {
      const source = row.basis_source_id
        ? db
            .prepare<[string], { title: string; version: string; effective_date: string }>(
              `SELECT title, version, effective_date FROM sources WHERE id = ?`,
            )
            .get(row.basis_source_id)
        : undefined;
      const attachment = row.evidence_attachment_id
        ? db
            .prepare<[string], { file_name: string; label: string }>(
              `SELECT file_name, label FROM attachments WHERE id = ?`,
            )
            .get(row.evidence_attachment_id)
        : undefined;
      return {
        ordinal: row.ordinal,
        requirementText: row.requirement_text,
        basis: source
          ? `${source.title}${source.version ? ` — إصدار ${source.version}` : ''}${source.effective_date ? ` — نفاذ ${source.effective_date}` : ''}${row.basis_locator ? ` — ${row.basis_locator}` : ''}`
          : 'لا يوجد سند موثّق',
        basisQuote: row.basis_quote,
        evidence: attachment
          ? `${attachment.label || attachment.file_name}${row.evidence_locator ? ` — ${row.evidence_locator}` : ''}`
          : 'لا يوجد دليل موثّق من المرفقات',
        evidenceQuote: row.evidence_quote,
        verdict: row.verdict as Verdict,
        verdictReason: row.verdict_reason,
        facts: row.facts,
        inference: row.inference,
        calculation: row.calculation,
        notes: row.notes,
        gap: row.gap,
      };
    });

  const revisions = db
    .prepare<[string], { created_at: string; field: string; old_value: string; new_value: string; reason: string; actor: string }>(
      `SELECT created_at, field, old_value, new_value, reason, actor FROM study_revisions
        WHERE study_id = ? ORDER BY created_at`,
    )
    .all(studyId)
    .map((r) => ({ at: r.created_at, field: r.field, oldValue: r.old_value, newValue: r.new_value, reason: r.reason, actor: r.actor }));

  const templateRegistered =
    (db
      .prepare<[string], { c: number }>(`SELECT COUNT(*) AS c FROM sources WHERE scope = ? AND is_official_template = 1`)
      .get(request.scope)?.c ?? 0) > 0;

  return {
    org: {
      university: settingValue(db, 'org.university', 'جامعة الجوف'),
      college: settingValue(db, 'org.college', 'كلية العلوم الطبية التطبيقية'),
      department: settingValue(db, 'org.department', 'قسم علوم المختبرات الإكلينيكية'),
      committee: settingValue(db, 'org.committee', 'اللجنة العلمية'),
    },
    scope: request.scope,
    request: {
      refNo: request.ref_no,
      title: request.title,
      typeName,
      applicant: request.applicant_name,
      unit: request.applicant_unit,
      submittedDate: request.submitted_date,
    },
    study: {
      version: study.version,
      status: study.status,
      createdAt: study.created_at,
      finalizedAt: study.finalized_at,
      mode: study.mode,
    },
    summary: study.summary,
    memo: study.memo,
    recommendation: study.recommendation,
    completionItems: parseJson<string[]>(study.completion_items, []),
    minuteDraft: study.minute_draft,
    readiness: parseJson(study.readiness, []),
    conflicts: parseJson<SourceConflict[]>(study.conflicts, []),
    findings,
    revisions,
    templateNotice: templateRegistered
      ? 'النموذج الرسمي مسجَّل في المكتبة، غير أن ربط الحقول بالقالب لم يُعتمد بعد؛ لذلك هذا المستند لا يطابق تنسيق النموذج الرسمي.'
      : 'النموذج الرسمي لم يضف بعد. هذا المستند مسودة داخلية ولا يمثل النموذج الرسمي المعتمد.',
    demoNotice:
      request.scope === 'demo' ? 'للتجربة فقط — ليست لائحة معتمدة ولا دراسة فعلية.' : '',
  };
}

/**
 * Free-text fields are written with line breaks; a single <p> would collapse them
 * into one unreadable block, which mixed Arabic and Latin text makes worse.
 */
function multiline(text: string, fallback: string): string {
  const lines = String(text ?? '').split('\n');
  const blocks = lines.map((line) => line.trim()).filter((line) => line.length > 0);
  if (blocks.length === 0) return `<p class="muted">${fallback}</p>`;
  return blocks.map((line) => `<p>${esc(line)}</p>`).join('');
}

function esc(text: string): string {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const PRINT_CSS = `
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", "Noto Naskh Arabic", "Traditional Arabic", Tahoma, sans-serif;
         direction: rtl; color: #17212b; line-height: 1.75; margin: 0; padding: 24px; background: #fff; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  h2 { font-size: 15px; margin: 22px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #c9d4de; }
  .org { text-align: center; margin-bottom: 18px; }
  .org div { font-size: 13px; color: #405264; }
  .notice { border: 1px solid #b08b2e; background: #fdf7e6; padding: 8px 12px; margin: 10px 0;
            font-size: 12px; border-radius: 4px; }
  .demo { border-color: #a33; background: #fdeaea; font-weight: 700; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
  th, td { border: 1px solid #9fb0bf; padding: 6px 8px; text-align: right; vertical-align: top; }
  th { background: #eef3f7; font-weight: 600; }
  .quote { font-size: 11px; color: #46586a; border-right: 3px solid #c9d4de; padding-right: 6px; margin-top: 4px; }
  .v-met { color: #1c6b3f; font-weight: 700; }
  .v-not_met { color: #9c2b2b; font-weight: 700; }
  .v-unverifiable { color: #8a6412; font-weight: 700; }
  .v-not_applicable { color: #4a5a6a; font-weight: 700; }
  ul { margin: 6px 0; padding-inline-start: 18px; }
  .muted { color: #5b6b7b; font-size: 12px; }
  @media print { body { padding: 0; } .noprint { display: none; } }
`;

export function renderStudyHtml(model: StudyExportModel): string {
  const rows = model.findings
    .map(
      (f) => `
      <tr>
        <td>${f.ordinal}</td>
        <td>${esc(f.requirementText)}</td>
        <td>${esc(f.basis)}${f.basisQuote ? `<div class="quote">«${esc(f.basisQuote)}»</div>` : '<div class="quote">لا يوجد اقتباس محقَّق.</div>'}</td>
        <td>${esc(f.evidence)}${f.evidenceQuote ? `<div class="quote">«${esc(f.evidenceQuote)}»</div>` : ''}</td>
        <td class="v-${f.verdict}">${VERDICT_LABELS[f.verdict]}${f.verdictReason ? `<div class="quote">${esc(f.verdictReason)}</div>` : ''}</td>
        <td>${f.facts ? `<div><b>وقائع:</b> ${esc(f.facts)}</div>` : ''}${f.inference ? `<div><b>استنتاج:</b> ${esc(f.inference)}</div>` : ''}${f.calculation ? `<div><b>حساب:</b> ${esc(f.calculation)}</div>` : ''}${f.notes ? `<div><b>ملاحظة:</b> ${esc(f.notes)}</div>` : ''}${f.gap ? `<div><b>نقص:</b> ${esc(f.gap)}</div>` : ''}</td>
      </tr>`,
    )
    .join('');

  const conflicts = model.conflicts.length
    ? `<h2>تعارض المصادر</h2>${model.conflicts
        .map(
          (c) => `<div class="notice"><b>${esc(c.conflictKey)}</b><ul>${c.sides
            .map((s) => `<li>${esc(s.sourceTitle)} (${esc(s.locator)}): ${esc(s.value)}</li>`)
            .join('')}</ul>${
            c.resolved ? `توجيه اللجنة المسجَّل: ${esc(c.resolutionNote)}` : 'لم يُحسم بعد — يحتاج توجيه اللجنة.'
          }</div>`,
        )
        .join('')}`
    : '';

  const blocking = model.readiness.filter((r) => r.blocking && !r.ok);

  return `<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8">
<title>دراسة الطلب ${esc(model.request.refNo)}</title><style>${PRINT_CSS}</style></head>
<body>
  <div class="org">
    <div>${esc(model.org.university)}</div>
    <div>${esc(model.org.college)} — ${esc(model.org.department)}</div>
    <h1>${esc(model.org.committee)} — مذكرة دراسة طلب</h1>
    <div class="muted">الإصدار ${model.study.version} — ${model.study.status === 'final' ? 'نهائية' : 'مسودة'}</div>
  </div>
  ${model.demoNotice ? `<div class="notice demo">${esc(model.demoNotice)}</div>` : ''}
  <div class="notice">${esc(model.templateNotice)}</div>
  ${blocking.length ? `<div class="notice"><b>الدراسة غير جاهزة للإصدار النهائي:</b><ul>${blocking.map((b) => `<li>${esc(b.label)}: ${esc(b.detail)}</li>`).join('')}</ul></div>` : ''}

  <h2>بيانات الطلب</h2>
  <table>
    <tr><th style="width:22%">الرقم المرجعي</th><td>${esc(model.request.refNo)}</td>
        <th style="width:16%">نوع الطلب</th><td>${esc(model.request.typeName || 'غير محدد')}</td></tr>
    <tr><th>العنوان</th><td colspan="3">${esc(model.request.title)}</td></tr>
    <tr><th>مقدم الطلب</th><td>${esc(model.request.applicant || 'غير مذكور')}</td>
        <th>الجهة</th><td>${esc(model.request.unit || 'غير مذكورة')}</td></tr>
    <tr><th>تاريخ التقديم</th><td colspan="3">${esc(model.request.submittedDate || 'غير مذكور')}</td></tr>
  </table>

  <h2>ملخص الطلب</h2>
  ${multiline(model.summary, 'لم يُدخل ملخص.')}

  <h2>مصفوفة المطابقة والأدلة</h2>
  <table>
    <thead><tr><th style="width:4%">م</th><th style="width:22%">المتطلب</th><th style="width:22%">السند النظامي</th>
    <th style="width:18%">دليل الطلب</th><th style="width:12%">النتيجة</th><th style="width:22%">الوقائع والاستنتاج والملاحظات</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="6">لا توجد بنود.</td></tr>'}</tbody>
  </table>

  ${conflicts}

  <h2>مذكرة الدراسة</h2>
  ${multiline(model.memo, 'لا توجد مذكرة.')}

  <h2>قائمة الاستكمال</h2>
  ${model.completionItems.length ? `<ul>${model.completionItems.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : '<p class="muted">لا توجد نواقص مسجَّلة.</p>'}

  <h2>توصية مبدئية</h2>
  ${multiline(model.recommendation, 'لم تُسجَّل توصية.')}
  <p class="muted">هذه توصية مبدئية معدّة للعرض على اللجنة. القرار النهائي واعتماد المحضر من صلاحية اللجنة.</p>

  ${model.revisions.length ? `<h2>سجل تعديلات المراجع</h2><table><thead><tr><th>الوقت</th><th>الحقل</th><th>قبل</th><th>بعد</th><th>السبب</th></tr></thead><tbody>${model.revisions
    .map((r) => `<tr><td>${esc(r.at)}</td><td>${esc(r.field)}</td><td>${esc(r.oldValue)}</td><td>${esc(r.newValue)}</td><td>${esc(r.reason)}</td></tr>`)
    .join('')}</tbody></table>` : ''}
</body></html>`;
}

export interface MinutesExportModel {
  org: StudyExportModel['org'];
  scope: string;
  title: string;
  committeeName: string;
  meetingDate: string;
  meetingCalendar: string;
  meetingTime: string;
  sessionNo: string;
  addressee: { name: string; title: string; state: string };
  notes: string;
  additions: string;
  members: Array<{ ordinal: number; name: string; role: string; state: string; absenceReason: string }>;
  items: Array<{
    ordinal: number;
    refNo: string;
    requestTitle: string;
    subject: string;
    body: string;
    decision: string;
    relatedEntity: string;
  }>;
  demoNotice: string;
  templateNotice: string;
}

export const ATTENDANCE_LABELS: Record<string, string> = {
  present: 'حاضر',
  absent: 'غائب',
  unrecorded: 'لم يُسجَّل',
};

export function calendarLabel(calendar: string): string {
  if (calendar === 'hijri') return 'هجري';
  if (calendar === 'gregorian') return 'ميلادي';
  if (calendar === 'academic_year') return 'عام دراسي';
  return '';
}

export function buildMinutesExportModel(db: Database, minutesId: string): MinutesExportModel {
  const minutes = db
    .prepare<[string], Record<string, unknown>>(`SELECT * FROM minutes WHERE id = ?`)
    .get(minutesId);
  if (!minutes) throw new HttpError(404, 'المحضر غير موجود.');
  const scope = String(minutes.scope);

  const items = db
    .prepare<[string], { ordinal: number; subject: string; body: string; decision: string; related_entity: string; request_id: string | null }>(
      `SELECT ordinal, subject, body, decision, related_entity, request_id
         FROM minute_items WHERE minutes_id = ? ORDER BY ordinal`,
    )
    .all(minutesId)
    .map((item) => {
      const request = item.request_id
        ? db
            .prepare<[string], { ref_no: string; title: string }>(`SELECT ref_no, title FROM requests WHERE id = ?`)
            .get(item.request_id)
        : undefined;
      return {
        ordinal: item.ordinal,
        refNo: request?.ref_no ?? '',
        requestTitle: request?.title ?? '',
        subject: item.subject ?? '',
        body: item.body,
        decision: item.decision ?? '',
        relatedEntity: item.related_entity ?? '',
      };
    });

  // Attendance and signature rows both come from the one composition list.
  const members = db
    .prepare<[string], { id: string; ordinal: number; name: string; role: string }>(
      `SELECT id, ordinal, name, role FROM committee_members WHERE scope = ? ORDER BY ordinal, created_at`,
    )
    .all(scope)
    .map((member) => {
      const attendance = db
        .prepare<[string, string], { state: string; absence_reason: string }>(
          `SELECT state, absence_reason FROM minute_attendance WHERE minutes_id = ? AND member_id = ?`,
        )
        .get(minutesId, member.id);
      return {
        ordinal: member.ordinal,
        name: member.name,
        role: member.role,
        state: attendance?.state ?? 'unrecorded',
        absenceReason: attendance?.absence_reason ?? '',
      };
    });

  return {
    org: {
      university: settingValue(db, 'org.university', 'جامعة الجوف'),
      college: settingValue(db, 'org.college', 'كلية العلوم الطبية التطبيقية'),
      department: settingValue(db, 'org.department', 'قسم علوم المختبرات الإكلينيكية'),
      committee: settingValue(db, 'org.committee', 'اللجنة العلمية'),
    },
    scope,
    title: String(minutes.title),
    committeeName: String(minutes.committee_name ?? ''),
    meetingDate: String(minutes.meeting_date ?? ''),
    meetingCalendar: String(minutes.meeting_calendar ?? ''),
    meetingTime: String(minutes.meeting_time ?? ''),
    sessionNo: String(minutes.session_no ?? ''),
    addressee: {
      name: String(minutes.addressee_name ?? ''),
      title: String(minutes.addressee_title ?? ''),
      state: String(minutes.addressee_state ?? 'pending_review'),
    },
    notes: String(minutes.notes ?? ''),
    additions: String(minutes.additions ?? ''),
    members,
    items,
    demoNotice: scope === 'demo' ? 'للتجربة فقط — ليست لائحة معتمدة ولا محضرًا فعليًا.' : '',
    templateNotice:
      'هذه مسودة عامة بترتيب أقسام النموذج المطلوب. لم تُعتمد مطابقة تنسيق النموذج الرسمي لعدم استلام ملف القالب والتحقق منه، ولا يُدّعى تطابق التخطيط أو الترويسة أو الصور.',
  };
}

export function renderMinutesHtml(model: MinutesExportModel): string {
  const dateLabel = [model.meetingDate, calendarLabel(model.meetingCalendar)].filter(Boolean).join(' — ');
  return `<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8">
<title>مسودة محضر — ${esc(model.title)}</title><style>${PRINT_CSS}</style></head>
<body>
  <div class="org">
    <div>${esc(model.org.university)}</div>
    <div>${esc(model.org.college)} — ${esc(model.org.department)}</div>
    <h1>محضر اجتماع</h1>
  </div>
  ${model.demoNotice ? `<div class="notice demo">${esc(model.demoNotice)}</div>` : ''}
  <div class="notice">${esc(model.templateNotice)}</div>
  <div class="notice">مسودة غير معتمدة: لم تُسجَّل توقيعات ولا اعتماد، وحالة الحضور تُملأ من تشكيل اللجنة لهذا الاجتماع فقط.</div>

  <table>
    <tr><th style="width:25%">اسم اللجنة</th><td>${esc(model.committeeName || model.org.committee)}</td>
        <th style="width:15%">رقم الجلسة</th><td>${esc(model.sessionNo || '—')}</td></tr>
    <tr><th>التاريخ</th><td>${esc(dateLabel || '—')}</td>
        <th>الوقت</th><td>${esc(model.meetingTime || '—')}</td></tr>
  </table>

  <h2>أولاً: أعضاء اللجنة حسب قرار تكوينها</h2>
  <table>
    <thead><tr><th style="width:6%">م</th><th>الاسم</th><th>الصفة</th><th>حالة الحضور</th><th>سبب التغيب</th></tr></thead>
    <tbody>
      ${
        model.members.length
          ? model.members
              .map(
                (member) => `<tr><td>${member.ordinal}</td><td>${esc(member.name)}</td><td>${esc(member.role)}</td>
        <td>${esc(ATTENDANCE_LABELS[member.state] ?? member.state)}</td><td>${esc(member.absenceReason || '—')}</td></tr>`,
              )
              .join('')
          : '<tr><td colspan="5">لم يُسجَّل تشكيل اللجنة بعد.</td></tr>'
      }
    </tbody>
  </table>

  <h2>ثانياً: جدول أعمال الجلسة</h2>
  <table>
    <thead><tr><th style="width:6%">م</th><th>الموضوع</th></tr></thead>
    <tbody>
      ${
        model.items.length
          ? model.items
              .map((item) => `<tr><td>${item.ordinal}</td><td>${esc(item.subject || item.requestTitle || '—')}</td></tr>`)
              .join('')
          : '<tr><td colspan="2">لا توجد بنود.</td></tr>'
      }
    </tbody>
  </table>

  <h2>ثالثاً: المناقشات والقرارات أو التوصيات</h2>
  ${
    model.items.length
      ? model.items
          .map(
            (item) => `
    <table style="margin-bottom:14px">
      <tr><th style="width:25%">الموضوع</th><td>${esc(item.subject || item.requestTitle || '—')}${item.refNo ? ` (طلب رقم ${esc(item.refNo)})` : ''}</td></tr>
      <tr><th>ملخص وصف الموضوع ومناقشته</th><td>${esc(item.body).replace(/\n/g, '<br>') || '—'}</td></tr>
      <tr><th>القرار/التوصية</th><td>${esc(item.decision) || '<span class="muted">يُدوَّن في الجلسة — لا يُنشأ آليًا.</span>'}</td></tr>
      <tr><th>الجهة ذات العلاقة</th><td>${esc(item.relatedEntity) || '—'}</td></tr>
    </table>`,
          )
          .join('')
      : '<p class="muted">لا توجد بنود.</p>'
  }

  <h2>رابعاً</h2>
  <p>
    يُرفع المحضر إلى ${esc(model.addressee.title || '(الصفة غير محددة)')} ${esc(model.addressee.name || '(الاسم غير محدد)')}.
    ${model.addressee.state !== 'confirmed' ? '<span class="muted">(المخاطب وصفته بانتظار مراجعة المستخدم؛ لم تُؤخذ من النموذج تلقائيًا.)</span>' : ''}
  </p>

  <h2>خامساً: رأي الأعضاء في المحضر</h2>
  <table>
    <thead><tr><th style="width:6%">م</th><th>الاسم</th><th>الصفة</th><th style="width:25%">التوقيع</th></tr></thead>
    <tbody>
      ${
        model.members.length
          ? model.members
              .map(
                (member) =>
                  `<tr><td>${member.ordinal}</td><td>${esc(member.name)}</td><td>${esc(member.role)}</td><td></td></tr>`,
              )
              .join('')
          : '<tr><td colspan="4">لم يُسجَّل تشكيل اللجنة بعد.</td></tr>'
      }
    </tbody>
  </table>
  <p class="muted small">تُوقَّع هذه الخانات يدويًا. لا ينشئ التطبيق توقيعًا ولا اعتمادًا.</p>

  <h2>سادساً: الإضافات والملحوظات</h2>
  <p>${esc(model.additions).replace(/\n/g, '<br>') || '<span class="muted">لا توجد إضافات.</span>'}</p>
  ${model.notes ? `<p>${esc(model.notes).replace(/\n/g, '<br>')}</p>` : ''}
</body></html>`;
}
