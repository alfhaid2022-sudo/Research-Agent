import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { getDb } from '../db.js';
import { validateFindings } from '../services/citations.js';
import {
  SAMPLE_ATTACHMENT,
  SAMPLE_REGULATION,
  approveRequirement,
  createRequestType,
  firstSegmentId,
  resetDb,
  testApp,
  uploadTextSource,
} from './helpers.js';

const app = testApp();

beforeEach(() => resetDb());

async function seedRequest(checklist: string[] = []): Promise<string> {
  const typeId = await createRequestType(app, { name: 'طلب اعتماد مقرر', checklist });
  const created = await request(app)
    .post('/api/requests')
    .send({ refNo: `ط-${Math.random().toString(16).slice(2, 7)}`, typeId, title: 'طلب اختبار' })
    .expect(201);
  return created.body.id as string;
}

async function attach(requestId: string, label: string, body = SAMPLE_ATTACHMENT): Promise<string> {
  const response = await request(app)
    .post(`/api/requests/${requestId}/attachments`)
    .field('label', label)
    .attach('file', Buffer.from(body, 'utf8'), 'مرفق.txt')
    .expect(201);
  return response.body.id as string;
}

describe('غياب المصادر يمنع إصدار نتيجة حاسمة', () => {
  it('يفتح دراسة غير جاهزة ويشرح سبب عدم الجاهزية ويمنع الإصدار النهائي', async () => {
    const requestId = await seedRequest();
    const created = await request(app).post(`/api/requests/${requestId}/studies`).expect(201);
    expect(created.body.ready).toBe(false);

    const study = await request(app).get(`/api/studies/${created.body.id}`).expect(200);
    const blocking = study.body.study.readiness.filter((item: { blocking: boolean; ok: boolean }) => item.blocking && !item.ok);
    const keys = blocking.map((item: { key: string }) => item.key);
    expect(keys).toContain('official_template');
    expect(keys).toContain('regulations');
    expect(keys).toContain('approved_requirements');
    expect(study.body.findings).toHaveLength(0);

    const finalize = await request(app).post(`/api/studies/${created.body.id}/finalize`).expect(409);
    expect(finalize.body.error).toContain('لا يمكن إصدار دراسة نهائية');
    expect(finalize.body.details.blocking.length).toBeGreaterThan(0);
  });

  it('يحفظ مسودة الدراسة رغم عدم الجاهزية', async () => {
    const requestId = await seedRequest();
    const created = await request(app).post(`/api/requests/${requestId}/studies`).expect(201);
    await request(app)
      .put(`/api/studies/${created.body.id}`)
      .send({ memo: 'ملاحظات أولية بانتظار وصول اللائحة.' })
      .expect(200);
    const study = await request(app).get(`/api/studies/${created.body.id}`).expect(200);
    expect(study.body.study.memo).toContain('بانتظار وصول اللائحة');
    expect(study.body.study.status).toBe('draft');
  });

  it('يبلّغ أن التحليل الآلي غير مفعّل بدل إنتاج تحليل وهمي', async () => {
    const requestId = await seedRequest();
    const created = await request(app).post(`/api/requests/${requestId}/studies`).expect(201);
    const response = await request(app).post(`/api/studies/${created.body.id}/analyze`).send({});
    expect([503, 422]).toContain(response.status);
    expect(response.body.error).toMatch(/غير مفعّل|لا توجد متطلبات/);

    const status = await request(app).get('/api/ai/status').expect(200);
    expect(status.body.enabled).toBe(false);
    expect(status.body.reason).toContain('غير مفعّل');
  });
});

