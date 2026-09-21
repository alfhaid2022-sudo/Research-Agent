import { useState } from 'react';
import {
  api,
  APPROVAL_LABELS,
  CALENDAR_LABELS,
  type AwardClaimRecord,
  type ParticipationRecord,
  type PublicationRecord,
} from '../api';
import { Badge, Field, Loading, Notice, useAsync, useToast } from './ui';

const CALENDAR_OPTIONS = ['', 'gregorian', 'hijri'] as const;

/**
 * Structured request data: publications, participations and award claims.
 *
 * Classifications are stored with their own type, so a quartile never turns into a
 * reward category; dates keep the calendar they were entered in.
 */
export default function RequestDossier({ requestId, track }: { requestId: string; track: string }) {
  return (
    <>
      <Publications requestId={requestId} />
      {track === 'conference' && <Participations requestId={requestId} />}
      {track === 'excellence_award' && <AwardClaims requestId={requestId} />}
    </>
  );
}

function Publications({ requestId }: { requestId: string }) {
  const { push } = useToast();
  const state = useAsync<{ publications: PublicationRecord[] }>(
    () => api.get(`/requests/${requestId}/publications`),
    [requestId],
  );
  const [form, setForm] = useState({
    title: '',
    venue: '',
    authorOrder: '',
    isFirstAuthor: false,
    soleAffiliation: false,
    affiliation: '',
    status: '',
    statusDate: '',
    statusCalendar: '' as string,
    gregorianYear: '',
    academicYear: '',
    classificationSource: '',
    classificationType: 'quartile',
    classificationValue: '',
    classificationYear: '',
  });

  async function add() {
    if (form.title.trim().length < 2) {
      push('اكتب عنوان البحث.', 'error');
      return;
    }
    try {
      await api.post(`/requests/${requestId}/publications`, {
        ...form,
        authorOrder: form.authorOrder ? Number(form.authorOrder) : undefined,
      });
      push('أُضيف البحث.', 'success');
      setForm({ ...form, title: '', venue: '', authorOrder: '', classificationValue: '' });
      state.reload();
    } catch (error) {
      push((error as Error).message, 'error');
    }
  }

  async function remove(id: string) {
    await api.del(`/publications/${id}`);
    state.reload();
  }

  return (
    <section className="card">
      <h3>الأبحاث المرتبطة بالطلب</h3>
      <Notice>
        نوع التصنيف يُسجَّل مستقلًا عن قيمته: الربع التصنيفي (Q1/Q2) ليس فئة المكافأة (أ/ب/ج)، ولا يشتق التطبيق
        أحدهما من الآخر. تُسجَّل كذلك سنة التصنيف ومصدره وترتيب المؤلف والانتماء.
      </Notice>
      <div className="form-row">
        <Field label="عنوان البحث">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <Field label="المجلة/الوعاء">
          <input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
        </Field>
        <Field label="ترتيب المؤلف">
          <input
            type="number"
            min={1}
            value={form.authorOrder}
            onChange={(e) => setForm({ ...form, authorOrder: e.target.value })}
          />
        </Field>
      </div>
      <div className="form-row">
        <Field label="الانتماء المذكور في البحث">
          <input value={form.affiliation} onChange={(e) => setForm({ ...form, affiliation: e.target.value })} />
        </Field>
        <Field label="حالة البحث" hint="منشور/مقبول كما ورد في الدليل المرفق.">
          <input value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
        </Field>
        <Field label="تاريخ الحالة">
          <input value={form.statusDate} onChange={(e) => setForm({ ...form, statusDate: e.target.value })} />
        </Field>
        <Field label="تقويم التاريخ">
          <select value={form.statusCalendar} onChange={(e) => setForm({ ...form, statusCalendar: e.target.value })}>
            {CALENDAR_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {CALENDAR_LABELS[value]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="form-row">
        <Field label="السنة الميلادية" hint="تُسجَّل مستقلة عن العام الدراسي ولا يُحوَّل بينهما.">
          <input value={form.gregorianYear} onChange={(e) => setForm({ ...form, gregorianYear: e.target.value })} />
        </Field>
        <Field label="العام الدراسي">
          <input value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} />
        </Field>
        <Field label="مصدر التصنيف" hint="قاعدة البيانات أو المستند الذي أُخذ منه التصنيف.">
          <input
            value={form.classificationSource}
            onChange={(e) => setForm({ ...form, classificationSource: e.target.value })}
          />
        </Field>
      </div>
      <div className="form-row">
        <Field label="نوع التصنيف">
          <select
            value={form.classificationType}
            onChange={(e) => setForm({ ...form, classificationType: e.target.value })}
          >
            <option value="quartile">ربع تصنيفي (Q1/Q2/Q3/Q4)</option>
            <option value="reward_category">فئة مكافأة (أ/ب/ج)</option>
            <option value="other">تصنيف آخر</option>
          </select>
        </Field>
        <Field label="قيمة التصنيف">
          <input
            value={form.classificationValue}
            onChange={(e) => setForm({ ...form, classificationValue: e.target.value })}
          />
        </Field>
        <Field label="سنة التصنيف">
          <input
            value={form.classificationYear}
            onChange={(e) => setForm({ ...form, classificationYear: e.target.value })}
          />
        </Field>
      </div>
      <div className="row">
        <label className="small">
          <input
            type="checkbox"
            checked={form.isFirstAuthor}
            onChange={(e) => setForm({ ...form, isFirstAuthor: e.target.checked })}
          />{' '}
          باحث أول
        </label>
        <label className="small">
          <input
            type="checkbox"
            checked={form.soleAffiliation}
            onChange={(e) => setForm({ ...form, soleAffiliation: e.target.checked })}
          />{' '}
          انتماء وحيد للجامعة
        </label>
        <button type="button" className="btn" onClick={add}>
          إضافة بحث
        </button>
      </div>

      {state.loading && <Loading />}
      {state.data && state.data.publications.length > 0 && (
        <div className="table-wrap" style={{ marginTop: 12 }}>
          <table>
            <thead>
              <tr>
                <th>العنوان</th>
                <th>الوعاء</th>
                <th>المؤلف</th>
                <th>التصنيف</th>
                <th>السنوات</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {state.data.publications.map((publication) => (
                <tr key={publication.id}>
                  <td>{publication.title}</td>
                  <td className="small">{publication.venue || '—'}</td>
                  <td className="small">
                    {publication.authorOrder ? `الترتيب ${publication.authorOrder}` : '—'}
                    {publication.isFirstAuthor && <div><Badge kind="info">باحث أول</Badge></div>}
                    {publication.soleAffiliation && <div className="muted">انتماء وحيد</div>}
                  </td>
                  <td className="small">
                    <Badge kind="neutral">{publication.classificationTypeLabel || '—'}</Badge>
                    <div>{publication.classificationValue || '—'}</div>
                    <div className="muted">{publication.classificationSource || 'المصدر غير مذكور'}</div>
                  </td>
                  <td className="small">
                    {publication.gregorianYear ? `ميلادي ${publication.gregorianYear}` : ''}
                    {publication.academicYear ? <div>دراسي {publication.academicYear}</div> : null}
                    {publication.classificationYear ? <div>تصنيف {publication.classificationYear}</div> : null}
                  </td>
                  <td>
                    <button type="button" className="btn small danger" onClick={() => remove(publication.id)}>
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Participations({ requestId }: { requestId: string }) {
  const { push } = useToast();
  const state = useAsync<{ participations: ParticipationRecord[] }>(
    () => api.get(`/requests/${requestId}/participations`),
    [requestId],
  );
  const [form, setForm] = useState({
    eventName: '',
    eventPlace: '',
    organizer: '',
    participationKind: '',
    startDate: '',
    endDate: '',
    dateCalendar: '',
    academicYear: '',
    approvalState: 'unrecorded',
    approvalNote: '',
  });

  async function add() {
    if (form.eventName.trim().length < 2) {
      push('اكتب اسم الفعالية.', 'error');
      return;
    }
    try {
      await api.post(`/requests/${requestId}/participations`, form);
      push('سُجّلت المشاركة.', 'success');
      setForm({ ...form, eventName: '', startDate: '', endDate: '' });
      state.reload();
    } catch (error) {
      push((error as Error).message, 'error');
    }
  }

  return (
    <section className="card">
      <h3>سجل المشاركات والموافقات</h3>
      <Notice>
        تُسجَّل المشاركات وتواريخها بتقويمها كما أُدخلت، والعام الدراسي حقل مستقل. لا يحتسب التطبيق فروق أيام ولا
        يحوّل بين التقويمين ما لم ينص عليه مصدر معتمد.
      </Notice>
      <div className="form-row">
        <Field label="اسم الفعالية">
          <input value={form.eventName} onChange={(e) => setForm({ ...form, eventName: e.target.value })} />
        </Field>
        <Field label="المكان">
          <input value={form.eventPlace} onChange={(e) => setForm({ ...form, eventPlace: e.target.value })} />
        </Field>
        <Field label="الجهة المنظمة">
          <input value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} />
        </Field>
        <Field label="نوع المشاركة" hint="كما ورد في مستندات الطلب.">
          <input
            value={form.participationKind}
            onChange={(e) => setForm({ ...form, participationKind: e.target.value })}
          />
        </Field>
      </div>
      <div className="form-row">
        <Field label="من تاريخ">
          <input value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
        </Field>
        <Field label="إلى تاريخ">
          <input value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
        </Field>
        <Field label="تقويم التاريخ">
          <select value={form.dateCalendar} onChange={(e) => setForm({ ...form, dateCalendar: e.target.value })}>
            {CALENDAR_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {CALENDAR_LABELS[value]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="العام الدراسي">
          <input value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} />
        </Field>
        <Field label="حالة الموافقة">
          <select value={form.approvalState} onChange={(e) => setForm({ ...form, approvalState: e.target.value })}>
            {Object.entries(APPROVAL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <button type="button" className="btn" onClick={add}>
        إضافة مشاركة
      </button>

      {state.data && state.data.participations.length > 0 && (
        <div className="table-wrap" style={{ marginTop: 12 }}>
          <table>
            <thead>
              <tr>
                <th>الفعالية</th>
                <th>التواريخ</th>
                <th>العام الدراسي</th>
                <th>الموافقة</th>
              </tr>
            </thead>
            <tbody>
              {state.data.participations.map((participation) => (
                <tr key={participation.id}>
                  <td>
                    {participation.eventName}
                    <div className="small muted">
                      {participation.eventPlace || '—'} — {participation.organizer || '—'}
                    </div>
                  </td>
                  <td className="small">
                    {participation.startDate || '—'} → {participation.endDate || '—'}
                    <div className="muted">{CALENDAR_LABELS[participation.dateCalendar] ?? ''}</div>
                  </td>
                  <td className="small">{participation.academicYear || '—'}</td>
                  <td>
                    <Badge kind={participation.approvalState === 'approved' ? 'ok' : 'neutral'}>
                      {APPROVAL_LABELS[participation.approvalState] ?? participation.approvalState}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function AwardClaims({ requestId }: { requestId: string }) {
  const { push } = useToast();
  const state = useAsync<{ awardClaims: AwardClaimRecord[]; notice: string }>(
    () => api.get(`/requests/${requestId}/award-claims`),
    [requestId],
  );
  const [form, setForm] = useState({
    achievementKind: '',
    achievementTitle: '',
    achievementDate: '',
    dateCalendar: '',
    sharePercent: '',
    shareBasis: '',
    departmentApproval: 'unrecorded',
    collegeApproval: 'unrecorded',
    councilApproval: 'unrecorded',
    financialReference: '',
  });

  async function add() {
    if (form.achievementTitle.trim().length < 2) {
      push('اكتب وصف الإنجاز.', 'error');
      return;
    }
    try {
      await api.post(`/requests/${requestId}/award-claims`, form);
      push('سُجّل الإنجاز.', 'success');
      setForm({ ...form, achievementTitle: '', achievementDate: '', sharePercent: '' });
      state.reload();
    } catch (error) {
      push((error as Error).message, 'error');
    }
  }

  return (
    <section className="card">
      <h3>بيانات مكافأة التميز</h3>
      <Notice kind="warn">{state.data?.notice ?? 'لا يُحتسب أي صرف داخل التطبيق.'}</Notice>
      <div className="form-row">
        <Field label="نوع الإنجاز" hint="نشر علمي، جائزة، براءة… كما ورد في مستندات الطلب.">
          <input value={form.achievementKind} onChange={(e) => setForm({ ...form, achievementKind: e.target.value })} />
        </Field>
        <Field label="وصف الإنجاز">
          <input
            value={form.achievementTitle}
            onChange={(e) => setForm({ ...form, achievementTitle: e.target.value })}
          />
        </Field>
        <Field label="تاريخ الإنجاز">
          <input value={form.achievementDate} onChange={(e) => setForm({ ...form, achievementDate: e.target.value })} />
        </Field>
        <Field label="تقويم التاريخ">
          <select value={form.dateCalendar} onChange={(e) => setForm({ ...form, dateCalendar: e.target.value })}>
            {CALENDAR_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {CALENDAR_LABELS[value]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="form-row">
        <Field label="حصة المستفيد" hint="تُدخَل كما تقررها الجهة؛ لا يحسبها التطبيق.">
          <input value={form.sharePercent} onChange={(e) => setForm({ ...form, sharePercent: e.target.value })} />
        </Field>
        <Field label="أساس الحصة">
          <input value={form.shareBasis} onChange={(e) => setForm({ ...form, shareBasis: e.target.value })} />
        </Field>
        <Field label="المرجع المالي" hint="مرجع القواعد التنفيذية أو السلم المعتمد، إن وُجد.">
          <input
            value={form.financialReference}
            onChange={(e) => setForm({ ...form, financialReference: e.target.value })}
          />
        </Field>
      </div>
      <div className="form-row">
        {(
          [
            ['departmentApproval', 'موافقة القسم'],
            ['collegeApproval', 'موافقة الكلية'],
            ['councilApproval', 'موافقة المجلس العلمي'],
          ] as const
        ).map(([key, label]) => (
          <Field key={key} label={label}>
            <select value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}>
              {Object.entries(APPROVAL_LABELS).map(([value, text]) => (
                <option key={value} value={value}>
                  {text}
                </option>
              ))}
            </select>
          </Field>
        ))}
      </div>
      <button type="button" className="btn" onClick={add}>
        إضافة إنجاز
      </button>

      {state.data && state.data.awardClaims.length > 0 && (
        <div className="table-wrap" style={{ marginTop: 12 }}>
          <table>
            <thead>
              <tr>
                <th>الإنجاز</th>
                <th>التاريخ</th>
                <th>الحصة</th>
                <th>الموافقات</th>
                <th>المرجع المالي</th>
              </tr>
            </thead>
            <tbody>
              {state.data.awardClaims.map((claim) => (
                <tr key={claim.id}>
                  <td>
                    {claim.achievementTitle}
                    <div className="small muted">{claim.achievementKind || '—'}</div>
                  </td>
                  <td className="small">
                    {claim.achievementDate || '—'}
                    <div className="muted">{CALENDAR_LABELS[claim.dateCalendar] ?? ''}</div>
                  </td>
                  <td className="small">
                    {claim.sharePercent || '—'}
                    <div className="muted">{claim.shareBasis}</div>
                  </td>
                  <td className="small">
                    <div>القسم: {APPROVAL_LABELS[claim.departmentApproval]}</div>
                    <div>الكلية: {APPROVAL_LABELS[claim.collegeApproval]}</div>
                    <div>المجلس: {APPROVAL_LABELS[claim.councilApproval]}</div>
                  </td>
                  <td className="small">{claim.financialReference || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
