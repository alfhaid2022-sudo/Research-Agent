import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { getDb } from '../db.js';
import { validateFindings } from '../services/citations.js';
import { applicableRequirements } from '../services/readiness.js';
import {
  SAMPLE_ATTACHMENT,
  approveRequirement,
  createRequestType,
  firstSegmentId,
  resetDb,
  testApp,
  uploadTextSource,
} from './helpers.js';

const app = testApp();

const CONFERENCE_RULES = `ضوابط حضور المؤتمرات

المادة 3
تُقدَّم الطلبات إلى اللجنة قبل خمسة عشر يومًا من موعد انعقاد الجلسة.
`;

const AWARD_RULES = `ضوابط مكافأة التميز

البند 2
تُصرف مكافأة النشر وفق فئات المجلات المعتمدة في القرار ذي العلاقة.
`;

beforeEach(() => resetDb());

async function seedTwoTracks() {
  const conferenceType = await createRequestType(app, { name: 'مشاركة في مؤتمر', track: 'conference' });
  const awardType = await createRequestType(app, { name: 'مكافأة تميز', track: 'excellence_award' });

  const conferenceSource = await uploadTextSource(app, {
    title: 'ضوابط المؤتمرات',
    body: CONFERENCE_RULES,
    track: 'conference',
  });
  const awardSource = await uploadTextSource(app, {
    title: 'ضوابط مكافأة التميز',
    body: AWARD_RULES,
    track: 'excellence_award',
  });

  const conferenceRequirement = approveRequirement({
    sourceId: conferenceSource,
    segmentId: firstSegmentId(conferenceSource, 'خمسة عشر'),
    text: 'تقديم الطلب قبل خمسة عشر يومًا من موعد الجلسة.',
    quote: 'تُقدَّم الطلبات إلى اللجنة قبل خمسة عشر يومًا من موعد انعقاد الجلسة',
    tracks: ['conference'],
  });
  const awardRequirement = approveRequirement({
    sourceId: awardSource,
    segmentId: firstSegmentId(awardSource, 'فئات المجلات'),
    text: 'صرف مكافأة النشر وفق فئات المجلات المعتمدة.',
    quote: 'تُصرف مكافأة النشر وفق فئات المجلات المعتمدة',
    tracks: ['excellence_award'],
  });

  return { conferenceType, awardType, conferenceSource, awardSource, conferenceRequirement, awardRequirement };
}

