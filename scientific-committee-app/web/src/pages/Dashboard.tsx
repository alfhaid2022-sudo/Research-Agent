import { Link } from 'react-router-dom';
import { api, REQUEST_STATUS_LABELS, type Dashboard } from '../api';
import { Badge, DemoBanner, Empty, ErrorBox, Loading, Notice, useAsync, useScope, useToast } from '../components/ui';

export default function DashboardPage() {
  const { scope } = useScope();
  const { push } = useToast();
  const state = useAsync<Dashboard>(() => api.get<Dashboard>('/dashboard', scope), [scope]);

  async function seedDemo() {
    try {
      const result = await api.post<{ notice: string }>('/demo/seed');
      push(result.notice, 'success');
      state.reload();
    } catch (error) {
      push((error as Error).message, 'error');
    }
  }

  if (state.loading) return <Loading />;
  if (state.error) return <ErrorBox message={state.error} onRetry={state.reload} />;
  if (!state.data) return null;

  const data = state.data;
  const totalRequests = Object.values(data.requestsByStatus).reduce((sum, n) => sum + n, 0);
  const pendingRequirements = data.requirementsByStatus.candidate ?? 0;
  const blockedSetup = data.setup.filter((item) => !item.ok);

  return (
    <>
      <div className="page-head">
        <div>
          <h2>اللوحة الرئيسية</h2>
          <p>حالة الطلبات وجاهزية النظام في النطاق {scope === 'demo' ? 'التجريبي' : 'الفعلي'}.</p>
        </div>
      </div>

      <DemoBanner scope={scope} />

      {!data.ai.enabled && (
        <Notice kind="warn">
          <strong>التحليل الآلي غير مفعّل.</strong> {data.ai.reason} يمكنك رفع الملفات ومراجعة المتطلبات وإجراء الدراسة
          يدويًا. لن يُستبدل التحليل بأي نتائج مُولَّدة تلقائيًا.
        </Notice>
      )}

      {blockedSetup.length > 0 && (
        <Notice kind="warn">
          <strong>إعداد النظام غير مكتمل:</strong>
          <ul>
            {blockedSetup.map((item) => (
              <li key={item.key}>
                {item.label}: {item.detail}
              </li>
            ))}
          </ul>
        </Notice>
      )}

      <div className="grid cols-4" style={{ marginBottom: 16 }}>
        <div className="stat">
          <div className="value">{totalRequests}</div>
          <div className="label">إجمالي الطلبات</div>
        </div>
        <div className="stat">
          <div className="value">{data.sources.total - data.sources.templates}</div>
          <div className="label">مصادر نظامية مرفوعة</div>
        </div>
        <div className="stat">
          <div className="value">{pendingRequirements}</div>
          <div className="label">متطلبات بانتظار المراجعة</div>
        </div>
        <div className="stat">
          <div className="value">{data.minutesCount}</div>
          <div className="label">محاضر</div>
        </div>
      </div>

      <div className="grid cols-2">
        <section className="card">
          <h3>حالة الطلبات</h3>
          {totalRequests === 0 ? (
            <Empty
              title="لا توجد طلبات بعد"
              hint="أنشئ طلبًا جديدًا من شاشة الطلبات."
              action={<Link className="btn primary" to="/requests">فتح الطلبات</Link>}
            />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>الحالة</th>
                    <th>العدد</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.requestsByStatus).map(([status, count]) => (
                    <tr key={status}>
                      <td>{REQUEST_STATUS_LABELS[status] ?? status}</td>
                      <td>{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card">
          <h3>حالة إعداد النظام</h3>
          <div className="stack">
            {data.setup.map((item) => (
              <div key={item.key} className="row">
                <Badge kind={item.ok ? 'ok' : 'warn'}>{item.ok ? 'مكتمل' : 'ناقص'}</Badge>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.label}</div>
                  <div className="small muted">{item.detail}</div>
                </div>
              </div>
            ))}
            <div className="row">
              <Badge kind={data.ai.enabled ? 'ok' : 'warn'}>{data.ai.enabled ? 'مفعّل' : 'غير مفعّل'}</Badge>
              <div>
                <div style={{ fontWeight: 600 }}>التحليل الآلي</div>
                <div className="small muted">{data.ai.reason}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <h3>بانتظار الاستكمال</h3>
          {data.awaitingCompletion.length === 0 ? (
            <div className="muted small">لا توجد طلبات بانتظار الاستكمال.</div>
          ) : (
            <div className="stack">
              {data.awaitingCompletion.map((item) => (
                <div key={item.id} className="row">
                  <Link to={`/requests/${item.id}`}>{item.refNo}</Link>
                  <span className="small muted">{item.title}</span>
                  <Badge kind={item.attachmentCount === 0 ? 'warn' : 'neutral'}>{item.attachmentCount} مرفق</Badge>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <h3>دراسات قيد المراجعة</h3>
          {data.draftStudies.length === 0 ? (
            <div className="muted small">لا توجد دراسات مفتوحة.</div>
          ) : (
            <div className="stack">
              {data.draftStudies.map((item) => (
                <div key={item.id} className="row">
                  <Link to={`/studies/${item.id}`}>{item.refNo}</Link>
                  <span className="small muted">{item.title}</span>
                  <Badge kind="info">إصدار {item.version}</Badge>
                  <Badge kind={item.ready ? 'ok' : 'warn'}>{item.ready ? 'جاهزة' : 'غير جاهزة'}</Badge>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {scope === 'demo' && (
        <section className="card">
          <h3>بيانات العرض التجريبي</h3>
          <p className="small muted">
            تنشئ بيانات اصطناعية كاملة (لائحتان متعارضتان، نموذج داخلي، نوع طلب، وطلب بمرفق ناقص) لتجربة المسار دون
            أي لائحة حقيقية.
          </p>
          <button type="button" className="btn primary" onClick={seedDemo}>
            إنشاء/إعادة إنشاء بيانات العرض
          </button>
        </section>
      )}
    </>
  );
}
