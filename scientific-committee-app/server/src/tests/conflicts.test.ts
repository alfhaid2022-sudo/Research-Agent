import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import JSZip from 'jszip';
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

const REGULATION_15 = `لائحة أولى

المادة 3
تُقدَّم الطلبات إلى اللجنة قبل خمسة عشر يومًا من موعد انعقاد الجلسة.
`;

const REGULATION_30 = `دليل إجراءات

البند 2
تُقدَّم الطلبات إلى اللجنة قبل ثلاثين يومًا من موعد انعقاد الجلسة.
`;

beforeEach(() => resetDb());

async function seedConflictingSources(): Promise<{ requestId: string; studyId: string }> {
  const typeId = await createRequestType(app, { name: 'طلب اعتماد مقرر', checklist: [] });
  const requestId = (
    await request(app).post('/api/requests').send({ refNo: 'تع-1', typeId, title: 'طلب تعارض' }).expect(201)
  ).body.id as string;

  await request(app)
    .post(`/api/requests/${requestId}/attachments`)
    .field('label', 'مرفق')
    .attach('file', Buffer.from(SAMPLE_ATTACHMENT, 'utf8'), 'مرفق.txt')
    .expect(201);

  await uploadTextSource(app, { title: 'النموذج الرسمي (اختبار)', body: 'نموذج', isOfficialTemplate: true });

  const sourceA = await uploadTextSource(app, { title: 'لائحة أولى', body: REGULATION_15, version: '1.0' });
  const sourceB = await uploadTextSource(app, { title: 'دليل إجراءات', body: REGULATION_30, version: '2.0' });

  approveRequirement({
    sourceId: sourceA,
    segmentId: firstSegmentId(sourceA, 'خمسة عشر'),
    text: 'تقديم الطلب قبل خمسة عشر يومًا.',
    quote: 'تُقدَّم الطلبات إلى اللجنة قبل خمسة عشر يومًا من موعد انعقاد الجلسة',
    conflictKey: 'مدة التقديم قبل الجلسة',
    conflictValue: '15 يومًا',
  });
  approveRequirement({
    sourceId: sourceB,
    segmentId: firstSegmentId(sourceB, 'ثلاثين'),
    text: 'تقديم الطلب قبل ثلاثين يومًا.',
    quote: 'تُقدَّم الطلبات إلى اللجنة قبل ثلاثين يومًا من موعد انعقاد الجلسة',
    conflictKey: 'مدة التقديم قبل الجلسة',
    conflictValue: '30 يومًا',
  });

  const studyId = (await request(app).post(`/api/requests/${requestId}/studies`).expect(201)).body.id as string;
  return { requestId, studyId };
}

describe('تعارض مصدرين', () => {
  it('يكشف التعارض ويعرض طرفيه دون ترجيح', async () => {
    const { studyId } = await seedConflictingSources();
    const study = await request(app).get(`/api/studies/${studyId}`).expect(200);

    expect(study.body.study.conflicts).toHaveLength(1);
    const conflict = study.body.study.conflicts[0];
    expect(conflict.conflictKey).toBe('مدة التقديم قبل الجلسة');
    expect(conflict.sides.map((s: { value: string }) => s.value).sort()).toEqual(['15 يومًا', '30 يومًا']);
    expect(conflict.sides.map((s: { sourceTitle: string }) => s.sourceTitle)).toContain('لائحة أولى');
    expect(conflict.resolved).toBe(false);

    const check = study.body.study.readiness.find((item: { key: string }) => item.key === 'conflicts');
    expect(check.ok).toBe(false);
    expect(check.detail).toContain('يحتاج توجيهًا من اللجنة');
  });

  it('يمنع إصدار دراسة نهائية ما دام التعارض غير محسوم', async () => {
    const { studyId } = await seedConflictingSources();
    const finalize = await request(app).post(`/api/studies/${studyId}/finalize`).expect(409);
    expect(JSON.stringify(finalize.body.details)).toContain('تعارض المصادر');
  });

  it('يرفع الحظر بعد تسجيل توجيه اللجنة، ويسجّل التوجيه في سجل المراجعات', async () => {
    const { studyId } = await seedConflictingSources();
    await request(app)
      .post(`/api/studies/${studyId}/conflicts/resolve`)
      .send({ conflictKey: 'مدة التقديم قبل الجلسة', note: 'وجّهت اللجنة باعتماد مدة اللائحة الأحدث إصدارًا.', actor: 'المقرر' })
      .expect(200);

    const study = await request(app).get(`/api/studies/${studyId}`).expect(200);
    expect(study.body.study.conflicts[0].resolved).toBe(true);
    const check = study.body.study.readiness.find((item: { key: string }) => item.key === 'conflicts');
    expect(check.ok).toBe(true);
    expect(study.body.revisions.some((r: { field: string }) => r.field === 'conflict_resolution')).toBe(true);
  });

  it('يرفض حسم التعارض بدون تسجيل توجيه مكتوب', async () => {
    const { studyId } = await seedConflictingSources();
    const response = await request(app)
      .post(`/api/studies/${studyId}/conflicts/resolve`)
      .send({ conflictKey: 'مدة التقديم قبل الجلسة', note: 'ok' })
      .expect(400);
    expect(response.body.error).toBe('بيانات غير صالحة.');
  });
});

