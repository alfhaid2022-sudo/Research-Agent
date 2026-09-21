import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createRequestType, resetDb, testApp } from './helpers.js';

const app = testApp();

beforeEach(() => resetDb());

async function seedAwardRequest(): Promise<string> {
  const typeId = await createRequestType(app, { name: 'مكافأة تميز', track: 'excellence_award' });
  const created = await request(app)
    .post('/api/requests')
    .send({
      refNo: `مك-${Math.random().toString(16).slice(2, 6)}`,
      typeId,
      title: 'طلب مكافأة تميز',
      submittedDate: '1447-03-10',
      submittedCalendar: 'hijri',
      academicYear: '1447/1448',
    })
    .expect(201);
  return created.body.id as string;
}

describe('بيانات النشر والمشاركات والمكافأة', () => {
  it('يفصل الربع التصنيفي عن فئة المكافأة ولا يحوّل Q1 إلى فئة أ', async () => {
    const requestId = await seedAwardRequest();

    await request(app)
      .post(`/api/requests/${requestId}/publications`)
      .send({
        title: 'بحث اختباري',
        venue: 'مجلة اختبارية',
        authorOrder: 1,
        isFirstAuthor: true,
        soleAffiliation: true,
        affiliation: 'جامعة الجوف',
        status: 'منشور',
        gregorianYear: '2025',
        academicYear: '1447/1448',
        classificationSource: 'قاعدة بيانات التصنيف المعتمدة',
        classificationType: 'quartile',
        classificationValue: 'Q1',
        classificationYear: '2025',
      })
      .expect(201);

    const listed = await request(app).get(`/api/requests/${requestId}/publications`).expect(200);
    const publication = listed.body.publications[0];

    // The quartile is stored as a quartile. No reward category is derived from it.
    expect(publication.classificationType).toBe('quartile');
    expect(publication.classificationValue).toBe('Q1');
    expect(publication.classificationTypeLabel).toContain('ربع تصنيفي');
    expect(JSON.stringify(publication)).not.toContain('فئة أ');
    expect(publication.classificationYear).toBe('2025');
    expect(publication.gregorianYear).toBe('2025');
    expect(publication.academicYear).toBe('1447/1448');
    expect(publication.authorOrder).toBe(1);
    expect(publication.soleAffiliation).toBe(true);
  });

  it('يرفض قيمة تصنيف بلا نوع معروف ويحفظ فئة المكافأة كنوع مستقل', async () => {
    const requestId = await seedAwardRequest();
    const bad = await request(app)
      .post(`/api/requests/${requestId}/publications`)
      .send({ title: 'بحث', classificationType: 'quartile_or_category', classificationValue: 'أ' })
      .expect(400);
    expect(bad.body.error).toBe('بيانات غير صالحة.');

    await request(app)
      .post(`/api/requests/${requestId}/publications`)
      .send({
        title: 'بحث بفئة مكافأة',
        classificationType: 'reward_category',
        classificationValue: 'أ',
        classificationSource: 'قرار المكافأة',
        classificationYear: '1445',
      })
      .expect(201);

    const listed = await request(app).get(`/api/requests/${requestId}/publications`).expect(200);
    const record = listed.body.publications.find((p: { classificationValue: string }) => p.classificationValue === 'أ');
    expect(record.classificationType).toBe('reward_category');
    expect(record.classificationTypeLabel).toContain('فئة مكافأة');
  });

  it('يسجّل حصة الإنجاز والموافقات والمرجع المالي دون احتساب أي صرف', async () => {
    const requestId = await seedAwardRequest();
    const created = await request(app)
      .post(`/api/requests/${requestId}/award-claims`)
      .send({
        achievementKind: 'نشر علمي',
        achievementTitle: 'بحث محكّم',
        achievementDate: '1446-05-01',
        dateCalendar: 'hijri',
        sharePercent: '50%',
        shareBasis: 'باحثان اثنان وفق ما ورد في مستند الطلب.',
        departmentApproval: 'approved',
        collegeApproval: 'pending',
        councilApproval: 'unrecorded',
        financialReference: 'يحدَّد لاحقًا وفق القواعد التنفيذية المعتمدة.',
      })
      .expect(201);
    expect(created.body.id).toBeTruthy();

    const listed = await request(app).get(`/api/requests/${requestId}/award-claims`).expect(200);
    expect(listed.body.notice).toContain('لا يُحتسب أي صرف');
    const claim = listed.body.awardClaims[0];
    expect(claim.sharePercent).toBe('50%');
    expect(claim.councilApproval).toBe('unrecorded');
    expect(claim.dateCalendar).toBe('hijri');
    expect(claim).not.toHaveProperty('amount');
  });

  it('يميّز التقويم الهجري والميلادي والعام الدراسي ولا يحوّل بينها', async () => {
    const requestId = await seedAwardRequest();
    const fetched = await request(app).get(`/api/requests/${requestId}`).expect(200);
    expect(fetched.body.request.submittedDate).toBe('1447-03-10');
    expect(fetched.body.request.submittedCalendar).toBe('hijri');
    expect(fetched.body.request.academicYear).toBe('1447/1448');

    await request(app)
      .post(`/api/requests/${requestId}/participations`)
      .send({
        eventName: 'مؤتمر اختباري',
        startDate: '2026-02-01',
        endDate: '2026-02-03',
        dateCalendar: 'gregorian',
        academicYear: '1447/1448',
        approvalState: 'pending',
      })
      .expect(201);

    const participations = await request(app).get(`/api/requests/${requestId}/participations`).expect(200);
    const participation = participations.body.participations[0];
    // The Gregorian dates stay Gregorian; the academic year stays a separate field.
    expect(participation.dateCalendar).toBe('gregorian');
    expect(participation.startDate).toBe('2026-02-01');
    expect(participation.academicYear).toBe('1447/1448');
    expect(participation.approvalState).toBe('pending');
  });

  it('يرفض ربط بحث بمرفق يعود إلى طلب آخر', async () => {
    const requestA = await seedAwardRequest();
    const requestB = await seedAwardRequest();
    const attachment = await request(app)
      .post(`/api/requests/${requestB}/attachments`)
      .field('label', 'مرفق طلب آخر')
      .attach('file', Buffer.from('نص مرفق اختباري كافٍ للفحص.', 'utf8'), 'م.txt')
      .expect(201);

    const response = await request(app)
      .post(`/api/requests/${requestA}/publications`)
      .send({ title: 'بحث', evidenceAttachmentId: attachment.body.id })
      .expect(400);
    expect(response.body.error).toContain('لا يعود إلى هذا الطلب');
  });
});
