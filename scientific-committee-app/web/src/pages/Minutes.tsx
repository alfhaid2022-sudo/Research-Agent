import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, type MinutesRecord } from '../api';
import { Badge, DemoBanner, Empty, ErrorBox, Field, Loading, Notice, useAsync, useScope, useToast } from '../components/ui';

export default function MinutesPage() {
  const { scope } = useScope();
  const { push } = useToast();
  const [form, setForm] = useState({
    title: '',
    committeeName: '',
    meetingDate: '',
    meetingCalendar: '',
    meetingTime: '',
    sessionNo: '',
  });
  const [busy, setBusy] = useState(false);
  const state = useAsync<{ minutes: MinutesRecord[] }>(() => api.get('/minutes', scope), [scope]);

  async function create(event: FormEvent) {
    event.preventDefault();
    if (form.title.trim().length < 2) {
      push('اكتب عنوان المحضر.', 'error');
      return;
    }
    setBusy(true);
    try {
      await api.post('/minutes', { ...form, scope });
      push('أُنشئت مسودة المحضر.', 'success');
      setForm({ title: '', committeeName: '', meetingDate: '', meetingCalendar: '', meetingTime: '', sessionNo: '' });
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
          <h2>المحاضر</h2>
          <p>تجميع بنود الطلبات المدروسة في مسودة محضر.</p>
        </div>
      </div>

      <DemoBanner scope={scope} />

      <Notice kind="warn">
        التطبيق يُعدّ <strong>مسودة</strong> محضر بترتيب أقسام النموذج المطلوب. لا يُنشئ حضورًا ولا تصويتًا ولا
        توقيعات ولا اعتمادًا: حالة الحضور تُسجَّل يدويًا لكل اجتماع من تشكيل اللجنة، والتوقيع والقرار يُستكملان في
        الجلسة. مطابقة تنسيق النموذج الرسمي معلّقة حتى استلام ملف القالب والتحقق منه.
      </Notice>

      <section className="card">
        <h3>مسودة محضر جديدة</h3>
        <form onSubmit={create}>
          <div className="form-row">
            <Field label="العنوان">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="رقم الجلسة">
              <input value={form.sessionNo} onChange={(e) => setForm({ ...form, sessionNo: e.target.value })} />
            </Field>
            <Field label="تاريخ الاجتماع" hint="يُسجَّل كما يُدخَل دون افتراض تحويل بين التقويمين.">
              <input value={form.meetingDate} onChange={(e) => setForm({ ...form, meetingDate: e.target.value })} />
            </Field>
            <Field label="تقويم التاريخ">
              <select
                value={form.meetingCalendar}
                onChange={(e) => setForm({ ...form, meetingCalendar: e.target.value })}
              >
                <option value="">غير محدد</option>
                <option value="hijri">هجري</option>
                <option value="gregorian">ميلادي</option>
              </select>
            </Field>
            <Field label="الوقت">
              <input value={form.meetingTime} onChange={(e) => setForm({ ...form, meetingTime: e.target.value })} />
            </Field>
            <Field label="اسم اللجنة">
              <input value={form.committeeName} onChange={(e) => setForm({ ...form, committeeName: e.target.value })} />
            </Field>
          </div>
          <button type="submit" className="btn primary" disabled={busy}>
            إنشاء
          </button>
        </form>
      </section>

      {state.loading && <Loading />}
      {state.error && <ErrorBox message={state.error} onRetry={state.reload} />}

      {state.data &&
        (state.data.minutes.length === 0 ? (
          <Empty title="لا توجد محاضر" hint="أنشئ مسودة محضر ثم أدرج فيها بنود الدراسات." />
        ) : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>العنوان</th>
                    <th>الجلسة</th>
                    <th>التاريخ</th>
                    <th>عدد البنود</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {state.data.minutes.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Link to={`/minutes/${item.id}`}>{item.title}</Link>
                      </td>
                      <td>{item.sessionNo || '—'}</td>
                      <td>{item.meetingDate || '—'}</td>
                      <td>{item.itemCount ?? 0}</td>
                      <td>
                        <Badge kind="info">مسودة</Badge>
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
