import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { resetDb, testApp } from './helpers.js';

const app = testApp();

beforeEach(() => resetDb());

describe('وضع العرض التجريبي', () => {
  it('ينشئ بيانات اصطناعية معلَّمة، ولا تظهر في النطاق الفعلي', async () => {
    const seeded = await request(app).post('/api/demo/seed').expect(200);
    expect(seeded.body.notice).toContain('للتجربة فقط');

    const demoRequests = await request(app).get('/api/requests?scope=demo').expect(200);
    expect(demoRequests.body.requests).toHaveLength(1);
    expect(demoRequests.body.requests[0].title).toContain('للتجربة فقط');

    const realRequests = await request(app).get('/api/requests').expect(200);
    expect(realRequests.body.requests).toHaveLength(0);

    const demoSources = await request(app).get('/api/sources?scope=demo').expect(200);
    expect(demoSources.body.sources.length).toBeGreaterThan(0);
    expect(demoSources.body.sources.every((s: { title: string }) => s.title.includes('للتجربة فقط'))).toBe(true);

    const realSources = await request(app).get('/api/sources').expect(200);
    expect(realSources.body.sources).toHaveLength(0);
  });

  it('يحذف بيانات العرض وحدها ويُبقي البيانات الفعلية', async () => {
    await request(app).post('/api/demo/seed').expect(200);
    const typeId = (
      await request(app)
        .post('/api/request-types')
        .send({ name: 'نوع فعلي', scope: 'real', track: 'excellence_award' })
        .expect(201)
    ).body.id as string;
    await request(app).post('/api/requests').send({ refNo: 'فعلي-1', typeId, title: 'طلب فعلي' }).expect(201);

    await request(app).delete('/api/demo').expect(200);

    expect((await request(app).get('/api/requests?scope=demo').expect(200)).body.requests).toHaveLength(0);
    expect((await request(app).get('/api/requests').expect(200)).body.requests).toHaveLength(1);
  });

  it('يكشف تعارض المصدرين في بيانات العرض ويمنع إصدارًا حاسمًا', async () => {
    await request(app).post('/api/demo/seed').expect(200);
    const requestId = (await request(app).get('/api/requests?scope=demo').expect(200)).body.requests[0].id as string;
    const studyId = (await request(app).post(`/api/requests/${requestId}/studies`).expect(201)).body.id as string;
    const study = await request(app).get(`/api/studies/${studyId}`).expect(200);
    expect(study.body.study.conflicts).toHaveLength(1);
    await request(app).post(`/api/studies/${studyId}/finalize`).expect(409);
  });
});