describe('رفض الاستشهادات غير الموجودة', () => {
  it('يرفض بندًا يستشهد بمعرف متطلب غير موجود', async () => {
    const requestId = await seedRequest();
    const outcome = validateFindings(getDb(), {
      requestId,
      scope: 'real',
      rawFindings: [{ requirementId: 'req_غير_موجود', verdict: 'met', basisQuote: 'نص مختلق' }],
    });
    expect(outcome.accepted).toHaveLength(0);
    expect(outcome.rejected).toHaveLength(1);
    expect(outcome.rejected[0]?.reason).toContain('غير موجود');
  });

  it('يحذف اقتباسًا غير موجود في نص اللائحة ويخفض النتيجة إلى «غير قابل للتحقق»', async () => {
    const requestId = await seedRequest();
    const sourceId = await uploadTextSource(app, { title: 'لائحة اختبار', body: SAMPLE_REGULATION });
    const segmentId = firstSegmentId(sourceId, 'توصيفًا كاملًا');
    const requirementId = approveRequirement({
      sourceId,
      segmentId,
      text: 'إرفاق توصيف المقرر',
      quote: 'يجب أن يتضمن الطلب توصيفًا كاملًا للمقرر',
    });
    const attachmentId = await attach(requestId, 'توصيف المقرر');

    const outcome = validateFindings(getDb(), {
      requestId,
      scope: 'real',
      rawFindings: [
        {
          requirementId,
          basisSegmentId: segmentId,
          basisQuote: 'نص لم يرد إطلاقًا في اللائحة ولا يوجد فيها',
          evidenceAttachmentId: attachmentId,
          evidenceQuote: 'مخرجات التعلم: أن يصف الطالب مراحل العمل داخل المختبر الإكلينيكي',
          verdict: 'met',
        },
      ],
    });

    expect(outcome.accepted).toHaveLength(1);
    const finding = outcome.accepted[0]!;
    expect(finding.basisQuote).toBe('');
    expect(finding.validation.basisVerified).toBe(false);
    expect(finding.verdict).toBe('unverifiable');
    expect(finding.validation.issues.join(' ')).toContain('غير موجود في نص المقطع');
  });

  it('يرفض استشهادًا بمرفق لا يعود إلى الطلب نفسه', async () => {
    const requestA = await seedRequest();
    const requestB = await seedRequest();
    const sourceId = await uploadTextSource(app, { title: 'لائحة اختبار', body: SAMPLE_REGULATION });
    const segmentId = firstSegmentId(sourceId, 'توصيفًا كاملًا');
    const requirementId = approveRequirement({
      sourceId,
      segmentId,
      text: 'إرفاق توصيف المقرر',
      quote: 'يجب أن يتضمن الطلب توصيفًا كاملًا للمقرر',
    });
    const foreignAttachment = await attach(requestB, 'مرفق طلب آخر');

    const outcome = validateFindings(getDb(), {
      requestId: requestA,
      scope: 'real',
      rawFindings: [
        {
          requirementId,
          basisSegmentId: segmentId,
          basisQuote: 'يجب أن يتضمن الطلب توصيفًا كاملًا للمقرر',
          evidenceAttachmentId: foreignAttachment,
          evidenceQuote: 'مخرجات التعلم: أن يصف الطالب مراحل العمل داخل المختبر الإكلينيكي',
          verdict: 'met',
        },
      ],
    });

    const finding = outcome.accepted[0]!;
    expect(finding.validation.issues.join(' ')).toContain('لا يعود إلى هذا الطلب');
    expect(finding.verdict).toBe('unverifiable');
  });

  it('لا يحوّل نقص الدليل إلى «غير مستوفى»', async () => {
    const requestId = await seedRequest();
    const sourceId = await uploadTextSource(app, { title: 'لائحة اختبار', body: SAMPLE_REGULATION });
    const segmentId = firstSegmentId(sourceId, 'توصيفًا كاملًا');
    const requirementId = approveRequirement({
      sourceId,
      segmentId,
      text: 'إرفاق توصيف المقرر',
      quote: 'يجب أن يتضمن الطلب توصيفًا كاملًا للمقرر',
    });

    const outcome = validateFindings(getDb(), {
      requestId,
      scope: 'real',
      rawFindings: [
        {
          requirementId,
          basisSegmentId: segmentId,
          basisQuote: 'يجب أن يتضمن الطلب توصيفًا كاملًا للمقرر',
          evidenceAttachmentId: null,
          verdict: 'not_met',
        },
      ],
    });

    const finding = outcome.accepted[0]!;
    expect(finding.verdict).toBe('unverifiable');
    expect(finding.validation.downgradedFrom).toBe('not_met');
    expect(finding.verdictReason).toContain('نقص الدليل لا يعني عدم الاستيفاء');
  });

  it('يمنع الخلط بين بيانات العرض التجريبي والبيانات الفعلية', async () => {
    const requestId = await seedRequest();
    const sourceId = await uploadTextSource(app, { title: 'لائحة تجريبية', body: SAMPLE_REGULATION, scope: 'demo' });
    const segmentId = firstSegmentId(sourceId, 'توصيفًا كاملًا');
    const requirementId = approveRequirement({
      sourceId,
      segmentId,
      text: 'متطلب تجريبي',
      quote: 'يجب أن يتضمن الطلب توصيفًا كاملًا للمقرر',
      scope: 'demo',
    });

    const outcome = validateFindings(getDb(), {
      requestId,
      scope: 'real',
      rawFindings: [{ requirementId, basisSegmentId: segmentId, verdict: 'met' }],
    });
    expect(outcome.accepted).toHaveLength(0);
    expect(outcome.rejected[0]?.reason).toContain('نطاقًا مختلفًا');
  });
});

describe('المرفق الناقص', () => {
  it('يُدرج عنصر قائمة التحقق غير المرفوع ضمن النواقص دون اعتباره عدم استيفاء', async () => {
    const requestId = await seedRequest(['توصيف المقرر', 'محضر القسم']);
    await attach(requestId, 'توصيف المقرر');

    const fetched = await request(app).get(`/api/requests/${requestId}`).expect(200);
    expect(fetched.body.missingAttachments).toEqual(['محضر القسم']);

    const created = await request(app).post(`/api/requests/${requestId}/studies`).expect(201);
    const study = await request(app).get(`/api/studies/${created.body.id}`).expect(200);
    expect(study.body.study.completionItems.join(' ')).toContain('محضر القسم');
    expect(study.body.findings.every((f: { verdict: string }) => f.verdict !== 'not_met')).toBe(true);
  });

  it('يعتبر الطلب بلا مرفقات مقروءة غير جاهز لإصدار نتيجة', async () => {
    const requestId = await seedRequest(['توصيف المقرر']);
    const created = await request(app).post(`/api/requests/${requestId}/studies`).expect(201);
    const study = await request(app).get(`/api/studies/${created.body.id}`).expect(200);
    const attachmentsCheck = study.body.study.readiness.find((item: { key: string }) => item.key === 'attachments');
    expect(attachmentsCheck.ok).toBe(false);
    expect(attachmentsCheck.detail).toContain('لا يمكن إسناد أي نتيجة');
  });
});
