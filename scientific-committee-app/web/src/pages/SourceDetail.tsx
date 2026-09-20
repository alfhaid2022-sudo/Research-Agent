import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  api,
  EXTRACTION_LABELS,
  INTAKE_LABELS,
  type CorrectionRecord,
  type SegmentRecord,
  type SourceRecord,
} from '../api';
import {
  Badge,
  ErrorBox,
  Field,
  Loading,
  Notice,
  extractionBadge,
  formatDateTime,
  useAsync,
  useToast,
} from '../components/ui';

interface Payload {
  source: SourceRecord;
  segments: SegmentRecord[];
  requirementCounts: Record<string, number>;
}

export default function SourceDetailPage() {
  const { id = '' } = useParams();
  const { push } = useToast();
  const [busy, setBusy] = useState(false);
  const [manual, setManual] = useState<{ segmentId: string; text: string; quote: string; conflictKey: string; conflictValue: string }>({
    segmentId: '',
    text: '',
    quote: '',
    conflictKey: '',
    conflictValue: '',
  });
  const state = useAsync<Payload>(() => api.get(`/sources/${id}`), [id]);

  async function extractRequirements() {
    setBusy(true);
    try {
      const report = await api.post<{ created: number; rejected: Array<{ reason: string }>; segmentsSent: number }>(
        `/sources/${id}/extract-requirements`,
      );
      push(
        `تم استخراج ${report.created} متطلبًا مرشحًا من ${report.segmentsSent} مقطعًا، ورُفض ${report.rejected.length} لعدم تطابق الاقتباس.`,
        'success',
      );
      state.reload();
    } catch (error) {
      push((error as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function addManual() {
    if (manual.text.trim().length < 5) {
      push('اكتب نص المتطلب أولًا.', 'error');
      return;
    }
    try {
      await api.post('/requirements', {
        sourceId: id,
        segmentId: manual.segmentId || undefined,
        text: manual.text.trim(),
        quote: manual.quote.trim(),
        conflictKey: manual.conflictKey.trim(),
        conflictValue: manual.conflictValue.trim(),
      });
      push('أُضيف المتطلب كمرشح بانتظار الاعتماد.', 'success');
      setManual({ segmentId: '', text: '', quote: '', conflictKey: '', conflictValue: '' });
      state.reload();
    } catch (error) {
      push((error as Error).message, 'error');
    }
  }

  if (state.loading) return <Loading />;
  if (state.error) return <ErrorBox message={state.error} onRetry={state.reload} />;
  if (!state.data) return null;

  const { source, segments, requirementCounts } = state.data;
  const usableSegments = segments.filter((segment) => segment.usableAsBasis);

  return (
    <>
      <div className="page-head">
        <div>
          <h2>{source.title}</h2>
          <p>
            {source.issuer || 'جهة غير مذكورة'} — إصدار {source.version || 'غير مذكور'} — نفاذ{' '}
            {source.effectiveDate || 'غير مذكور'}
          </p>
        </div>
        <span className="spacer" />
        <Link className="btn" to="/regulations">
          رجوع
        </Link>
      </div>

      <div className="card">
        <div className="row">
          <Badge kind={extractionBadge(source.extractionStatus)}>
            {EXTRACTION_LABELS[source.extractionStatus] ?? source.extractionStatus}
          </Badge>
          <span className="small muted">{source.extractionNote}</span>
        </div>
        <div className="row" style={{ marginTop: 6 }}>
          <Badge kind={source.intakeStatus === 'hash_mismatch' ? 'danger' : source.intakeStatus === 'verified' ? 'ok' : 'neutral'}>
            {INTAKE_LABELS[source.intakeStatus] ?? source.intakeStatus}
          </Badge>
          <span className="small muted">{source.intakeNote}</span>
        </div>
        <div className="small muted" style={{ marginTop: 6 }}>
          المعرّف الثابت: <code>{source.id}</code> — البصمة: <code dir="ltr">{source.sha256.slice(0, 16)}…</code>
          {source.pageCount > 0 ? ` — ${source.pageCount} صفحة` : ''} — رُفع في {formatDateTime(source.createdAt)}
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <Badge kind="neutral">{requirementCounts.candidate ?? 0} مرشح</Badge>
          <Badge kind="ok">{requirementCounts.approved ?? 0} معتمد</Badge>
          <Badge kind="danger">{requirementCounts.rejected ?? 0} مرفوض</Badge>
          <span className="spacer" />
          <button type="button" className="btn primary" onClick={extractRequirements} disabled={busy || usableSegments.length === 0}>
            {busy ? 'جارٍ الاستخراج…' : 'استخراج متطلبات مرشحة (تحليل آلي)'}
          </button>
          <Link className="btn" to="/requirements">
            مراجعة المتطلبات
          </Link>
        </div>
        {usableSegments.length === 0 && (
          <Notice kind="warn">
            لا يوجد في هذا الملف مقطع نصّه صالح كسند. النص المستخرج إما غائب أو مشوّه، فلا يجوز الاستشهاد به. أدخل نص
            الصفحات يدويًا واعتمده أدناه، أو ارفع نسخة نصية سليمة. لا يُرسل الملف إلى أي خدمة OCR خارجية تلقائيًا.
          </Notice>
        )}
      </div>

      <div className="card">
        <h3>إضافة متطلب يدويًا</h3>
        <p className="small muted">
          يُقبل الاقتباس فقط إذا كان موجودًا حرفيًا في نص المقطع المختار؛ وإلا يُرفض الإدخال.
        </p>
        <Field label="المقطع">
          <select value={manual.segmentId} onChange={(e) => setManual({ ...manual, segmentId: e.target.value })}>
            <option value="">بدون ربط بمقطع</option>
            {usableSegments.map((segment) => (
              <option key={segment.id} value={segment.id}>
                {segment.locator}
              </option>
            ))}
          </select>
        </Field>
        <Field label="نص المتطلب">
          <textarea value={manual.text} onChange={(e) => setManual({ ...manual, text: e.target.value })} />
        </Field>
        <Field label="الاقتباس الحرفي من المقطع">
          <textarea value={manual.quote} onChange={(e) => setManual({ ...manual, quote: e.target.value })} />
        </Field>
        <div className="form-row">
          <Field label="مفتاح التعارض" hint="موضوع موحّد يُقارَن عبر المصادر، مثل «مدة التقديم قبل الجلسة».">
            <input value={manual.conflictKey} onChange={(e) => setManual({ ...manual, conflictKey: e.target.value })} />
          </Field>
          <Field label="قيمة التعارض" hint="القيمة التي ينص عليها هذا المصدر، مثل «15 يومًا».">
            <input value={manual.conflictValue} onChange={(e) => setManual({ ...manual, conflictValue: e.target.value })} />
          </Field>
        </div>
        <button type="button" className="btn" onClick={addManual}>
          إضافة كمتطلب مرشح
        </button>
      </div>

      <div className="card">
        <h3>مقاطع المصدر ({segments.length})</h3>
        <p className="small muted">
          المقطع لا يصلح سندًا إلا إذا اجتاز نصّه المستخرج فحص الجودة، أو أُدخل نصه يدويًا واعتمده مراجع. النص اليدوي
          مرتبط برقم الصفحة وببصمة الملف، فإن استُبدل الملف توقّف سريانه تلقائيًا.
        </p>
        {segments.length === 0 ? (
          <div className="muted small">لا توجد مقاطع مستخرجة من هذا الملف.</div>
        ) : (
          segments.map((segment) => (
            <SegmentCard key={segment.id} segment={segment} onChanged={state.reload} />
          ))
        )}
      </div>
    </>
  );
}

function SegmentCard({ segment, onChanged }: { segment: SegmentRecord; onChanged: () => void }) {
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [enteredBy, setEnteredBy] = useState(() => localStorage.getItem('sca.reviewer') ?? '');
  const corrections = useAsync<{ corrections: CorrectionRecord[] }>(
    () => api.get(`/segments/${segment.id}/corrections`),
    [segment.id, open],
  );

  async function submit() {
    try {
      localStorage.setItem('sca.reviewer', enteredBy);
      await api.post(`/segments/${segment.id}/corrections`, { text, enteredBy });
      push('سُجّل النص اليدوي بانتظار الاعتماد.', 'success');
      setText('');
      corrections.reload();
      onChanged();
    } catch (error) {
      push((error as Error).message, 'error');
    }
  }

  async function review(id: string, status: 'approved' | 'rejected') {
    const reviewer = enteredBy || window.prompt('اسم المراجع؟') || '';
    if (reviewer.trim().length < 2) {
      push('اسم المراجع مطلوب لتسجيل الاعتماد.', 'error');
      return;
    }
    try {
      await api.put(`/corrections/${id}`, { status, reviewedBy: reviewer, reviewNote: '' });
      push(status === 'approved' ? 'اعتُمد النص اليدوي وأصبح سندًا صالحًا.' : 'رُفض النص اليدوي.', 'success');
      corrections.reload();
      onChanged();
    } catch (error) {
      push((error as Error).message, 'error');
    }
  }

  return (
    <div className="segment">
      <div className="locator">
        {segment.locator}{' '}
        {segment.usableAsBasis ? (
          <Badge kind="ok">{segment.textOrigin === 'correction' ? 'نص يدوي معتمد' : 'سند صالح'}</Badge>
        ) : (
          <Badge kind="warn">لا يصلح سندًا</Badge>
        )}{' '}
        {segment.quality === 'suspect' && <Badge kind="warn">نص مشوّه</Badge>}
        {segment.quality === 'none' && <Badge kind="danger">بلا نص</Badge>}
      </div>
      <div className="small muted">{segment.basisReason || segment.qualityNote}</div>
      <div className="text" style={{ marginTop: 6 }}>
        {segment.effectiveText.trim().length > 0 ? segment.effectiveText : 'لا يوجد نص.'}
      </div>
      <div className="small muted">المعرّف: {segment.id}</div>
      <button type="button" className="btn small" style={{ marginTop: 8 }} onClick={() => setOpen((v) => !v)}>
        {open ? 'إغلاق' : 'إدخال/مراجعة نص يدوي'}
      </button>
      {open && (
        <div style={{ marginTop: 10 }}>
          <Field label="نص الصفحة كما هو في الأصل" hint="يُدخَل يدويًا. لا يُرسل الملف إلى خدمة OCR خارجية.">
            <textarea value={text} onChange={(e) => setText(e.target.value)} />
          </Field>
          <Field label="اسم المُدخِل">
            <input value={enteredBy} onChange={(e) => setEnteredBy(e.target.value)} />
          </Field>
          <button type="button" className="btn" onClick={submit}>
            حفظ النص اليدوي
          </button>

          {(corrections.data?.corrections ?? []).map((correction) => (
            <div key={correction.id} className="segment" style={{ marginTop: 10 }}>
              <div className="row">
                <Badge kind={correction.status === 'approved' ? 'ok' : correction.status === 'rejected' ? 'danger' : 'warn'}>
                  {correction.status === 'approved' ? 'معتمد' : correction.status === 'rejected' ? 'مرفوض' : 'بانتظار المراجعة'}
                </Badge>
                <span className="small muted">
                  {correction.enteredBy || 'غير مذكور'} — {formatDateTime(correction.enteredAt)}
                </span>
              </div>
              <div className="text small">{correction.text}</div>
              {correction.status !== 'approved' && (
                <div className="row" style={{ marginTop: 6 }}>
                  <button type="button" className="btn small" onClick={() => review(correction.id, 'approved')}>
                    اعتماد
                  </button>
                  <button type="button" className="btn small danger" onClick={() => review(correction.id, 'rejected')}>
                    رفض
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
