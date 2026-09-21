import { useState } from 'react';
import { api, EXTRACTION_LABELS, type SourceRecord } from '../api';
import SourceUploadForm from '../components/SourceUploadForm';
import {
  Badge,
  DemoBanner,
  Empty,
  ErrorBox,
  Loading,
  Notice,
  extractionBadge,
  formatDateTime,
  useAsync,
  useScope,
  useToast,
} from '../components/ui';

export default function TemplatesPage() {
  const { scope } = useScope();
  const { push } = useToast();
  const [showForm, setShowForm] = useState(false);
  const state = useAsync<{ sources: SourceRecord[] }>(() => api.get('/sources?templates=1', scope), [scope]);

  async function remove(source: SourceRecord) {
    if (!window.confirm(`حذف النموذج «${source.title}»؟`)) return;
    try {
      await api.del(`/sources/${source.id}`);
      push('تم الحذف.', 'success');
      state.reload();
    } catch (error) {
      push((error as Error).message, 'error');
    }
  }

  const hasTemplate = (state.data?.sources.length ?? 0) > 0;

  return (
    <>
      <div className="page-head">
        <div>
          <h2>النماذج</h2>
          <p>تسجيل النموذج الرسمي المعتمد وإدارة ربط حقوله.</p>
        </div>
        <span className="spacer" />
        <button type="button" className="btn primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'إغلاق النموذج' : 'رفع نموذج'}
        </button>
      </div>

      <DemoBanner scope={scope} />

      {!hasTemplate ? (
        <Notice kind="warn">
          <strong>النموذج الرسمي لم يضف بعد.</strong> أي مخرجات ينتجها التطبيق الآن هي مسودة داخلية، ولا تمثل النموذج
          الرسمي المعتمد ولا تدّعي مطابقة تنسيقه.
        </Notice>
      ) : (
        <Notice kind="warn">
          النموذج الرسمي مسجَّل، لكن <strong>ربط الحقول بالقالب لم يُعتمد بعد</strong>. التصدير الحالي مسودة عربية
          قابلة للطباعة، ولا يدّعي المحافظة على تنسيق النموذج.
        </Notice>
      )}

      <div className="card">
        <h3>هيكل نموذج المحضر المطلوب (مطبَّق في التصدير)</h3>
        <p className="small muted">
          رُتّبت أقسام مسودة المحضر وفق الهيكل المطلوب أدناه. هذا ترتيب أقسام فقط: مطابقة التنسيق والترويسة والصور
          والتخطيط لم تُتحقق لعدم استلام ملف القالب.
        </p>
        <ol className="small">
          <li>عنوان «محضر اجتماع».</li>
          <li>جدول بيانات الجلسة: اسم اللجنة، التاريخ، رقم الجلسة، الوقت.</li>
          <li>أولاً: أعضاء اللجنة حسب قرار تكوينها — م، الاسم، الصفة، حالة الحضور، سبب التغيب.</li>
          <li>ثانياً: جدول أعمال الجلسة — م، الموضوع (صفوف قابلة للتكرار).</li>
          <li>
            ثالثاً: المناقشات والقرارات أو التوصيات — لكل بند: الموضوع، ملخص الوصف والمناقشة، القرار/التوصية، ثم الجهة
            ذات العلاقة مرتبطة بالبند نفسه.
          </li>
          <li>رابعاً: رفع المحضر إلى المخاطب (الاسم والصفة قيمتان قابلتان للتحديث بعد مراجعة المستخدم).</li>
          <li>خامساً: رأي الأعضاء في المحضر — م، الاسم، الصفة، التوقيع.</li>
          <li>سادساً: الإضافات والملحوظات.</li>
        </ol>
        <Notice kind="warn">
          تشكيل اللجنة مصدر واحد لجدولي الحضور والتوقيع، فلا يختلف اسم بينهما. الحضور والتوقيع والقرار والاعتماد لا
          تُنشأ ولا تُنسخ من أي نموذج أو اجتماع سابق.
        </Notice>
      </div>

      <div className="card">
        <h3>ما يلزم لإضافة الربط الدقيق بالقالب لاحقًا</h3>
        <ol className="small">
          <li>استلام ملف النموذج الرسمي بصيغة DOCX قابلة للتحرير (لا صورة ولا PDF ممسوح)، والتحقق من بصمته.</li>
          <li>تحديد اسم كل حقل في النموذج وموضعه (جدول/فقرة/خانة) وقائمة الحقول الإلزامية.</li>
          <li>ربط كل حقل بمصدره داخل التطبيق: بيانات الطلب، أو بند في مصفوفة المطابقة، أو نص التوصية.</li>
          <li>اعتماد الربط من المستخدم، ثم تفعيل التصدير على القالب نفسه مع المحافظة على تنسيقه.</li>
          <li>
            التصدير على نسخة من القالب نفسه مع المحافظة على أجزائه وعلاقاته وصوره واتجاهه، ثم Render ومقارنة بصرية مع
            الأصل — لا إعادة بناء مستند Word من الصفر وتسميته مطابقًا.
          </li>
          <li>مطابقة مستند مُصدَّر واحد مع نسخة ورقية معتمدة قبل الاعتماد على التصدير رسميًا.</li>
        </ol>
      </div>

      {showForm && (
        <section className="card">
          <h3>رفع نموذج</h3>
          <p className="small muted">
            سيُسجَّل الملف كنموذج رسمي في هذا النطاق. حتى يُعتمد ربط الحقول، لا يُستخدم القالب في التصدير.
          </p>
          <SourceUploadForm
            scope={scope}
            asTemplate
            onDone={() => {
              setShowForm(false);
              state.reload();
            }}
          />
        </section>
      )}

      {state.loading && <Loading />}
      {state.error && <ErrorBox message={state.error} onRetry={state.reload} />}

      {state.data &&
        (state.data.sources.length === 0 ? (
          <Empty title="لا توجد نماذج مسجَّلة" hint="ارفع النموذج الرسمي فور استلامه من الجهة." />
        ) : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>العنوان</th>
                    <th>الإصدار</th>
                    <th>الملف</th>
                    <th>الفهرسة</th>
                    <th>تاريخ الرفع</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {state.data.sources.map((source) => (
                    <tr key={source.id}>
                      <td>{source.title}</td>
                      <td>{source.version || '—'}</td>
                      <td className="small">{source.fileName}</td>
                      <td>
                        <Badge kind={extractionBadge(source.extractionStatus)}>
                          {EXTRACTION_LABELS[source.extractionStatus] ?? source.extractionStatus}
                        </Badge>
                      </td>
                      <td className="small">{formatDateTime(source.createdAt)}</td>
                      <td>
                        <div className="row">
                          <a className="btn small" href={`/api/sources/${source.id}/file`}>
                            تنزيل
                          </a>
                          <button type="button" className="btn small danger" onClick={() => remove(source)}>
                            حذف
                          </button>
                        </div>
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
