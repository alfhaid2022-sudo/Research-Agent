import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, EXTRACTION_LABELS, INTAKE_LABELS, type SourceRecord, type TrackRecord } from '../api';
import SourceRelations from '../components/SourceRelations';
import SourceUploadForm from '../components/SourceUploadForm';
import {
  Badge,
  DemoBanner,
  Empty,
  ErrorBox,
  Loading,
  Notice,
  extractionBadge,
  formatBytes,
  useAsync,
  useScope,
  useToast,
} from '../components/ui';

export default function RegulationsPage() {
  const { scope } = useScope();
  const { push } = useToast();
  const [showForm, setShowForm] = useState(false);
  const state = useAsync<{ sources: SourceRecord[] }>(() => api.get('/sources', scope), [scope]);
  const tracks = useAsync<{ tracks: TrackRecord[] }>(() => api.get('/tracks', scope), [scope]);
  const trackName = (slug: string) =>
    tracks.data?.tracks.find((track) => track.slug === slug)?.name ?? (slug ? slug : 'عام');

  async function remove(source: SourceRecord) {
    if (!window.confirm(`حذف «${source.title}» ومتطلباته المرشحة؟ لا يمكن التراجع.`)) return;
    try {
      await api.del(`/sources/${source.id}`);
      push('تم حذف المصدر.', 'success');
      state.reload();
    } catch (error) {
      push((error as Error).message, 'error');
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h2>مكتبة اللوائح</h2>
          <p>رفع المصادر النظامية وفهرستها بمقاطع لها مواضع ثابتة يمكن الاستشهاد بها.</p>
        </div>
        <span className="spacer" />
        <button type="button" className="btn primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'إغلاق النموذج' : 'رفع مصدر جديد'}
        </button>
      </div>

      <DemoBanner scope={scope} />

      <Notice>
        لا يستخرج التطبيق أي قاعدة من خارج الملفات المرفوعة. المقاطع غير المقروءة تُعلَّم بأنها تحتاج OCR أو مراجعة
        يدوية، ولا يُدّعى أنها قُرئت.
      </Notice>

      {showForm && (
        <section className="card">
          <h3>رفع مصدر نظامي</h3>
          <SourceUploadForm
            scope={scope}
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
          <Empty
            title="لا توجد مصادر بعد"
            hint="ارفع اللائحة أو الدليل المعتمد لدى الجهة لتبدأ الفهرسة واستخراج المتطلبات."
            action={
              <button type="button" className="btn primary" onClick={() => setShowForm(true)}>
                رفع مصدر
              </button>
            }
          />
        ) : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>العنوان</th>
                    <th>المسار</th>
                    <th>الجهة</th>
                    <th>الإصدار</th>
                    <th>تاريخ النفاذ</th>
                    <th>الفهرسة وجودة النص</th>
                    <th>الاستلام</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {state.data.sources.map((source) => (
                    <tr key={source.id}>
                      <td>
                        <Link to={`/regulations/${source.id}`}>{source.title}</Link>
                        <div className="small muted">{source.fileName}</div>
                      </td>
                      <td className="small">{trackName(source.track)}</td>
                      <td>{source.issuer || '—'}</td>
                      <td>{source.version || '—'}</td>
                      <td>{source.effectiveDate || '—'}</td>
                      <td>
                        <Badge kind={extractionBadge(source.extractionStatus)}>
                          {EXTRACTION_LABELS[source.extractionStatus] ?? source.extractionStatus}
                        </Badge>
                        <div className="small muted">
                          {source.segmentCount} مقطعًا
                          {source.pageCount > 0 ? ` (${source.pageCount} صفحة)` : ''}
                          {source.needsOcrSegments > 0 ? ` — ${source.needsOcrSegments} بلا نص` : ''}
                          {source.needsReviewSegments > 0 ? ` — ${source.needsReviewSegments} يحتاج مراجعة` : ''}
                        </div>
                        <div className="small muted">{formatBytes(source.size)}</div>
                      </td>
                      <td className="small">
                        <Badge kind={source.intakeStatus === 'hash_mismatch' ? 'danger' : source.intakeStatus === 'verified' ? 'ok' : 'neutral'}>
                          {INTAKE_LABELS[source.intakeStatus] ?? source.intakeStatus}
                        </Badge>
                        {source.intakeNote && <div className="muted">{source.intakeNote}</div>}
                      </td>
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

      {state.data && state.data.sources.length > 1 && (
        <SourceRelations scope={scope} sources={state.data.sources} />
      )}
    </>
  );
}
