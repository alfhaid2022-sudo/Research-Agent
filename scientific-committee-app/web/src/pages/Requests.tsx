import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, CALENDAR_LABELS, REQUEST_STATUS_LABELS, type RequestRecord, type RequestTypeRecord } from '../api';
import { Badge, DemoBanner, Empty, ErrorBox, Field, Loading, Notice, useAsync, useScope, useToast } from '../components/ui';

export default function RequestsPage() {
  const { scope } = useScope();
  const { push } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    refNo: '',
    typeId: '',
    title: '',
    applicantName: '',
    applicantUnit: '',
    submittedDate: '',
    submittedCalendar: '',
    academicYear: '',
    summary: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const state = useAsync<{ requests: RequestRecord[] }>(() => api.get('/requests', scope), [scope]);
  const types = useAsync<{ requestTypes: RequestTypeRecord[] }>(() => api.get('/request-types', scope), [scope]);
  const activeTypes = (types.data?.requestTypes ?? []).filter((t) => t.active);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.refNo.trim()) nextErrors.refNo = 'الرقم المرجعي مطلوب.';
    if (!form.typeId) nextErrors.typeId = 'اختر نوع الطلب.';
    if (form.title.trim().length < 3) nextErrors.title = 'عنوان الطلب مطلوب.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setBusy(true);
    try {
      await api.post('/requests', { ...form, scope });
      push('أُنشئ الطلب.', 'success');
      setForm({
        refNo: '',
        typeId: '',
        title: '',
        applicantName: '',
        applicantUnit: '',
        submittedDate: '',
        submittedCalendar: '',
        academicYear: '',
        summary: '',
      });
      setShowForm(false);
      state.reload();
    } catch (error) {
      push((error as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h2>الطلبات</h2>
          <p>إنشاء الطلبات ومتابعة مرفقاتها ونواقصها ودراستها.</p>
        </div>
        <span className="spacer" />
        <button type="button" className="btn primary" onClick={() => setShowForm((v) => !v)} disabled={activeTypes.length === 0}>
          {showForm ? 'إغلاق النموذج' : 'طلب جديد'}
        </button>
      </div>

      <DemoBanner scope={scope} />

      {activeTypes.length === 0 && (
        <Notice kind="warn">
          لا توجد أنواع طلبات مُعدّة في هذا النطاق. أضف نوعًا من شاشة <Link to="/settings">الإعدادات</Link> قبل إنشاء
          الطلبات. أنواع الطلبات قابلة للإعداد بالكامل ولم تُفترض مسبقًا.
        </Notice>
      )}

      {showForm && (
        <section className="card">
          <h3>طلب جديد</h3>
          <form onSubmit={submit} noValidate>
            <div className="form-row">
              <Field label="الرقم المرجعي" error={errors.refNo}>
                <input value={form.refNo} onChange={(e) => setForm({ ...form, refNo: e.target.value })} />
              </Field>
              <Field label="نوع الطلب" error={errors.typeId}>
                <select value={form.typeId} onChange={(e) => setForm({ ...form, typeId: e.target.value })}>
                  <option value="">—</option>
                  {activeTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="تاريخ التقديم" hint="يُسجَّل كما ورد. لا يُفترض أي تحويل بين التقويمين.">
                <input value={form.submittedDate} onChange={(e) => setForm({ ...form, submittedDate: e.target.value })} />
              </Field>
              <Field label="تقويم التاريخ">
                <select
                  value={form.submittedCalendar}
                  onChange={(e) => setForm({ ...form, submittedCalendar: e.target.value })}
                >
                  <option value="">{CALENDAR_LABELS['']}</option>
                  <option value="hijri">{CALENDAR_LABELS.hijri}</option>
                  <option value="gregorian">{CALENDAR_LABELS.gregorian}</option>
                </select>
              </Field>
              <Field label="العام الدراسي" hint="حقل مستقل عن السنة الميلادية والهجرية.">
                <input value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} />
              </Field>
            </div>
            <Field label="عنوان الطلب" error={errors.title}>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <div className="form-row">
              <Field label="مقدم الطلب">
                <input value={form.applicantName} onChange={(e) => setForm({ ...form, applicantName: e.target.value })} />
              </Field>
              <Field label="الجهة/القسم">
                <input value={form.applicantUnit} onChange={(e) => setForm({ ...form, applicantUnit: e.target.value })} />
              </Field>
            </div>
            <Field label="ملخص مُدخَل (اختياري)">
              <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
            </Field>
            <button type="submit" className="btn primary" disabled={busy}>
              {busy ? 'جارٍ الحفظ…' : 'حفظ الطلب'}
            </button>
          </form>
        </section>
      )}

      {state.loading && <Loading />}
      {state.error && <ErrorBox message={state.error} onRetry={state.reload} />}

      {state.data &&
        (state.data.requests.length === 0 ? (
          <Empty title="لا توجد طلبات" hint="أنشئ أول طلب لتبدأ متابعة المرفقات والدراسة." />
        ) : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>الرقم المرجعي</th>
                    <th>العنوان</th>
                    <th>النوع</th>
                    <th>المسار</th>
                    <th>المرفقات</th>
                    <th>الدراسات</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {state.data.requests.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Link to={`/requests/${item.id}`}>{item.refNo}</Link>
                      </td>
                      <td>{item.title}</td>
                      <td className="small">{item.typeName || '—'}</td>
                      <td className="small">{item.track || '—'}</td>
                      <td>
                        <Badge kind={item.attachmentCount === 0 ? 'warn' : 'neutral'}>{item.attachmentCount}</Badge>
                      </td>
                      <td className="small">{item.studyCount > 0 ? `${item.studyCount} (آخر إصدار ${item.latestVersion})` : '—'}</td>
                      <td>
                        <Badge kind={item.status === 'studied' || item.status === 'in_minutes' ? 'ok' : 'info'}>
                          {REQUEST_STATUS_LABELS[item.status] ?? item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
    </>
  );
}
