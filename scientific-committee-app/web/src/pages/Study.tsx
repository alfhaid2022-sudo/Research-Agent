import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  api,
  VERDICT_LABELS,
  type AiStatus,
  type FindingRecord,
  type RevisionRecord,
  type StudyRecord,
} from '../api';
import {
  Badge,
  ErrorBox,
  Field,
  Loading,
  Notice,
  formatDateTime,
  useAsync,
  useToast,
  verdictBadge,
} from '../components/ui';

interface Payload {
  study: StudyRecord;
  request: { id: string; refNo: string; title: string; typeName: string; applicantName: string; applicantUnit: string; submittedDate: string; scope: string; status: string } | null;
  findings: FindingRecord[];
  revisions: RevisionRecord[];
}

export default function StudyPage() {
  const { id = '' } = useParams();
  const { push } = useToast();
  const [busy, setBusy] = useState(false);
  const state = useAsync<Payload>(() => api.get(`/studies/${id}`), [id]);
  const ai = useAsync<AiStatus>(() => api.get('/ai/status'), []);

  const [draft, setDraft] = useState({ summary: '', memo: '', recommendation: '', minuteDraft: '', completionItems: '' });

  useEffect(() => {
    if (!state.data) return;
    setDraft({
      summary: state.data.study.summary,
      memo: state.data.study.memo,
      recommendation: state.data.study.recommendation,
      minuteDraft: state.data.study.minuteDraft,
      completionItems: state.data.study.completionItems.join('\n'),
    });
  }, [state.data]);

  async function saveDraft() {
    setBusy(true);
    try {
      await api.put(`/studies/${id}`, {
        summary: draft.summary,
        memo: draft.memo,
        recommendation: draft.recommendation,
        minuteDraft: draft.minuteDraft,
        completionItems: draft.completionItems.split('\n').map((s) => s.trim()).filter(Boolean),
      });
      push('حُفظت المسودة.', 'success');
      state.reload();
    } catch (error) {
      push((error as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function analyze() {
    setBusy(true);
    try {
      const report = await api.post<{ acceptedCount: number; rejected: Array<{ reason: string }> }>(`/studies/${id}/analyze`);
      push(`اكتمل التحليل: ${report.acceptedCount} بندًا مقبولًا، ورُفض ${report.rejected.length} استشهادًا.`, 'success');
      state.reload();
    } catch (error) {
      push((error as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function finalize() {
    setBusy(true);
    try {
      await api.post(`/studies/${id}/finalize`);
      push('صدرت الدراسة نهائيًا. القرار النهائي واعتماد المحضر يبقيان من صلاحية اللجنة.', 'success');
      state.reload();
    } catch (error) {
      const err = error as { message: string; details?: { blocking?: string[] } };
      push(err.details?.blocking ? `${err.message} ${err.details.blocking.join(' | ')}` : err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function resolveConflict(conflictKey: string, note: string) {
    try {
      await api.post(`/studies/${id}/conflicts/resolve`, { conflictKey, note });
      push('سُجِّل توجيه اللجنة في سجل المراجعات.', 'success');
      state.reload();
    } catch (error) {
      push((error as Error).message, 'error');
    }
  }

  if (state.loading) return <Loading />;
  if (state.error) return <ErrorBox message={state.error} onRetry={state.reload} />;
  if (!state.data) return null;

  const { study, request, findings, revisions } = state.data;
  const blocking = study.readiness.filter((item) => item.blocking && !item.ok);
  const locked = study.status === 'final';
  const rejectedCitations = study.aiMeta.rejected ?? [];

  return (
    <>
      <div className="page-head">
        <div>
          <h2>
            دراسة الطلب {request?.refNo ?? ''} — الإصدار {study.version}{' '}
            {request?.scope === 'demo' && <Badge kind="demo">للتجربة فقط</Badge>}
          </h2>
          <p>{request?.title}</p>
        </div>
        <span className="spacer" />
        {request && (
          <Link className="btn" to={`/requests/${request.id}`}>
            الطلب
          </Link>
        )}
        <a className="btn" href={`/api/studies/${id}/export.html`} target="_blank" rel="noreferrer">
          مسودة للطباعة
        </a>
        <a className="btn" href={`/api/studies/${id}/export.docx`}>
          تصدير DOCX
        </a>
        <button type="button" className="btn primary" onClick={finalize} disabled={busy || locked}>
          {locked ? 'صدرت نهائيًا' : 'إصدار نهائي'}
        </button>
      </div>

      <div className="row" style={{ marginBottom: 12 }}>
        <Badge kind={locked ? 'ok' : 'info'}>{locked ? 'نهائية' : 'مسودة'}</Badge>
        <Badge kind={study.ready ? 'ok' : 'warn'}>{study.ready ? 'جاهزة للإصدار' : 'غير جاهزة'}</Badge>
        <Badge kind="neutral">{study.mode === 'ai' ? 'تحليل آلي + مراجعة' : 'دراسة يدوية'}</Badge>
        <span className="small muted">آخر تحديث {formatDateTime(study.updatedAt)}</span>
      </div>

      {blocking.length > 0 && (
        <Notice kind="warn">
          <strong>سبب عدم الجاهزية — لا تُصدَر دراسة نهائية ولا توصية حاسمة:</strong>
          <ul>
            {blocking.map((item) => (
              <li key={item.key}>
                {item.label}: {item.detail}
              </li>
            ))}
          </ul>
          يمكن حفظ المسودة والمتابعة لاحقًا.
        </Notice>
      )}

      {study.conflicts.length > 0 && (
        <section className="card">
          <h3>تعارض بين المصادر</h3>
          <p className="small muted">يُعرض طرفا التعارض كما وردا. لا يرجّح التطبيق بينهما؛ الحسم بتوجيه من اللجنة.</p>
          {study.conflicts.map((conflict) => (
            <ConflictBlock key={conflict.conflictKey} conflict={conflict} locked={locked} onResolve={resolveConflict} />
          ))}
        </section>
      )}

      <section className="card">
        <h3>التحليل الآلي</h3>
        {ai.data && !ai.data.enabled ? (
          <Notice kind="warn">
            <strong>التحليل الآلي غير مفعّل.</strong> {ai.data.reason} أكمل الدراسة يدويًا؛ لن تُستبدل النتائج بتحليل
            وهمي.
          </Notice>
        ) : (
          <>
            <p className="small muted">{ai.data?.dataNotice}</p>
            <button type="button" className="btn primary" onClick={analyze} disabled={busy || locked}>
              {busy ? 'جارٍ التحليل…' : 'تشغيل التحليل على المتطلبات المعتمدة'}
            </button>
          </>
        )}
        {study.aiMeta.ranAt && (
          <div className="small muted" style={{ marginTop: 8 }}>
            آخر تشغيل: {formatDateTime(study.aiMeta.ranAt)} — النموذج: {study.aiMeta.model} — بنود مقبولة:{' '}
            {study.aiMeta.acceptedCount ?? 0}
          </div>
        )}
        {rejectedCitations.length > 0 && (
          <Notice kind="danger">
            <strong>استشهادات مرفوضة آليًا ولم تُعرض ({rejectedCitations.length}):</strong>
            <ul>
              {rejectedCitations.map((item, index) => (
                <li key={index}>{item.reason}</li>
              ))}
            </ul>
          </Notice>
        )}
      </section>

      <section className="card">
        <h3>مصفوفة المطابقة والأدلة ({findings.length})</h3>
        {findings.length === 0 ? (
          <Notice kind="warn">
            لا توجد متطلبات معتمدة تنطبق على هذا الطلب، فلا يمكن بناء مصفوفة مطابقة. اعتمد المتطلبات من شاشة{' '}
            <Link to="/requirements">مراجعة المتطلبات</Link>.
          </Notice>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 32 }}>م</th>
                  <th>المتطلب</th>
                  <th>السند النظامي</th>
                  <th>دليل الطلب</th>
                  <th>النتيجة</th>
                  <th>الوقائع والاستنتاج</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {findings.map((finding) => (
                  <FindingRow key={finding.id} studyId={id} finding={finding} locked={locked} onSaved={state.reload} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <h3>الملخص والمذكرة والتوصية</h3>
        <Field label="ملخص الطلب">
          <textarea value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} disabled={locked} />
        </Field>
        <Field label="مذكرة الدراسة">
          <textarea
            style={{ minHeight: 140 }}
            value={draft.memo}
            onChange={(e) => setDraft({ ...draft, memo: e.target.value })}
            disabled={locked}
          />
        </Field>
        <Field label="قائمة الاستكمال" hint="بند في كل سطر.">
          <textarea
            value={draft.completionItems}
            onChange={(e) => setDraft({ ...draft, completionItems: e.target.value })}
            disabled={locked}
          />
        </Field>
        <Field label="توصية مبدئية" hint="مبدئية للعرض على اللجنة. القرار النهائي للجنة.">
          <textarea
            value={draft.recommendation}
            onChange={(e) => setDraft({ ...draft, recommendation: e.target.value })}
            disabled={locked}
          />
        </Field>
        <Field label="مسودة بند المحضر" hint="لا تُدرَج أسماء حضور ولا تصويت ولا اعتماد.">
          <textarea
            value={draft.minuteDraft}
            onChange={(e) => setDraft({ ...draft, minuteDraft: e.target.value })}
            disabled={locked}
          />
        </Field>
        <button type="button" className="btn primary" onClick={saveDraft} disabled={busy || locked}>
          حفظ المسودة
        </button>
      </section>

      <section className="card">
        <h3>سجل تعديلات المراجع ({revisions.length})</h3>
        {revisions.length === 0 ? (
          <div className="small muted">لا توجد تعديلات مسجَّلة.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>الوقت</th>
                  <th>الحقل</th>
                  <th>قبل</th>
                  <th>بعد</th>
                  <th>السبب</th>
                  <th>المنفّذ</th>
                </tr>
              </thead>
              <tbody>
                {revisions.map((revision) => (
                  <tr key={revision.id}>
                    <td className="small">{formatDateTime(revision.createdAt)}</td>
                    <td className="small">{revision.field}</td>
                    <td className="small muted">{revision.oldValue || '—'}</td>
                    <td className="small">{revision.newValue || '—'}</td>
                    <td className="small">{revision.reason || '—'}</td>
                    <td className="small">{revision.actor || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function ConflictBlock({
  conflict,
  locked,
  onResolve,
}: {
  conflict: StudyRecord['conflicts'][number];
  locked: boolean;
  onResolve: (key: string, note: string) => void;
}) {
  const [note, setNote] = useState(conflict.resolutionNote);
  return (
    <div className="segment">
      <div className="locator">
        {conflict.conflictKey} {conflict.resolved ? <Badge kind="ok">محسوم بتوجيه</Badge> : <Badge kind="warn">غير محسوم</Badge>}
      </div>
      <ul className="small">
        {conflict.sides.map((side) => (
          <li key={side.requirementId}>
            <strong>{side.sourceTitle}</strong>
            {side.sourceVersion ? ` — إصدار ${side.sourceVersion}` : ''}
            {side.effectiveDate ? ` — نفاذ ${side.effectiveDate}` : ''} — {side.locator}: <strong>{side.value}</strong>
            <div className="muted">{side.text}</div>
          </li>
        ))}
      </ul>
      {!conflict.resolved && !locked && (
        <>
          <Field label="توجيه اللجنة الذي يحسم التعارض" hint="يُسجَّل نصًا في سجل المراجعات مع وقته.">
            <textarea value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
          <button type="button" className="btn" onClick={() => onResolve(conflict.conflictKey, note)}>
            تسجيل التوجيه
          </button>
        </>
      )}
      {conflict.resolved && <div className="small">التوجيه المسجَّل: {conflict.resolutionNote}</div>}
    </div>
  );
}

function FindingRow({
  studyId,
  finding,
  locked,
  onSaved,
}: {
  studyId: string;
  finding: FindingRecord;
  locked: boolean;
  onSaved: () => void;
}) {
  const { push } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    verdict: finding.verdict,
    verdictReason: finding.verdictReason,
    notes: finding.notes,
    gap: finding.gap,
    facts: finding.facts,
    inference: finding.inference,
    calculation: finding.calculation,
    reason: '',
  });

  async function save() {
    if (form.reason.trim().length < 3) {
      push('اكتب سبب التعديل ليُسجَّل في سجل المراجعات.', 'error');
      return;
    }
    try {
      await api.put(`/studies/${studyId}/findings/${finding.id}`, form);
      push('حُفظ التعديل وسُجِّل سببه.', 'success');
      setEditing(false);
      onSaved();
    } catch (error) {
      push((error as Error).message, 'error');
    }
  }

  const issues = finding.validation.issues ?? [];

  return (
    <>
      <tr>
        <td>{finding.ordinal}</td>
        <td>
          {finding.requirementText}
          {finding.edited && <div><Badge kind="info">عُدّل بواسطة المراجع</Badge></div>}
        </td>
        <td className="small">
          {finding.basisSourceTitle || '—'}
          <div className="muted">
            {finding.basisSourceVersion ? `إصدار ${finding.basisSourceVersion}` : ''}
            {finding.basisEffectiveDate ? ` — نفاذ ${finding.basisEffectiveDate}` : ''}
          </div>
          <div className="muted">{finding.basisLocator}</div>
          {finding.basisQuote ? (
            <div className="quote">«{finding.basisQuote}»</div>
          ) : (
            <Badge kind="warn">لا يوجد اقتباس محقَّق</Badge>
          )}
        </td>
        <td className="small">
          {finding.evidenceAttachmentName || <span className="muted">لا يوجد دليل موثّق</span>}
          {finding.evidenceLocator && <div className="muted">{finding.evidenceLocator}</div>}
          {finding.evidenceQuote && <div className="quote">«{finding.evidenceQuote}»</div>}
        </td>
        <td>
          <Badge kind={verdictBadge(finding.verdict)}>{VERDICT_LABELS[finding.verdict] ?? finding.verdict}</Badge>
          {finding.verdictReason && <div className="small muted">{finding.verdictReason}</div>}
          {finding.validation.downgradedFrom && (
            <div className="small" style={{ color: 'var(--warn)' }}>
              خُفِّضت من «{VERDICT_LABELS[finding.validation.downgradedFrom] ?? finding.validation.downgradedFrom}» بعد
              فشل التحقق.
            </div>
          )}
        </td>
        <td className="small">
          {finding.facts && <div><strong>وقائع:</strong> {finding.facts}</div>}
          {finding.inference && <div><strong>استنتاج:</strong> {finding.inference}</div>}
          {finding.calculation && <div><strong>حساب:</strong> {finding.calculation}</div>}
          {finding.notes && <div><strong>ملاحظة:</strong> {finding.notes}</div>}
          {finding.gap && <div><strong>نقص:</strong> {finding.gap}</div>}
          {issues.length > 0 && (
            <div style={{ color: 'var(--warn)' }}>
              {issues.map((issue, index) => (
                <div key={index}>• {issue}</div>
              ))}
            </div>
          )}
        </td>
        <td>
          {!locked && (
            <button type="button" className="btn small" onClick={() => setEditing((v) => !v)}>
              {editing ? 'إلغاء' : 'تعديل'}
            </button>
          )}
        </td>
      </tr>
      {editing && (
        <tr>
          <td colSpan={7}>
            <div className="form-row">
              <Field label="النتيجة">
                <select value={form.verdict} onChange={(e) => setForm({ ...form, verdict: e.target.value })}>
                  {Object.entries(VERDICT_LABELS).map(([value, text]) => (
                    <option key={value} value={value}>
                      {text}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="تعليل النتيجة">
                <input value={form.verdictReason} onChange={(e) => setForm({ ...form, verdictReason: e.target.value })} />
              </Field>
            </div>
            <div className="form-row">
              <Field label="الوقائع">
                <textarea value={form.facts} onChange={(e) => setForm({ ...form, facts: e.target.value })} />
              </Field>
              <Field label="الاستنتاج">
                <textarea value={form.inference} onChange={(e) => setForm({ ...form, inference: e.target.value })} />
              </Field>
              <Field label="الحساب" hint="بيّن طريقة الحساب ومصدر كل رقم.">
                <textarea value={form.calculation} onChange={(e) => setForm({ ...form, calculation: e.target.value })} />
              </Field>
            </div>
            <div className="form-row">
              <Field label="ملاحظات">
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </Field>
              <Field label="النقص المطلوب استكماله">
                <textarea value={form.gap} onChange={(e) => setForm({ ...form, gap: e.target.value })} />
              </Field>
            </div>
            <Field label="سبب التعديل (إلزامي)">
              <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            </Field>
            <button type="button" className="btn primary" onClick={save}>
              حفظ التعديل
            </button>
          </td>
        </tr>
      )}
    </>
  );
}
