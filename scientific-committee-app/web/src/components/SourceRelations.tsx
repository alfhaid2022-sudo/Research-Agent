import { useState } from 'react';
import { api, RELATION_KIND_LABELS, type RelationRecord, type Scope, type SourceRecord } from '../api';
import { Badge, Field, Loading, Notice, useAsync, useToast } from './ui';

/**
 * Amend / supersede / interpret links between sources. An unresolved link blocks a
 * conclusive study in its track: the app records the relation, a human decides it.
 */
export default function SourceRelations({ scope, sources }: { scope: Scope; sources: SourceRecord[] }) {
  const { push } = useToast();
  const state = useAsync<{ relations: RelationRecord[] }>(() => api.get('/relations', scope), [scope]);
  const [form, setForm] = useState({ fromSourceId: '', toSourceId: '', kind: 'amends', subject: '', note: '', track: '' });
  const [notes, setNotes] = useState<Record<string, string>>({});

  async function create() {
    if (!form.fromSourceId || !form.toSourceId) {
      push('اختر المصدرين.', 'error');
      return;
    }
    try {
      await api.post('/relations', { ...form, scope });
      push('سُجّلت العلاقة بحالة «غير محسومة».', 'success');
      setForm({ fromSourceId: '', toSourceId: '', kind: 'amends', subject: '', note: '', track: '' });
      state.reload();
    } catch (error) {
      push((error as Error).message, 'error');
    }
  }

  async function resolve(id: string) {
    try {
      await api.post(`/relations/${id}/resolve`, { note: notes[id] ?? '', resolvedBy: 'مراجع محلي' });
      push('حُسمت العلاقة وسُجّلت نتيجة المراجعة.', 'success');
      state.reload();
    } catch (error) {
      push((error as Error).message, 'error');
    }
  }

  async function remove(id: string) {
    if (!window.confirm('حذف هذه العلاقة؟')) return;
    await api.del(`/relations/${id}`);
    state.reload();
  }

  return (
    <section className="card">
      <h3>علاقات المصادر (تعديل / استبدال / تفسير)</h3>
      <Notice>
        تُسجَّل العلاقة كما هي ولا يرجّح التطبيق طرفًا على آخر. أي علاقة غير محسومة تمنع إصدار دراسة نهائية في مسارها.
      </Notice>

      <div className="form-row">
        <Field label="المصدر الأحدث/المعدِّل">
          <select value={form.fromSourceId} onChange={(e) => setForm({ ...form, fromSourceId: e.target.value })}>
            <option value="">—</option>
            {sources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="نوع العلاقة">
          <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
            {Object.entries(RELATION_KIND_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="المصدر المتأثر">
          <select value={form.toSourceId} onChange={(e) => setForm({ ...form, toSourceId: e.target.value })}>
            <option value="">—</option>
            {sources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.title}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="form-row">
        <Field label="موضوع العلاقة" hint="مثال: معاملة المجلات المحلية، أو مدة التقديم.">
          <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        </Field>
        <Field label="ملاحظة">
          <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </Field>
      </div>
      <button type="button" className="btn" onClick={create}>
        تسجيل العلاقة
      </button>

      {state.loading && <Loading />}
      {state.data && state.data.relations.length > 0 && (
        <div className="stack" style={{ marginTop: 14 }}>
          {state.data.relations.map((relation) => (
            <div key={relation.id} className="segment">
              <div className="locator">
                {relation.fromTitle} <Badge kind="info">{relation.kindLabel}</Badge> {relation.toTitle}{' '}
                {relation.status === 'resolved' ? <Badge kind="ok">محسومة</Badge> : <Badge kind="warn">غير محسومة</Badge>}
              </div>
              {relation.subject && <div className="small">الموضوع: {relation.subject}</div>}
              {relation.note && <div className="small muted">{relation.note}</div>}
              {relation.status === 'resolved' ? (
                <div className="small">نتيجة المراجعة: {relation.resolutionNote}</div>
              ) : (
                <>
                  <Field label="نتيجة المراجعة التي تحسم الأثر">
                    <textarea
                      value={notes[relation.id] ?? ''}
                      onChange={(e) => setNotes({ ...notes, [relation.id]: e.target.value })}
                    />
                  </Field>
                  <div className="row">
                    <button type="button" className="btn small" onClick={() => resolve(relation.id)}>
                      حسم العلاقة
                    </button>
                    <button type="button" className="btn small danger" onClick={() => remove(relation.id)}>
                      حذف
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
