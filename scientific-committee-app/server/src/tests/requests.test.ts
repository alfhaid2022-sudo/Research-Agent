import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { SAMPLE_ATTACHMENT, createRequestType, resetDb, testApp } from './helpers.js';

const app = testApp();

beforeEach(() => resetDb());

describe('حفظ الطلبات واسترجاعها', () => {
  it('يحفظ طلبًا جديدًا ويسترجعه ببياناته كاملة', async () => {
    const typeId = await createRequestType(app, { name: 'طلب اعتماد مقرر' });

    const created = await request(app)
      .post('/api/requests')
      .send({
        refNo: 'ل ع/2026/17',
        typeId,
        title: 'اعتماد مقرر أساسيات المختبرات',
        applicantName: 'أ. تجربة',
        applicantUnit: 'قسم علوم المختبرات الإكلينيكية',
        submittedDate: '2026-09-10',
        summary: 'طلب لاعتماد مقرر جديد.',
      })
      .expect(201);

    const fetched = await request(app).get(`/api/requests/${created.body.id}`).expect(200);
    expect(fetched.body.request.refNo).toBe('ل ع/2026/17');
    expect(fetched.body.request.title).toBe('اعتماد مقرر أساسيات المختبرات');
    expect(fetched.body.request.typeName).toBe('طلب اعتماد مقرر');
    expect(fetched.body.request.status).toBe('new');

    const list = await request(app).get('/api/requests').expect(200);
    expect(list.body.requests).toHaveLength(1);
    expect(list.body.requests[0].refNo).toBe('ل ع/2026/17');
  });

  it('يمنع تكرار الرقم المرجعي داخل النطاق نفسه', async () => {
    const typeId = await createRequestType(app);
    const payload = { refNo: 'مكرر-1', typeId, title: 'طلب أول' };
    await request(app).post('/api/requests').send(payload).expect(201);
    const duplicate = await request(app).post('/api/requests').send({ ...payload, title: 'طلب ثانٍ' }).expect(409);
    expect(duplicate.body.error).toContain('مستخدم');
  });

  it('يرفض الطلب بدون عنوان أو نوع برسالة تحقق عربية', async () => {
    const response = await request(app).post('/api/requests').send({ refNo: 'x' }).expect(400);
    expect(response.body.error).toBe('بيانات غير صالحة.');
    expect(Array.isArray(response.body.details)).toBe(true);
  });

  it('يرفض رفع مرفق بامتداد قابل للتنفيذ', async () => {
    const typeId = await createRequestType(app);
    const created = await request(app).post('/api/requests').send({ refNo: 'أ-1', typeId, title: 'طلب' }).expect(201);
    const response = await request(app)
      .post(`/api/requests/${created.body.id}/attachments`)
      .field('label', 'سكربت')
      .attach('file', Buffer.from('console.log(1)', 'utf8'), 'payload.js')
      .expect(400);
    expect(response.body.error).toContain('غير مسموح');
  });

  it('يحفظ المرفق ويستخرج نصه ويبقيه بعد إعادة القراءة', async () => {
    const typeId = await createRequestType(app);
    const created = await request(app).post('/api/requests').send({ refNo: 'أ-2', typeId, title: 'طلب' }).expect(201);
    const uploaded = await request(app)
      .post(`/api/requests/${created.body.id}/attachments`)
      .field('label', 'توصيف المقرر')
      .attach('file', Buffer.from(SAMPLE_ATTACHMENT, 'utf8'), 'توصيف.txt')
      .expect(201);

    expect(uploaded.body.extraction.status).toBe('extracted');
    const fetched = await request(app).get(`/api/requests/${created.body.id}`).expect(200);
    expect(fetched.body.attachments).toHaveLength(1);
    expect(fetched.body.attachments[0].label).toBe('توصيف المقرر');
    expect(fetched.body.attachments[0].segmentCount).toBeGreaterThan(0);

    const segments = await request(app)
      .get(`/api/attachments/${fetched.body.attachments[0].id}/segments`)
      .expect(200);
    expect(segments.body.segments.some((s: { text: string }) => s.text.includes('مخرجات التعلم'))).toBe(true);
  });
});
