import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import RequestDossier from '../components/RequestDossier';
import {
  api,
  CALENDAR_LABELS,
  EXTRACTION_LABELS,
  REQUEST_STATUS_LABELS,
  type AttachmentRecord,
  type ReadinessItem,
  type RequestRecord,
} from '../api';
import {
  Badge,
  ErrorBox,
  Field,
  Loading,
  Notice,
  extractionBadge,
  formatBytes,
  formatDateTime,
  useAsync,
  useToast,
} from '../components/ui';

interface Payload {
  request: RequestRecord;
  attachments: AttachmentRecord[];
  studies: Array<{ id: string; version: number; status: string; mode: string; ready: boolean; createdAt: string; finalizedAt: string }>;
  readiness: { items: ReadinessItem[]; ready: boolean; requirementCount: number; missingAttachments: string[] };
  checklist: string[];
  missingAttachments: string[];
}

export default function RequestDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [label, setLabel] = useState('');
  const [checklistItem, setChecklistItem] = useState('');
  const [busy, setBusy] = useState(false);
  const state = useAsync<Payload>(() => api.get(`/requests/${id}`), [id]);

  async function upload() {
    if (!file) {
      push('اختر ملفًا أولًا.', 'error');
      return;
    }
    const form = new FormData();
    form.append('file', file);
    form.append('label', label);
    form.append('checklistItem', checklistItem);
    setBusy(true);
    try {
      const result = await api.upload<{ extraction: { note: string } }>(`/requests/${id}/attachments`, form);
      push(`تم رفع المرفق. ${result.extraction.note}`, 'success');
      setFile(null);
      setLabel('');
      setChecklistItem('');
      state.reload();
    } catch (error) {
      push((error as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function removeAttachment(attachmentId: string) {
    if (!window.confirm('حذف هذا المرفق؟')) return;
    try {
      await api.del(`/attachments/${attachmentId}`);
      push('تم حذف المرفق.', 'success');
      state.reload();
    } catch (error) {
      push((error as Error).message, 'error');
    }
  }

  async function openStudy() {
    setBusy(true);
    try {
      const created = await api.post<{ id: string }>(`/requests/${id}/studies`);
      navigate(`/studies/${created.id}`);
    } catch (error) {
      push((error as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(status: string) {
    try {
      await api.put(`/requests/${id}`, { status });
      state.reload();
    } catch (error) {
      push((error as Error).message, 'error');
    }
  }

  if (state.loading) return <Loading />;
  if (state.error) return <ErrorBox message={state.error} onRetry={state.reload} />;
  if (!state.data) return null;

  const { request, attachments, studies, readiness, checklist, missingAttachments } = state.data;
  // An item is covered when an uploader attached a file to it; the older free-text
  // label still counts so requests created before the link keep their state.
  const covered = new Set(
    attachments.flatMap((a) => [a.checklistItem.trim(), a.label.trim()]).filter(Boolean),
  );

  return (
    <>
      <div className="page-head">
        <div>
          <h2>
            طلب رقم {request.refNo}{' '}
            {request.scope === 'demo' && <Badge kind="demo">للتجربة فقط</Badge>}
          </h2>
          <p>{request.title}</p>
        </div>
        <span className="spacer" />
        <Link className="btn" to="/requests">
          رجوع
        </Link>
        <button type="button" className="btn primary" onClick={openStudy} disabled={busy}>
          فتح دراسة جديدة
        </button>
      </div>

      <div className="grid cols-2">
        <section className="card">
          <h3>بيانات الطلب</h3>
          <table>
            <tbody>
              <tr>
                <th style={{ width: '35%' }}>النوع</th>
                <td>{request.typeName || 'غير محدد'}</td>
              </tr>
              <tr>
                <th>مقدم الطلب</th>
                <td>{request.applicantName || 'غير مذكور'}</td>
              </tr>
              <tr>
                <th>الجهة/القسم</th>
                <td>{request.applicantUnit || 'غير مذكورة'}</td>
              </tr>
              <tr>
                <th>تاريخ التقديم</th>
                <td>
                  {request.submittedDate || 'غير مذكور'}{' '}
                  {request.submittedCalendar && (
                    <Badge kind="neutral">{CALENDAR_LABELS[request.submittedCalendar]}</Badge>
                  )}
                </td>
              </tr>
              <tr>
                <th>العام الدراسي</th>
                <td>{request.academicYear || 'غير مذكور'}</td>
              </tr>
              <tr>
                <th>الحالة</th>
                <td>
                  <select value={request.status} onChange={(e) => setStatus(e.target.value)}>
                    {Object.entries(REQUEST_STATUS_LABELS).map(([value, text]) => (
                      <option key={value} value={value}>
                        {text}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
          {request.summary && <p className="small">{request.summary}</p>}
        </section>

        <section className="card">
          <h3>جاهزية الدراسة</h3>
          <div className="stack">
            {readiness.items.map((item) => (
              <div key={item.key} className="row">
                <Badge kind={item.ok ? 'ok' : item.blocking ? 'warn' : 'neutral'}>
                  {item.ok ? 'مكتمل' : item.blocking ? 'مانع' : 'تنبيه'}
                </Badge>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.label}</div>
                  <div className="small muted">{item.detail}</div>
                </div>
              </div>
            ))}
          </div>
          {!readiness.ready && (
            <Notice kind="warn">
              لا يمكن إصدار دراسة نهائية أو توصية حاسمة قبل معالجة العناصر المانعة أعلاه. يمكن حفظ مسودة الدراسة في كل
              الأحوال.
            </Notice>
          )}
        </section>
      </div>

      <section className="card">
        <h3>قائمة النواقص</h3>
        {checklist.length === 0 ? (
          <div className="small muted">لم تُعرَّف قائمة تحقق لهذا النوع من الطلبات في الإعدادات.</div>
        ) : (
          <ul className="small">
            {checklist.map((item) => (
              <li key={item}>
                {covered.has(item) ? <Badge kind="ok">مرفوع</Badge> : <Badge kind="warn">ناقص</Badge>} {item}
              </li>
            ))}
          </ul>
        )}
        {missingAttachments.length > 0 && (
          <Notice kind="warn">
            نواقص مطلوب استكمالها: {missingAttachments.join('، ')}. نقص المرفق يُسجَّل كنقص في الدليل، ولا يُعامَل
            تلقائيًا على أنه «غير مستوفى».
          </Notice>
        )}
      </section>

      <section className="card">
        <h3>المرفقات ({attachments.length})</h3>
        <div className="form-row">
          <Field label="الملف" hint="الصيغ المدعومة للاستخراج: PDF ذو نص، DOCX، ملفات نصية.">
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </Field>
          <Field
            label="بند قائمة التحقق الذي يغطيه المرفق"
            hint="اختيارك تصريح بأن الملف مقدَّم لهذا البند، وليس تحققًا من محتواه؛ المراجع هو من يقرر كفايته."
          >
            <select value={checklistItem} onChange={(e) => setChecklistItem(e.target.value)}>
              <option value="">— لا ينطبق / مرفق إضافي —</option>
              {checklist.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>
          <Field label="وسم المرفق" hint="وصف حر يميّز الملف في الجدول.">
            <input value={label} onChange={(e) => setLabel(e.target.value)} />
          </Field>
        </div>
        <button type="button" className="btn primary" onClick={upload} disabled={busy}>
          {busy ? 'جارٍ الرفع…' : 'رفع مرفق'}
        </button>

        {attachments.length === 0 ? (
          <div className="small muted" style={{ marginTop: 12 }}>
            لا توجد مرفقات بعد.
          </div>
        ) : (
          <div className="table-wrap" style={{ marginTop: 12 }}>
            <table>
              <thead>
                <tr>
                  <th>الوسم</th>
                  <th>بند القائمة</th>
                  <th>الملف</th>
                  <th>الاستخراج</th>
                  <th>الحجم</th>
                  <th>تاريخ الرفع</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {attachments.map((attachment) => (
                  <tr key={attachment.id}>
                    <td>{attachment.label || '—'}</td>
                    <td className="small">{attachment.checklistItem || '—'}</td>
                    <td className="small">{attachment.fileName}</td>
                    <td>
                      <Badge kind={extractionBadge(attachment.extractionStatus)}>
                        {EXTRACTION_LABELS[attachment.extractionStatus] ?? attachment.extractionStatus}
                      </Badge>
                      <div className="small muted">{attachment.extractionNote}</div>
                    </td>
                    <td className="small">{formatBytes(attachment.size)}</td>
                    <td className="small">{formatDateTime(attachment.createdAt)}</td>
                    <td>
                      <div className="row">
                        <a className="btn small" href={`/api/attachments/${attachment.id}/file`}>
                          تنزيل
                        </a>
                        <button type="button" className="btn small danger" onClick={() => removeAttachment(attachment.id)}>
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <RequestDossier requestId={request.id} track={request.track} />

      <section className="card">
        <h3>الدراسات</h3>
        {studies.length === 0 ? (
          <div className="small muted">لم تُفتح دراسة لهذا الطلب بعد.</div>
        ) : (
          <div className="stack">
            {studies.map((study) => (
              <div key={study.id} className="row">
                <Link to={`/studies/${study.id}`}>الإصدار {study.version}</Link>
                <Badge kind={study.status === 'final' ? 'ok' : 'info'}>{study.status === 'final' ? 'نهائية' : 'مسودة'}</Badge>
                <Badge kind={study.ready ? 'ok' : 'warn'}>{study.ready ? 'جاهزة' : 'غير جاهزة'}</Badge>
                <span className="small muted">{formatDateTime(study.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
