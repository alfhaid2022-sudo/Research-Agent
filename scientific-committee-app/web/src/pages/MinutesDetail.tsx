import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  api,
  ATTENDANCE_LABELS,
  CALENDAR_LABELS,
  type AttendanceRow,
  type MinuteItemRecord,
  type MinutesRecord,
  type RequestRecord,
} from '../api';
import { Badge, Empty, ErrorBox, Field, Loading, Notice, useAsync, useScope, useToast } from '../components/ui';

interface Payload {
  minutes: MinutesRecord;
  items: MinuteItemRecord[];
  attendance: AttendanceRow[];
  signatures: Array<{ memberId: string; ordinal: number; name: string; role: string }>;
  structureNotice: string;
}

export default function MinutesDetailPage() {
  const { id = '' } = useParams();
  const { scope } = useScope();
  const { push } = useToast();
  const [studyId, setStudyId] = useState('');
  const [agenda, setAgenda] = useState({ subject: '', body: '', relatedEntity: '' });
  const [busy, setBusy] = useState(false);
  const state = useAsync<Payload>(() => api.get(`/minutes/${id}`), [id]);
  const requests = useAsync<{ requests: RequestRecord[] }>(() => api.get('/requests', scope), [scope]);

  const studied = (requests.data?.requests ?? []).filter((request) => request.studyCount > 0);
  const studyOptions = useAsync<Array<{ value: string; label: string }>>(async () => {
    const results = await Promise.all(
      studied.map(async (request) => {
        const detail = await api.get<{ studies: Array<{ id: string; version: number; status: string }> }>(
          `/requests/${request.id}`,
        );
        return detail.studies.map((study) => ({
          value: study.id,
          label: `${request.refNo} — إصدار ${study.version} (${study.status === 'final' ? 'نهائية' : 'مسودة'})`,
        }));
      }),
    );
    return results.flat();
  }, [studied.map((request) => request.id).join(',')]);

  async function addStudyItem() {
    if (!studyId) {
      push('اختر دراسة لإدراجها.', 'error');
      return;
    }
    setBusy(true);
    try {
      await api.post(`/minutes/${id}/items`, { studyId });
      push('أُدرج البند في مسودة المحضر.', 'success');
      setStudyId('');
      state.reload();
    } catch (error) {
      push((error as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function addAgendaItem() {
    if (agenda.subject.trim().length < 2) {
      push('اكتب موضوع البند.', 'error');
      return;
    }
    try {
      await api.post(`/minutes/${id}/items`, agenda);
      push('أُضيف بند إلى جدول الأعمال.', 'success');
      setAgenda({ subject: '', body: '', relatedEntity: '' });
      state.reload();
    } catch (error) {
      push((error as Error).message, 'error');
    }
  }

  async function saveItem(itemId: string, patch: Partial<MinuteItemRecord>) {
    try {
      await api.put(`/minutes/${id}/items/${itemId}`, patch);
      push('حُفظ البند.', 'success');
      state.reload();
    } catch (error) {
      push((error as Error).message, 'error');
    }
  }

  async function removeItem(itemId: string) {
    if (!window.confirm('حذف هذا البند من المحضر؟')) return;
    await api.del(`/minutes/${id}/items/${itemId}`);
    state.reload();
  }

  async function setAttendance(memberId: string, state_: string, absenceReason: string) {
    try {
      await api.put(`/minutes/${id}/attendance/${memberId}`, {
        state: state_,
        absenceReason,
        recordedBy: localStorage.getItem('sca.reviewer') ?? '',
      });
      state.reload();
    } catch (error) {
      push((error as Error).message, 'error');
    }
  }

  async function saveHeader(patch: Partial<MinutesRecord>) {
    try {
      await api.put(`/minutes/${id}`, patch);
      push('حُفظت بيانات المحضر.', 'success');
      state.reload();
    } catch (error) {
      push((error as Error).message, 'error');
    }
  }

  if (state.loading) return <Loading />;
  if (state.error) return <ErrorBox message={state.error} onRetry={state.reload} />;
  if (!state.data) return null;

  const { minutes, items, attendance, signatures, structureNotice } = state.data;

  return (
    <>
      <div className="page-head">
        <div>
          <h2>
            {minutes.title} {minutes.scope === 'demo' && <Badge kind="demo">للتجربة فقط</Badge>}
          </h2>
          <p>
            {minutes.sessionNo ? `الجلسة ${minutes.sessionNo}` : 'بدون رقم جلسة'} — {minutes.meetingDate || 'بدون تاريخ'}{' '}
            {minutes.meetingCalendar && `(${CALENDAR_LABELS[minutes.meetingCalendar]})`}
          </p>
        </div>
        <span className="spacer" />
        <Link className="btn" to="/minutes">
          رجوع
        </Link>
        <a className="btn" href={`/api/minutes/${id}/export.html`} target="_blank" rel="noreferrer">
          مسودة للطباعة
        </a>
        <a className="btn" href={`/api/minutes/${id}/export.docx`}>
          تصدير DOCX
        </a>
      </div>

      <Notice kind="warn">{structureNotice}</Notice>

      <section className="card">
        <h3>أولاً: أعضاء اللجنة حسب قرار تكوينها</h3>
        <p className="small muted">
          الأسماء تأتي من تشكيل اللجنة في الإعدادات، وهي نفسها المستخدمة في جدول التوقيع. حالة الحضور لهذا الاجتماع
          وحده، ولا تُنسخ من اجتماع سابق ولا من النموذج.
        </p>
        {attendance.length === 0 ? (
          <Empty
            title="لم يُسجَّل تشكيل اللجنة"
            hint="أضف أعضاء اللجنة من شاشة الإعدادات ليظهروا في جدولي الحضور والتوقيع."
            action={
              <Link className="btn primary" to="/settings">
                فتح الإعدادات
              </Link>
            }
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 50 }}>م</th>
                  <th>الاسم</th>
                  <th>الصفة</th>
                  <th>حالة الحضور</th>
                  <th>سبب التغيب</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((row) => (
                  <AttendanceRowView key={row.memberId} row={row} onSave={setAttendance} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <h3>ثانياً: جدول أعمال الجلسة</h3>
        <div className="form-row">
          <Field label="إدراج بند من دراسة">
            <select value={studyId} onChange={(e) => setStudyId(e.target.value)}>
              <option value="">اختر دراسة…</option>
              {(studyOptions.data ?? []).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <div style={{ alignSelf: 'end', marginBottom: 12 }}>
            <button type="button" className="btn primary" onClick={addStudyItem} disabled={busy}>
              إدراج
            </button>
          </div>
        </div>

        <div className="form-row">
          <Field label="أو بند بدون دراسة — الموضوع">
            <input value={agenda.subject} onChange={(e) => setAgenda({ ...agenda, subject: e.target.value })} />
          </Field>
          <Field label="ملخص المناقشة">
            <input value={agenda.body} onChange={(e) => setAgenda({ ...agenda, body: e.target.value })} />
          </Field>
          <Field label="الجهة ذات العلاقة">
            <input
              value={agenda.relatedEntity}
              onChange={(e) => setAgenda({ ...agenda, relatedEntity: e.target.value })}
            />
          </Field>
        </div>
        <button type="button" className="btn" onClick={addAgendaItem}>
          إضافة بند
        </button>

        {items.length > 0 && (
          <ol className="small" style={{ marginTop: 12 }}>
            {items.map((item) => (
              <li key={item.id}>{item.subject || item.requestTitle || '—'}</li>
            ))}
          </ol>
        )}
      </section>

      <h3 style={{ margin: '18px 0 8px' }}>ثالثاً: المناقشات والقرارات أو التوصيات</h3>
      {items.length === 0 ? (
        <div className="empty">لا توجد بنود في هذه المسودة.</div>
      ) : (
        items.map((item) => <MinuteItem key={item.id} item={item} onSave={saveItem} onRemove={removeItem} />)
      )}

      <section className="card">
        <h3>رابعاً: رفع المحضر</h3>
        <p className="small muted">
          المخاطب وصفته قيمتان قابلتان للتحديث، ولم تُؤخذا من النموذج تلقائيًا. تبقى بحالة «بانتظار المراجعة» حتى
          تؤكدها.
        </p>
        <div className="form-row">
          <Field label="الصفة">
            <input
              defaultValue={minutes.addresseeTitle}
              onBlur={(e) => e.target.value !== minutes.addresseeTitle && saveHeader({ addresseeTitle: e.target.value })}
            />
          </Field>
          <Field label="الاسم/الجهة">
            <input
              defaultValue={minutes.addresseeName}
              onBlur={(e) => e.target.value !== minutes.addresseeName && saveHeader({ addresseeName: e.target.value })}
            />
          </Field>
          <Field label="حالة المراجعة">
            <select
              value={minutes.addresseeState}
              onChange={(e) => saveHeader({ addresseeState: e.target.value as MinutesRecord['addresseeState'] })}
            >
              <option value="pending_review">بانتظار مراجعة المستخدم</option>
              <option value="confirmed">مؤكَّد</option>
            </select>
          </Field>
        </div>
      </section>

      <section className="card">
        <h3>خامساً: رأي الأعضاء في المحضر</h3>
        <p className="small muted">
          الأسماء نفسها الواردة في جدول الحضور. خانة التوقيع تُملأ يدويًا بعد الطباعة؛ لا ينشئ التطبيق توقيعًا ولا
          اعتمادًا.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 50 }}>م</th>
                <th>الاسم</th>
                <th>الصفة</th>
                <th>التوقيع</th>
              </tr>
            </thead>
            <tbody>
              {signatures.map((row) => (
                <tr key={row.memberId}>
                  <td>{row.ordinal}</td>
                  <td>{row.name}</td>
                  <td>{row.role}</td>
                  <td className="muted small">يُوقَّع يدويًا</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h3>سادساً: الإضافات والملحوظات</h3>
        <Field label="الإضافات">
          <textarea
            defaultValue={minutes.additions}
            onBlur={(e) => e.target.value !== minutes.additions && saveHeader({ additions: e.target.value })}
          />
        </Field>
        <Field label="ملاحظات داخلية">
          <textarea
            defaultValue={minutes.notes}
            onBlur={(e) => e.target.value !== minutes.notes && saveHeader({ notes: e.target.value })}
          />
        </Field>
      </section>
    </>
  );
}

function AttendanceRowView({
  row,
  onSave,
}: {
  row: AttendanceRow;
  onSave: (memberId: string, state: string, absenceReason: string) => void;
}) {
  const [reason, setReason] = useState(row.absenceReason);
  return (
    <tr>
      <td>{row.ordinal}</td>
      <td>{row.name}</td>
      <td className="small">{row.role}</td>
      <td>
        <select value={row.state} onChange={(e) => onSave(row.memberId, e.target.value, reason)}>
          {Object.entries(ATTENDANCE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </td>
      <td>
        <input
          value={reason}
          placeholder={row.state === 'absent' ? 'مطلوب عند الغياب' : ''}
          onChange={(e) => setReason(e.target.value)}
          onBlur={() => row.state === 'absent' && reason !== row.absenceReason && onSave(row.memberId, 'absent', reason)}
        />
      </td>
    </tr>
  );
}

function MinuteItem({
  item,
  onSave,
  onRemove,
}: {
  item: MinuteItemRecord;
  onSave: (id: string, patch: Partial<MinuteItemRecord>) => void;
  onRemove: (id: string) => void;
}) {
  const [form, setForm] = useState({
    subject: item.subject,
    body: item.body,
    decision: item.decision,
    relatedEntity: item.relatedEntity,
  });
  return (
    <section className="card">
      <h3>
        البند {item.ordinal} {item.refNo ? `— طلب رقم ${item.refNo}` : ''}{' '}
        {item.studyStatus && item.studyStatus !== 'final' && <Badge kind="warn">الدراسة المرتبطة مسودة</Badge>}
      </h3>
      <Field label="الموضوع">
        <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
      </Field>
      <Field label="ملخص وصف الموضوع ومناقشته">
        <textarea
          style={{ minHeight: 130 }}
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
        />
      </Field>
      <Field label="القرار/التوصية" hint="يُكتب بعد الجلسة. لا ينشئ التطبيق قرارًا آليًا.">
        <textarea value={form.decision} onChange={(e) => setForm({ ...form, decision: e.target.value })} />
      </Field>
      <Field label="الجهة ذات العلاقة">
        <input value={form.relatedEntity} onChange={(e) => setForm({ ...form, relatedEntity: e.target.value })} />
      </Field>
      <div className="row">
        <button type="button" className="btn primary" onClick={() => onSave(item.id, form)}>
          حفظ البند
        </button>
        <button type="button" className="btn danger" onClick={() => onRemove(item.id)}>
          حذف البند
        </button>
      </div>
    </section>
  );
}