describe('سجل تعديلات المراجع وإصدار الدراسة', () => {
  it('يسجّل تعديل المراجع بسببه ووقته، ثم يسمح بالإصدار النهائي بعد اكتمال الجاهزية', async () => {
    const { studyId } = await seedConflictingSources();
    await request(app)
      .post(`/api/studies/${studyId}/conflicts/resolve`)
      .send({ conflictKey: 'مدة التقديم قبل الجلسة', note: 'وجّهت اللجنة باعتماد اللائحة الأحدث إصدارًا.' })
      .expect(200);

    const before = await request(app).get(`/api/studies/${studyId}`).expect(200);
    expect(before.body.findings.length).toBeGreaterThan(0);

    for (const finding of before.body.findings) {
      await request(app)
        .put(`/api/studies/${studyId}/findings/${finding.id}`)
        .send({
          verdict: 'unverifiable',
          verdictReason: 'لا يوجد دليل قابل للتحقق في المرفقات المقدمة.',
          reason: 'مراجعة يدوية من المقرر.',
          actor: 'المقرر',
        })
        .expect(200);
    }

    const after = await request(app).get(`/api/studies/${studyId}`).expect(200);
    expect(after.body.revisions.some((r: { field: string; reason: string }) => r.field === 'verdict_reason' && r.reason.includes('مراجعة يدوية'))).toBe(true);
    expect(after.body.findings.every((f: { edited: boolean }) => f.edited)).toBe(true);

    const finalize = await request(app).post(`/api/studies/${studyId}/finalize`).expect(200);
    expect(finalize.body.status).toBe('final');

    const locked = await request(app)
      .put(`/api/studies/${studyId}`)
      .send({ memo: 'محاولة تعديل بعد الإصدار' })
      .expect(409);
    expect(locked.body.error).toContain('نهائية');
  });

  it('يصدّر مسودة عربية قابلة للطباعة وملف DOCX مع تنبيه النموذج الرسمي', async () => {
    const { studyId } = await seedConflictingSources();
    const html = await request(app).get(`/api/studies/${studyId}/export.html`).expect(200);
    expect(html.text).toContain('dir="rtl"');
    expect(html.text).toContain('مصفوفة المطابقة والأدلة');
    expect(html.text).toContain('ربط الحقول بالقالب لم يُعتمد بعد');

    const docx = await request(app).get(`/api/studies/${studyId}/export.docx`).expect(200);
    expect(docx.headers['content-type']).toContain('wordprocessingml');
    expect(Number(docx.headers['content-length'])).toBeGreaterThan(1000);
  });

  it('يحافظ على أسطر المذكرة في التصديرين بدل دمجها في فقرة واحدة', async () => {
    const { studyId } = await seedConflictingSources();
    await request(app)
      .put(`/api/studies/${studyId}`)
      .send({ memo: 'السطر الأول من المذكرة.\n\nالسطر الثاني من المذكرة.' })
      .expect(200);

    const html = (await request(app).get(`/api/studies/${studyId}/export.html`).expect(200)).text;
    expect(html).toContain('<p>السطر الأول من المذكرة.</p>');
    expect(html).toContain('<p>السطر الثاني من المذكرة.</p>');

    const docx = await request(app)
      .get(`/api/studies/${studyId}/export.docx`)
      .buffer(true)
      .parse((res, callback) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => callback(null, Buffer.concat(chunks)));
      })
      .expect(200);
    const zip = await JSZip.loadAsync(docx.body as Buffer);
    const documentXml = await zip.file('word/document.xml')!.async('string');
    // Each line is its own <w:p>, so the two never share one paragraph.
    const firstLine = documentXml.indexOf('السطر الأول من المذكرة.');
    const secondLine = documentXml.indexOf('السطر الثاني من المذكرة.');
    expect(firstLine).toBeGreaterThan(-1);
    expect(secondLine).toBeGreaterThan(firstLine);
    expect(documentXml.slice(firstLine, secondLine)).toContain('</w:p>');
  });
});
