import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { resetDb, testApp } from './helpers.js';

const app = testApp();

beforeEach(() => resetDb());

async function seedCommittee(): Promise<string[]> {
  const ids: string[] = [];
  for (const [name, role] of [
    ['عضو أول', 'رئيس اللجنة'],
    ['عضو ثانٍ', 'عضو'],
    ['عضو ثالث', 'عضو ومقرر'],
  ]) {
    const created = await request(app)
      .post('/api/committee-members')
      .send({ name, role, scope: 'real' })
      .expect(201);
    ids.push(created.body.id as string);
  }
  return ids;
}

async function createMinutes(): Promise<string> {
  const created = await request(app)
    .post('/api/minutes')
    .send({
      title: 'محضر اجتماع اختباري',
      committeeName: 'اللجنة العلمية',
      sessionNo: '2',
      meetingDate: '1448-02-05',
      meetingCalendar: 'hijri',
      meetingTime: '10:00',
      scope: 'real',
    })
    .expect(201);
  return created.body.id as string;
}

describe('تشكيل اللجنة والمحاضر', () => {
  it('يبني جدول الحضور وجدول التوقيع من تشكيل واحد، فلا يختلف اسم بينهما', async () => {
    await seedCommittee();
    const minutesId = await createMinutes();
    const detail = await request(app).get(`/api/minutes/${minutesId}`).expect(200);

    const attendanceNames = detail.body.attendance.map((row: { name: string }) => row.name);
    const signatureNames = detail.body.signatures.map((row: { name: string }) => row.name);
    expect(attendanceNames).toEqual(signatureNames);
    expect(attendanceNames).toEqual(['عضو أول', 'عضو ثانٍ', 'عضو ثالث']);

    // Renaming a member changes both tables at once, because there is one list.
    const memberId = detail.body.attendance[2].memberId as string;
    await request(app).put(`/api/committee-members/${memberId}`).send({ name: 'عضو ثالث (الاسم المصحّح)' }).expect(200);

    const after = await request(app).get(`/api/minutes/${minutesId}`).expect(200);
    expect(after.body.attendance[2].name).toBe('عضو ثالث (الاسم المصحّح)');
    expect(after.body.signatures[2].name).toBe('عضو ثالث (الاسم المصحّح)');
  });

  it('لا ينسخ الحضور من محضر سابق ولا يعلّم أحدًا حاضرًا تلقائيًا', async () => {
    const [firstMember] = await seedCommittee();
    const firstMinutes = await createMinutes();
    await request(app)
      .put(`/api/minutes/${firstMinutes}/attendance/${firstMember}`)
      .send({ state: 'present', recordedBy: 'المقرر' })
      .expect(200);

    const secondMinutes = await createMinutes();
    const detail = await request(app).get(`/api/minutes/${secondMinutes}`).expect(200);
    expect(detail.body.attendance.every((row: { state: string }) => row.state === 'unrecorded')).toBe(true);

    const exported = await request(app).get(`/api/minutes/${secondMinutes}/export.html`).expect(200);
    expect(exported.text).toContain('لم يُسجَّل');
  });

  it('يشترط سبب التغيب عند تسجيل غياب عضو', async () => {
    const [memberId] = await seedCommittee();
    const minutesId = await createMinutes();
    const refused = await request(app)
      .put(`/api/minutes/${minutesId}/attendance/${memberId}`)
      .send({ state: 'absent', absenceReason: '' })
      .expect(400);
    expect(refused.body.error).toContain('سبب التغيب');

    await request(app)
      .put(`/api/minutes/${minutesId}/attendance/${memberId}`)
      .send({ state: 'absent', absenceReason: 'إجازة رسمية', recordedBy: 'المقرر' })
      .expect(200);
    const detail = await request(app).get(`/api/minutes/${minutesId}`).expect(200);
    expect(detail.body.attendance[0].state).toBe('absent');
    expect(detail.body.attendance[0].absenceReason).toBe('إجازة رسمية');
  });

  it('يصدّر المحضر بأقسامه الستة ويترك التوقيع والقرار والاعتماد للجنة', async () => {
    await seedCommittee();
    const minutesId = await createMinutes();
    await request(app)
      .post(`/api/minutes/${minutesId}/items`)
      .send({ subject: 'موضوع اختباري', body: 'ملخص المناقشة.', relatedEntity: 'قسم علوم المختبرات الإكلينيكية' })
      .expect(201);

    const html = (await request(app).get(`/api/minutes/${minutesId}/export.html`).expect(200)).text;
    for (const heading of [
      'محضر اجتماع',
      'أولاً: أعضاء اللجنة حسب قرار تكوينها',
      'ثانياً: جدول أعمال الجلسة',
      'ثالثاً: المناقشات والقرارات أو التوصيات',
      'رابعاً',
      'خامساً: رأي الأعضاء في المحضر',
      'سادساً: الإضافات والملحوظات',
    ]) {
      expect(html).toContain(heading);
    }
    expect(html).toContain('الجهة ذات العلاقة');
    expect(html).toContain('قسم علوم المختبرات الإكلينيكية');
    expect(html).toContain('لا يُنشأ آليًا');
    expect(html).toContain('لم تُعتمد مطابقة تنسيق النموذج الرسمي');

    const docx = await request(app).get(`/api/minutes/${minutesId}/export.docx`).expect(200);
    expect(Number(docx.headers['content-length'])).toBeGreaterThan(1000);
  });

  it('يُبقي المخاطب في «رابعاً» بحالة بانتظار المراجعة حتى يؤكده المستخدم', async () => {
    await seedCommittee();
    const minutesId = await createMinutes();
    const before = await request(app).get(`/api/minutes/${minutesId}`).expect(200);
    expect(before.body.minutes.addresseeState).toBe('pending_review');
    const html = (await request(app).get(`/api/minutes/${minutesId}/export.html`).expect(200)).text;
    expect(html).toContain('بانتظار مراجعة المستخدم');

    await request(app)
      .put(`/api/minutes/${minutesId}`)
      .send({ addresseeName: 'رئيس القسم', addresseeTitle: 'سعادة', addresseeState: 'confirmed' })
      .expect(200);
    const after = (await request(app).get(`/api/minutes/${minutesId}/export.html`).expect(200)).text;
    expect(after).toContain('رئيس القسم');
    expect(after).not.toContain('بانتظار مراجعة المستخدم');
  });

  it('يحافظ على ارتباط الجهة ذات العلاقة بالبند عند تكرار البنود', async () => {
    await seedCommittee();
    const minutesId = await createMinutes();
    await request(app)
      .post(`/api/minutes/${minutesId}/items`)
      .send({ subject: 'بند أول', body: 'مناقشة أولى', relatedEntity: 'جهة أولى' })
      .expect(201);
    await request(app)
      .post(`/api/minutes/${minutesId}/items`)
      .send({ subject: 'بند ثانٍ', body: 'مناقشة ثانية', relatedEntity: 'جهة ثانية' })
      .expect(201);

    const detail = await request(app).get(`/api/minutes/${minutesId}`).expect(200);
    expect(detail.body.items).toHaveLength(2);
    expect(detail.body.items[0].relatedEntity).toBe('جهة أولى');
    expect(detail.body.items[1].relatedEntity).toBe('جهة ثانية');

    // In the discussions section each item keeps its own related entity next to it.
    const html = (await request(app).get(`/api/minutes/${minutesId}/export.html`).expect(200)).text;
    const discussions = html.slice(html.indexOf('ثالثاً: المناقشات'), html.indexOf('رابعاً'));
    const firstBlock = discussions.slice(discussions.indexOf('بند أول'), discussions.indexOf('بند ثانٍ'));
    const secondBlock = discussions.slice(discussions.indexOf('بند ثانٍ'));
    expect(firstBlock).toContain('جهة أولى');
    expect(firstBlock).not.toContain('جهة ثانية');
    expect(secondBlock).toContain('جهة ثانية');
    expect(secondBlock).not.toContain('جهة أولى');
  });
});
