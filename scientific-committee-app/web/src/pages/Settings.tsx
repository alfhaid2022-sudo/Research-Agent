import { useEffect, useState } from 'react';
import { api, type AiStatus, type CommitteeMember, type RequestTypeRecord, type TrackRecord } from '../api';
import { Badge, DemoBanner, ErrorBox, Field, Loading, Notice, useAsync, useScope, useToast } from '../components/ui';

interface SettingsPayload {
  settings: Record<string, string>;
  ai: AiStatus;
}

export default function SettingsPage() {
  const { scope } = useScope();
  const { push } = useToast();
  const state = useAsync<SettingsPayload>(() => api.get('/settings'), []);
  const types = useAsync<{ requestTypes: RequestTypeRecord[] }>(() => api.get('/request-types', scope), [scope]);

  const [org, setOrg] = useState<Record<string, string>>({});
  const [newType, setNewType] = useState({ name: '', description: '', checklist: '', track: '' });
  const tracks = useAsync<{ tracks: TrackRecord[] }>(() => api.get('/tracks', scope), [scope]);
  const [newTrack, setNewTrack] = useState({ slug: '', name: '', description: '' });
  const members = useAsync<{ members: CommitteeMember[]; notice: string }>(
    () => api.get('/committee-members', scope),
    [scope],
  );
  const [newMember, setNewMember] = useState({ name: '', role: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (state.data) setOrg(state.data.settings);
  }, [state.data]);

  async function saveOrg() {
    setBusy(true);
    try {
      await api.put('/settings', org);
      push('حُفظت إعدادات الجهة.', 'success');
      state.reload();
    } catch (error) {
      push((error as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function addType() {
    if (newType.name.trim().length < 2) {
      push('اكتب اسم نوع الطلب.', 'error');
      return;
    }
    if (!newType.track) {
      push('اختر مسار النوع — لا تُطبَّق ضوابط مسار على مسار آخر.', 'error');
      return;
    }
    try {
      await api.post('/request-types', {
        name: newType.name.trim(),
        track: newType.track,
        description: newType.description.trim(),
        checklist: newType.checklist.split('\n').map((s) => s.trim()).filter(Boolean),
        scope,
      });
      push('أُضيف نوع الطلب.', 'success');
      setNewType({ name: '', description: '', checklist: '', track: '' });
      types.reload();
    } catch (error) {
      push((error as Error).message, 'error');
    }
  }

  async function toggleType(type: RequestTypeRecord) {
    await api.put(`/request-types/${type.id}`, { active: !type.active });
    types.reload();
  }

  async function removeType(type: RequestTypeRecord) {
    if (!window.confirm(`حذف النوع «${type.name}»؟`)) return;
    try {
      await api.del(`/request-types/${type.id}`);
      types.reload();
    } catch (error) {
      push((error as Error).message, 'error');
    }
  }

  async function addTrack() {
    if (!/^[a-z0-9_-]{2,}$/.test(newTrack.slug) || newTrack.name.trim().length < 2) {
      push('أدخل معرّفًا لاتينيًا واسمًا عربيًا للمسار.', 'error');
      return;
    }
    try {
      await api.post('/tracks', { ...newTrack, scope });
      push('أُضيف المسار.', 'success');
      setNewTrack({ slug: '', name: '', description: '' });
      tracks.reload();
    } catch (error) {
      push((error as Error).message, 'error');
    }
  }

  async function removeTrack(slug: string) {
    if (!window.confirm('حذف هذا المسار؟')) return;
    try {
      await api.del(`/tracks/${slug}?scope=${scope}`);
      tracks.reload();
    } catch (error) {
      push((error as Error).message, 'error');
    }
  }

  async function addMember() {
    if (newMember.name.trim().length < 2) {
      push('اكتب اسم العضو.', 'error');
      return;
    }
    try {
      await api.post('/committee-members', { ...newMember, scope });
      push('أُضيف العضو إلى تشكيل اللجنة.', 'success');
      setNewMember({ name: '', role: '' });
      members.reload();
    } catch (error) {
      push((error as Error).message, 'error');
    }
  }

  async function updateMember(member: CommitteeMember, patch: Partial<CommitteeMember>) {
    try {
      await api.put(`/committee-members/${member.id}`, patch);
      members.reload();
    } catch (error) {
      push((error as Error).message, 'error');
    }
  }

  async function removeMember(member: CommitteeMember) {
    if (!window.confirm(`حذف «${member.name}» من تشكيل اللجنة؟`)) return;
    try {
      await api.del(`/committee-members/${member.id}`);
      members.reload();
    } catch (error) {
      push((error as Error).message, 'error');
    }
  }

  async function clearDemo() {
    if (!window.confirm('حذف جميع بيانات العرض التجريبي؟ لن تتأثر البيانات الفعلية.')) return;
    await api.del('/demo');
    push('حُذفت بيانات العرض التجريبي.', 'success');
    types.reload();
  }

  if (state.loading) return <Loading />;
  if (state.error) return <ErrorBox message={state.error} onRetry={state.reload} />;

  const ai = state.data?.ai;

  return (
    <>
      <div className="page-head">
        <div>
          <h2>الإعدادات</h2>
          <p>بيانات الجهة، وأنواع الطلبات، وحالة خدمة التحليل الآلي.</p>
        </div>
      </div>

      <DemoBanner scope={scope} />

      <section className="card">
        <h3>بيانات الجهة</h3>
        <p className="small muted">تظهر في ترويسة المسودات المصدَّرة. لا يُستخدم أي شعار رسمي في هذا الإصدار.</p>
        <div className="form-row">
          <Field label="الجامعة">
            <input value={org['org.university'] ?? ''} onChange={(e) => setOrg({ ...org, 'org.university': e.target.value })} />
          </Field>
          <Field label="الكلية">
            <input value={org['org.college'] ?? ''} onChange={(e) => setOrg({ ...org, 'org.college': e.target.value })} />
          </Field>
          <Field label="القسم">
            <input value={org['org.department'] ?? ''} onChange={(e) => setOrg({ ...org, 'org.department': e.target.value })} />
          </Field>
          <Field label="اسم اللجنة">
            <input value={org['org.committee'] ?? ''} onChange={(e) => setOrg({ ...org, 'org.committee': e.target.value })} />
          </Field>
          <Field label="اسم المراجع/المقرر">
            <input value={org['org.reviewer'] ?? ''} onChange={(e) => setOrg({ ...org, 'org.reviewer': e.target.value })} />
          </Field>
        </div>
        <button type="button" className="btn primary" onClick={saveOrg} disabled={busy}>
          حفظ
        </button>
      </section>

      <section className="card">
        <h3>مسارات الضوابط</h3>
        <p className="small muted">
          لكل مسار ضوابطه ومصادره. لا يطبّق التطبيق ضوابط مسار على طلب من مسار آخر، ولا يجمع شروط مسارين في نتيجة
          واحدة.
        </p>
        <div className="form-row">
          <Field label="المعرّف" hint="أحرف لاتينية صغيرة وأرقام وشرطات.">
            <input dir="ltr" value={newTrack.slug} onChange={(e) => setNewTrack({ ...newTrack, slug: e.target.value })} />
          </Field>
          <Field label="الاسم بالعربية">
            <input value={newTrack.name} onChange={(e) => setNewTrack({ ...newTrack, name: e.target.value })} />
          </Field>
          <Field label="الوصف">
            <input
              value={newTrack.description}
              onChange={(e) => setNewTrack({ ...newTrack, description: e.target.value })}
            />
          </Field>
        </div>
        <button type="button" className="btn" onClick={addTrack}>
          إضافة مسار
        </button>
        {tracks.data && tracks.data.tracks.length > 0 && (
          <div className="table-wrap" style={{ marginTop: 14 }}>
            <table>
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>المعرّف</th>
                  <th>الوصف</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {tracks.data.tracks.map((track) => (
                  <tr key={track.slug}>
                    <td>{track.name}</td>
                    <td className="small" dir="ltr" style={{ textAlign: 'right' }}>
                      {track.slug}
                    </td>
                    <td className="small">{track.description || '—'}</td>
                    <td>
                      {track.builtin ? (
                        <Badge kind="neutral">مدمج</Badge>
                      ) : (
                        <button type="button" className="btn small danger" onClick={() => removeTrack(track.slug)}>
                          حذف
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <h3>تشكيل اللجنة</h3>
        <p className="small muted">{members.data?.notice}</p>
        <div className="form-row">
          <Field label="الاسم">
            <input value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} />
          </Field>
          <Field label="الصفة">
            <input value={newMember.role} onChange={(e) => setNewMember({ ...newMember, role: e.target.value })} />
          </Field>
        </div>
        <button type="button" className="btn" onClick={addMember}>
          إضافة عضو
        </button>
        {members.data && members.data.members.length > 0 && (
          <div className="table-wrap" style={{ marginTop: 14 }}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: 60 }}>م</th>
                  <th>الاسم</th>
                  <th>الصفة</th>
                  <th>الحالة</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {members.data.members.map((member) => (
                  <tr key={member.id}>
                    <td>{member.ordinal}</td>
                    <td>
                      <input
                        defaultValue={member.name}
                        onBlur={(e) =>
                          e.target.value !== member.name && updateMember(member, { name: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        defaultValue={member.role}
                        onBlur={(e) =>
                          e.target.value !== member.role && updateMember(member, { role: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <Badge kind={member.active ? 'ok' : 'neutral'}>{member.active ? 'فعّال' : 'معطّل'}</Badge>
                    </td>
                    <td>
                      <div className="row">
                        <button
                          type="button"
                          className="btn small"
                          onClick={() => updateMember(member, { active: !member.active })}
                        >
                          {member.active ? 'تعطيل' : 'تفعيل'}
                        </button>
                        <button type="button" className="btn small danger" onClick={() => removeMember(member)}>
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

      <section className="card">
        <h3>أنواع الطلبات ({scope === 'demo' ? 'النطاق التجريبي' : 'النطاق الفعلي'})</h3>
        <p className="small muted">
          أنواع الطلبات قابلة للإعداد بالكامل ولم يُفترض أي نوع مسبقًا. قائمة التحقق تُستخدم لرصد النواقص في كل طلب.
        </p>
        <div className="form-row">
          <Field label="اسم النوع">
            <input value={newType.name} onChange={(e) => setNewType({ ...newType, name: e.target.value })} />
          </Field>
          <Field label="المسار" hint="يحدد أي ضوابط تنطبق. لا تُسحب ضوابط مسار على مسار آخر.">
            <select value={newType.track} onChange={(e) => setNewType({ ...newType, track: e.target.value })}>
              <option value="">—</option>
              {(tracks.data?.tracks ?? []).map((track) => (
                <option key={track.slug} value={track.slug}>
                  {track.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="الوصف">
            <input value={newType.description} onChange={(e) => setNewType({ ...newType, description: e.target.value })} />
          </Field>
        </div>
        <Field label="قائمة المرفقات المطلوبة" hint="عنصر في كل سطر.">
          <textarea value={newType.checklist} onChange={(e) => setNewType({ ...newType, checklist: e.target.value })} />
        </Field>
        <button type="button" className="btn" onClick={addType}>
          إضافة نوع
        </button>

        {types.data && types.data.requestTypes.length > 0 && (
          <div className="table-wrap" style={{ marginTop: 14 }}>
            <table>
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>المسار</th>
                  <th>الوصف</th>
                  <th>قائمة التحقق</th>
                  <th>الحالة</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {types.data.requestTypes.map((type) => (
                  <tr key={type.id}>
                    <td>{type.name}</td>
                    <td className="small">
                      {tracks.data?.tracks.find((track) => track.slug === type.track)?.name ?? type.track ?? '—'}
                    </td>
                    <td className="small">{type.description || '—'}</td>
                    <td className="small">{type.checklist.length > 0 ? type.checklist.join('، ') : '—'}</td>
                    <td>
                      <Badge kind={type.active ? 'ok' : 'neutral'}>{type.active ? 'مفعّل' : 'معطّل'}</Badge>
                    </td>
                    <td>
                      <div className="row">
                        <button type="button" className="btn small" onClick={() => toggleType(type)}>
                          {type.active ? 'تعطيل' : 'تفعيل'}
                        </button>
                        <button type="button" className="btn small danger" onClick={() => removeType(type)}>
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

      <section className="card">
        <h3>خدمة التحليل الآلي</h3>
        {ai && (
          <>
            <div className="row">
              <Badge kind={ai.enabled ? 'ok' : 'warn'}>{ai.enabled ? 'مفعّل' : 'غير مفعّل'}</Badge>
              <span className="small">{ai.reason}</span>
            </div>
            <table style={{ marginTop: 10 }}>
              <tbody>
                <tr>
                  <th style={{ width: '30%' }}>المزوّد</th>
                  <td>{ai.provider}</td>
                </tr>
                <tr>
                  <th>النموذج</th>
                  <td>{ai.model}</td>
                </tr>
                <tr>
                  <th>عنوان الخدمة</th>
                  <td dir="ltr" style={{ textAlign: 'right' }}>{ai.baseUrl}</td>
                </tr>
              </tbody>
            </table>
            <Notice kind={ai.enabled ? 'warn' : 'neutral'}>{ai.dataNotice}</Notice>
            <p className="small muted">
              يُضبط المفتاح في ملف <code>.env</code> على الخادم عبر المتغير <code>AI_API_KEY</code> فقط. لا يُرسل
              المفتاح إلى المتصفح ولا يُحفظ في المستودع، ولا يُستخدم اشتراك Claude Code كمفتاح لهذا التطبيق.
            </p>
          </>
        )}
      </section>

      <section className="card">
        <h3>بيانات العرض التجريبي</h3>
        <p className="small muted">
          بيانات العرض منفصلة تمامًا عن العمل الفعلي: لا تظهر في النطاق الفعلي، ولا يمكن الاستشهاد بها في دراسة فعلية.
        </p>
        <button type="button" className="btn danger" onClick={clearDemo}>
          حذف بيانات العرض التجريبي
        </button>
      </section>
    </>
  );
}
