import { useMemo, useState } from 'react';
import { api, type RequestTypeRecord, type RequirementRecord, type TrackRecord } from '../api';
import { Badge, DemoBanner, Empty, ErrorBox, Loading, Notice, useAsync, useScope, useToast } from '../components/ui';

const STATUS_LABELS: Record<string, string> = {
  candidate: 'مرشح',
  approved: 'معتمد',
  rejected: 'مرفوض',
};

export default function RequirementsPage() {
  const { scope } = useScope();
  const { push } = useToast();
  const [filter, setFilter] = useState('candidate');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [reviewer, setReviewer] = useState(() => localStorage.getItem('sca.reviewer') ?? '');

  const state = useAsync<{ requirements: RequirementRecord[] }>(
    () => api.get(`/requirements${filter === 'all' ? '' : `?status=${filter}`}`, scope),
    [scope, filter],
  );
  const types = useAsync<{ requestTypes: RequestTypeRecord[] }>(() => api.get('/request-types', scope), [scope]);
  const tracks = useAsync<{ tracks: TrackRecord[] }>(() => api.get('/tracks', scope), [scope]);

  const conflictKeys = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const req of state.data?.requirements ?? []) {
      if (!req.conflictKey || req.status !== 'approved') continue;
      const set = map.get(req.conflictKey) ?? new Set<string>();
      set.add(req.conflictValue);
      map.set(req.conflictKey, set);
    }
    return new Set([...map.entries()].filter(([, values]) => values.size > 1).map(([key]) => key));
  }, [state.data]);

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function applyStatus(status: 'approved' | 'rejected' | 'candidate') {
    if (selected.size === 0) {
      push('حدد متطلبًا واحدًا على الأقل.', 'error');
      return;
    }
    try {
      localStorage.setItem('sca.reviewer', reviewer);
      await api.post('/requirements/bulk-status', { ids: [...selected], status, reviewedBy: reviewer });
      push(`تم تحديث ${selected.size} متطلبًا إلى «${STATUS_LABELS[status]}».`, 'success');
      setSelected(new Set());
      state.reload();
    } catch (error) {
      push((error as Error).message, 'error');
    }
  }

  async function updateField(id: string, patch: Partial<RequirementRecord>) {
    try {
      await api.put(`/requirements/${id}`, patch);
      state.reload();
    } catch (error) {
      push((error as Error).message, 'error');
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h2>مراجعة المتطلبات واعتمادها</h2>
          <p>لا تدخل أي دراسة فعلية إلا بمتطلبات اعتمدها مراجع بشري.</p>
        </div>
      </div>

      <DemoBanner scope={scope} />

      <Notice>
        المتطلبات المستخرجة آليًا تصل بحالة «مرشح». راجع الاقتباس مقابل موضعه في المصدر قبل الاعتماد. ما لم يُعتمد لا
        يُستخدم في أي مصفوفة مطابقة. كل متطلب يحتاج مسارًا محددًا؛ والمتطلب بلا مسار لا يُطبَّق على أي طلب بدل أن
        يُعمَّم على الجميع.
      </Notice>

      <div className="card">
        <div className="row">
          <label className="small">التصفية:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="candidate">المرشحة</option>
            <option value="approved">المعتمدة</option>
            <option value="rejected">المرفوضة</option>
            <option value="all">الكل</option>
          </select>
          <label className="small">اسم المراجع:</label>
          <input value={reviewer} onChange={(e) => setReviewer(e.target.value)} placeholder="يُسجَّل مع قرار الاعتماد" />
          <span className="spacer" />
          <button type="button" className="btn primary" onClick={() => applyStatus('approved')}>
            اعتماد المحدد ({selected.size})
          </button>
          <button type="button" className="btn danger" onClick={() => applyStatus('rejected')}>
            رفض المحدد
          </button>
        </div>
      </div>

      {state.loading && <Loading />}
      {state.error && <ErrorBox message={state.error} onRetry={state.reload} />}

      {state.data &&
        (state.data.requirements.length === 0 ? (
          <Empty title="لا توجد متطلبات في هذه الحالة" hint="ارفع مصدرًا نظاميًا ثم استخرج المتطلبات المرشحة منه." />
        ) : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 34 }} />
                    <th>المتطلب</th>
                    <th>السند والموضع</th>
                    <th>المسار</th>
                    <th>ينطبق على</th>
                    <th>التعارض</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {state.data.requirements.map((req) => (
                    <tr key={req.id}>
                      <td>
                        <input
                          type="checkbox"
                          aria-label={`تحديد ${req.text}`}
                          checked={selected.has(req.id)}
                          onChange={() => toggle(req.id)}
                        />
                      </td>
                      <td>
                        <div>{req.text}</div>
                        {req.quote ? (
                          <div className="quote">«{req.quote}»</div>
                        ) : (
                          <div className="small" style={{ color: 'var(--warn)' }}>لا يوجد اقتباس حرفي محقَّق.</div>
                        )}
                        <div className="small muted">المصدر الآلي: {req.origin === 'ai' ? 'تحليل آلي' : 'إدخال يدوي'}</div>
                      </td>
                      <td className="small">
                        {req.sourceTitle}
                        <div className="muted">
                          إصدار {req.sourceVersion || '—'} — نفاذ {req.sourceEffectiveDate || '—'}
                        </div>
                        <div className="muted">
                          {req.locator || 'بدون موضع'}
                          {req.page ? ` — صفحة ${req.page}` : ''}
                          {req.clause ? ` — ${req.clause}` : ''}
                        </div>
                        {req.applicationDate && (
                          <div className="muted">تاريخ التطبيق: {req.applicationDate}</div>
                        )}
                      </td>
                      <td>
                        <select
                          value={req.tracks[0] ?? ''}
                          onChange={(e) => updateField(req.id, { tracks: e.target.value ? [e.target.value] : [] })}
                        >
                          <option value="">بلا مسار (لا يُطبَّق)</option>
                          {(tracks.data?.tracks ?? []).map((track) => (
                            <option key={track.slug} value={track.slug}>
                              {track.name}
                            </option>
                          ))}
                        </select>
                        {req.tracks.length === 0 && (
                          <div className="small" style={{ color: 'var(--warn)' }}>
                            بلا مسار: لن يُطبَّق على أي طلب.
                          </div>
                        )}
                      </td>
                      <td>
                        <select
                          value={req.appliesTo[0] ?? ''}
                          onChange={(e) => updateField(req.id, { appliesTo: e.target.value ? [e.target.value] : [] })}
                        >
                          <option value="">جميع الأنواع</option>
                          {(types.data?.requestTypes ?? []).map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="small">
                        {req.conflictKey ? (
                          <>
                            <div>{req.conflictKey}</div>
                            <div className="muted">{req.conflictValue || '—'}</div>
                            {conflictKeys.has(req.conflictKey) && <Badge kind="warn">تعارض بين مصدرين</Badge>}
                          </>
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                      <td>
                        <Badge kind={req.status === 'approved' ? 'ok' : req.status === 'rejected' ? 'danger' : 'neutral'}>
                          {STATUS_LABELS[req.status] ?? req.status}
                        </Badge>
                        {req.reviewedBy && <div className="small muted">راجعه: {req.reviewedBy}</div>}
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