describe('فصل المسارات', () => {
  it('لا تُطبَّق ضوابط المؤتمرات على طلب مكافأة التميز', async () => {
    const seed = await seedTwoTracks();
    const db = getDb();

    const conferenceApplicable = applicableRequirements(db, {
      scope: 'real',
      typeId: seed.conferenceType,
      track: 'conference',
    });
    const awardApplicable = applicableRequirements(db, {
      scope: 'real',
      typeId: seed.awardType,
      track: 'excellence_award',
    });

    expect(conferenceApplicable.map((r) => r.id)).toEqual([seed.conferenceRequirement]);
    expect(awardApplicable.map((r) => r.id)).toEqual([seed.awardRequirement]);
  });

  it('تبني مصفوفة طلب المكافأة من متطلبات مساره وحده', async () => {
    const seed = await seedTwoTracks();
    const requestId = (
      await request(app)
        .post('/api/requests')
        .send({ refNo: 'مك-1', typeId: seed.awardType, title: 'طلب مكافأة تميز' })
        .expect(201)
    ).body.id as string;

    const studyId = (await request(app).post(`/api/requests/${requestId}/studies`).expect(201)).body.id as string;
    const study = await request(app).get(`/api/studies/${studyId}`).expect(200);

    const requirementIds = study.body.findings.map((f: { requirementId: string }) => f.requirementId);
    expect(requirementIds).toContain(seed.awardRequirement);
    expect(requirementIds).not.toContain(seed.conferenceRequirement);
  });

  it('يرفض استشهادًا بمتطلب من مسار آخر', async () => {
    const seed = await seedTwoTracks();
    const requestId = (
      await request(app)
        .post('/api/requests')
        .send({ refNo: 'مك-2', typeId: seed.awardType, title: 'طلب مكافأة' })
        .expect(201)
    ).body.id as string;

    const outcome = validateFindings(getDb(), {
      requestId,
      scope: 'real',
      track: 'excellence_award',
      rawFindings: [{ requirementId: seed.conferenceRequirement, verdict: 'met' }],
    });

    expect(outcome.accepted).toHaveLength(0);
    expect(outcome.rejected[0]?.reason).toContain('يتبع مسارًا آخر');
  });

  it('يرفض متطلبًا بلا مسار محدد بدل تعميمه على كل الطلبات', async () => {
    const seed = await seedTwoTracks();
    const requestId = (
      await request(app)
        .post('/api/requests')
        .send({ refNo: 'مك-3', typeId: seed.awardType, title: 'طلب مكافأة' })
        .expect(201)
    ).body.id as string;

    const db = getDb();
    db.prepare(`UPDATE requirements SET tracks = '[]' WHERE id = ?`).run(seed.awardRequirement);

    const outcome = validateFindings(db, {
      requestId,
      scope: 'real',
      track: 'excellence_award',
      rawFindings: [{ requirementId: seed.awardRequirement, verdict: 'met' }],
    });
    expect(outcome.rejected[0]?.reason).toContain('بلا مسار محدد');

    expect(applicableRequirements(db, { scope: 'real', typeId: seed.awardType, track: 'excellence_award' })).toHaveLength(0);
  });

  it('يمنع نتيجة حاسمة عند غياب مصدر المسار أو عند علاقة تعديل غير محسومة', async () => {
    const seed = await seedTwoTracks();
    const requestId = (
      await request(app)
        .post('/api/requests')
        .send({ refNo: 'مك-4', typeId: seed.awardType, title: 'طلب مكافأة' })
        .expect(201)
    ).body.id as string;
    await request(app)
      .post(`/api/requests/${requestId}/attachments`)
      .field('label', 'مرفق')
      .attach('file', Buffer.from(SAMPLE_ATTACHMENT, 'utf8'), 'مرفق.txt')
      .expect(201);
    await uploadTextSource(app, { title: 'النموذج الرسمي (اختبار)', body: 'نموذج', isOfficialTemplate: true });

    // A recorded amend relation that nobody has reviewed yet must block a final study.
    const relation = await request(app)
      .post('/api/relations')
      .send({
        fromSourceId: seed.awardSource,
        toSourceId: seed.conferenceSource,
        kind: 'amends',
        subject: 'معاملة المجلات المحلية',
        track: 'excellence_award',
      })
      .expect(201);
    expect(relation.body.status).toBe('unresolved');

    const studyId = (await request(app).post(`/api/requests/${requestId}/studies`).expect(201)).body.id as string;
    const study = await request(app).get(`/api/studies/${studyId}`).expect(200);
    const relationCheck = study.body.study.readiness.find((item: { key: string }) => item.key === 'source_relations');
    expect(relationCheck.ok).toBe(false);

    const blocked = await request(app).post(`/api/studies/${studyId}/finalize`).expect(409);
    expect(JSON.stringify(blocked.body.details)).toContain('علاقات التعديل والاستبدال');

    await request(app)
      .post(`/api/relations/${relation.body.id}/resolve`)
      .send({ note: 'روجعت العلاقة وتقرر اعتماد نص القرار الأحدث في هذا الموضوع.', resolvedBy: 'المقرر' })
      .expect(200);

    const after = await request(app).get(`/api/studies/${studyId}`).expect(200);
    const afterCheck = after.body.study.readiness.find((item: { key: string }) => item.key === 'source_relations');
    expect(afterCheck.ok).toBe(true);
  });

  it('يمنع نتيجة حاسمة عندما لا يوجد مصدر في مسار الطلب أصلًا', async () => {
    const awardType = await createRequestType(app, { name: 'مكافأة بلا مصادر', track: 'excellence_award' });
    const requestId = (
      await request(app).post('/api/requests').send({ refNo: 'مك-5', typeId: awardType, title: 'طلب' }).expect(201)
    ).body.id as string;
    const studyId = (await request(app).post(`/api/requests/${requestId}/studies`).expect(201)).body.id as string;

    const study = await request(app).get(`/api/studies/${studyId}`).expect(200);
    const blocking = study.body.study.readiness
      .filter((item: { blocking: boolean; ok: boolean }) => item.blocking && !item.ok)
      .map((item: { key: string }) => item.key);
    expect(blocking).toContain('regulations');
    expect(blocking).toContain('approved_requirements');
    await request(app).post(`/api/studies/${studyId}/finalize`).expect(409);
  });
});
