import http from 'node:http';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
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

/**
 * A stand-in provider that answers with one honest finding, one fabricated
 * requirement id, and one fabricated quote — so the test proves the server
 * validates citations instead of trusting the model.
 */
let server: http.Server;
let lastPrompt = '';

beforeAll(async () => {
  server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      lastPrompt = JSON.parse(body).messages[0].content as string;
      const requirementIds = [...lastPrompt.matchAll(/#requirementId: (\S+)/g)].map((m) => m[1]);
      const segmentIds = [...lastPrompt.matchAll(/#basisSegmentId: (\S+)/g)].map((m) => m[1]);
      const attachmentId = /attachmentId=(\S+?) ::/.exec(lastPrompt)?.[1];
      const payload = {
        summary: 'ملخص من المزوّد البديل.',
        memo: 'مذكرة اختبار.',
        recommendation: 'توصية مبدئية.',
        completionItems: ['استكمال مستند إضافي'],
        minuteDraft: 'مسودة بند محضر.',
        findings: [
          {
            requirementId: requirementIds[0],
            basisSegmentId: segmentIds[0],
            basisQuote: 'يجب أن يتضمن الطلب توصيفًا كاملًا للمقرر يوضح مخرجات التعلم وآلية التقييم',
            evidenceAttachmentId: attachmentId,
            evidenceQuote: 'مخرجات التعلم: أن يصف الطالب مراحل العمل داخل المختبر الإكلينيكي',
            verdict: 'met',
            facts: 'المرفق يذكر مخرجات التعلم وآلية التقييم.',
          },
          {
            requirementId: 'req_لا_وجود_له',
            basisSegmentId: 'seg_لا_وجود_له',
            basisQuote: 'مادة مختلقة',
            verdict: 'met',
          },
          {
            requirementId: requirementIds[1],
            basisSegmentId: segmentIds[1],
            basisQuote: 'اقتباس لم يرد في اللائحة إطلاقًا ولا يوجد فيها',
            verdict: 'not_met',
          },
        ],
      };
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ content: [{ type: 'text', text: JSON.stringify(payload) }] }));
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  process.env.AI_API_KEY = 'test-key-not-real';
  process.env.AI_BASE_URL = `http://127.0.0.1:${port}`;
  process.env.AI_MODEL = 'stub-model';
});

afterAll(async () => {
  process.env.AI_API_KEY = '';
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

beforeEach(() => resetDb());

async function seedStudy(): Promise<string> {
  const typeId = await createRequestType(app, { name: 'طلب اعتماد مقرر' });
  const requestId = (
    await request(app).post('/api/requests').send({ refNo: 'ذ-1', typeId, title: 'طلب تحليل آلي' }).expect(201)
  ).body.id as string;
  await request(app)
    .post(`/api/requests/${requestId}/attachments`)
    .field('label', 'توصيف المقرر')
    .attach('file', Buffer.from(SAMPLE_ATTACHMENT, 'utf8'), 'توصيف.txt')
    .expect(201);

  await uploadTextSource(app, { title: 'النموذج الرسمي (اختبار)', body: 'نموذج داخلي', isOfficialTemplate: true });
  const sourceId = await uploadTextSource(app, { title: 'لائحة اختبار', body: SAMPLE_REGULATION });
  approveRequirement({
    sourceId,
    segmentId: firstSegmentId(sourceId, 'توصيفًا كاملًا'),
    text: 'إرفاق توصيف المقرر.',
    quote: 'يجب أن يتضمن الطلب توصيفًا كاملًا للمقرر',
  });
  approveRequirement({
    sourceId,
    segmentId: firstSegmentId(sourceId, 'خمسة عشر'),
    text: 'تقديم الطلب قبل خمسة عشر يومًا.',
    quote: 'تُقدَّم الطلبات إلى اللجنة قبل خمسة عشر يومًا من موعد انعقاد الجلسة',
  });

  return (await request(app).post(`/api/requests/${requestId}/studies`).expect(201)).body.id as string;
}

describe('مسار التحليل الآلي من جهة الخادم', () => {
  it('يعرض حالة الخدمة مفعّلة مع بيان البيانات المرسلة', async () => {
    const status = await request(app).get('/api/ai/status').expect(200);
    expect(status.body.enabled).toBe(true);
    expect(status.body.model).toBe('stub-model');
    expect(status.body.dataNotice).toContain('لا تُرسل الملفات الأصلية');
  });

  it('يقبل البند المسنود ويرفض الاستشهاد المختلق ويحذف الاقتباس غير المطابق', async () => {
    const studyId = await seedStudy();
    const report = await request(app).post(`/api/studies/${studyId}/analyze`).expect(200);

    expect(report.body.acceptedCount).toBe(2);
    expect(report.body.rejected).toHaveLength(1);
    expect(report.body.rejected[0].reason).toContain('معرف متطلب غير موجود');

    const study = await request(app).get(`/api/studies/${studyId}`).expect(200);
    expect(study.body.study.summary).toBe('ملخص من المزوّد البديل.');

    const findings = study.body.findings as Array<{
      verdict: string;
      basisQuote: string;
      evidenceAttachmentName: string;
      validation: { downgradedFrom?: string; issues?: string[] };
    }>;

    const verified = findings.find((f) => f.verdict === 'met');
    expect(verified).toBeDefined();
    expect(verified!.basisQuote).toContain('توصيفًا كاملًا للمقرر');
    expect(verified!.evidenceAttachmentName).toBe('توصيف المقرر');

    const fabricatedQuote = findings.find((f) => f.validation.downgradedFrom === 'not_met');
    expect(fabricatedQuote).toBeDefined();
    expect(fabricatedQuote!.verdict).toBe('unverifiable');
    expect(fabricatedQuote!.basisQuote).toBe('');

    // A fabricated requirement id must never reach the matrix at all.
    expect(findings.some((f) => f.basisQuote === 'مادة مختلقة')).toBe(false);
  });

  it('يمرّر نصوص المرفقات كبيانات موسومة لا كتعليمات', async () => {
    const studyId = await seedStudy();
    await request(app).post(`/api/studies/${studyId}/analyze`).expect(200);
    expect(lastPrompt).toContain('<untrusted_document');
    expect(lastPrompt).toContain('بيانات للفحص فقط');
    expect(lastPrompt).toContain('#requirementId:');
  });

  it('يرفض تعديل دراسة نهائية بالتحليل الآلي', async () => {
    const studyId = await seedStudy();
    await request(app).post(`/api/studies/${studyId}/analyze`).expect(200);
    const study = await request(app).get(`/api/studies/${studyId}`).expect(200);
    for (const finding of study.body.findings) {
      await request(app)
        .put(`/api/studies/${studyId}/findings/${finding.id}`)
        .send({ verdictReason: 'روجعت يدويًا.', reason: 'مراجعة المقرر.' })
        .expect(200);
    }
    await request(app).post(`/api/studies/${studyId}/finalize`).expect(200);
    const blocked = await request(app).post(`/api/studies/${studyId}/analyze`).expect(409);
    expect(blocked.body.error).toContain('نهائية');
  });
});
