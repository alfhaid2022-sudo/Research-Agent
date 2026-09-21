import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { getDb } from '../db.js';
import { validateFindings } from '../services/citations.js';
import { assessText, repeatedLines, stripRepeated, summarizeDocument } from '../services/textQuality.js';
import { effectiveSegment } from '../services/segments.js';
import { createRequestType, firstSegmentId, resetDb, testApp, uploadTextSource } from './helpers.js';

const app = testApp();

/** Arabic text with a broken OCR layer: Latin letters scattered through the words. */
const GARBLED_OCR = `ﺔﺤﺋﻼﻟا dgl ﻂﺑاﻮﺿ sdf ﺮﻤﺗﺆﻤﻟا kkk lkjh
qwer ﺪﻋاﻮﻗ zxcv 1234 asdf ﺔﻛرﺎﺸﻤﻟا poiu mnbv lkjh gfds
xcvb ﻢﻳﺪﻘﺗ qwer ﺐﻠﻄﻟا zxcv asdf qwer poiu mnbv lkjh gfds`;

const WATERMARK_PAGE = `نسخة غير رسمية
نسخة غير رسمية
نسخة غير رسمية`;

beforeEach(() => resetDb());

describe('جودة النص المستخرج', () => {
  it('لا يعتبر وجود أحرف أكبر من صفر نجاحًا: يكشف طبقة OCR مشوّهة', () => {
    const verdict = assessText(GARBLED_OCR);
    expect(verdict.quality).toBe('suspect');
    expect(verdict.note).toMatch(/مشوّهة|منخفضة/);
    expect(verdict.metrics.chars).toBeGreaterThan(0);
  });

  it('لا يعدّ المستند الإنجليزي نصًا مشوّهًا: المرفقات قد تكون ورقة منشورة أو سجل فهرسة', () => {
    const englishPage = [
      'An example indexing record for a paper submitted with an excellence award request.',
      'Published: AUG 2026. Volume 12, Issue 3, Pages 100-118. Early Access: FEB 2026.',
      'This record is from an example citation index used only to exercise the extractor.',
    ].join('\n');

    const verdict = assessText(englishPage);
    expect(verdict.quality).toBe('good');
    expect(verdict.metrics.arabicRatio).toBe(0);
    expect(verdict.metrics.latinRatio).toBe(1);
  });

  it('يكشف النص العربي الخارج بأشكال العرض ولا يقبله سندًا', () => {
    // The same sentence, once as real Arabic letters and once as the presentation
    // forms a glyph-only PDF layer produces.
    const readable = 'تُقدَّم الطلبات إلى اللجنة قبل خمسة عشر يومًا من موعد انعقاد الجلسة المقبلة.';
    const presentationForms = 'ﺗُﻘﺪَّم اﻟﻄﻠﺒﺎت إﻟﻰ اﻟﻠﺠﻨﺔ ﻗﺒﻞ ﺧﻤﺴﺔ ﻋﺸﺮ ﯾﻮﻣًﺎ ﻣﻦ ﻣﻮﻋﺪ اﻧﻌﻘﺎد اﻟﺠﻠﺴﺔ.';

    expect(assessText(readable).quality).toBe('good');

    const broken = assessText(presentationForms);
    expect(broken.quality).toBe('suspect');
    expect(broken.note).toContain('أشكال العرض');
    expect(broken.metrics.presentationRatio).toBeGreaterThan(0.2);
    // The Arabic is still counted as Arabic: the page is not "a Latin document".
    expect(broken.metrics.arabicRatio).toBe(1);
  });

  it('لا يعتبر اسم مجلة إنجليزيًا داخل نموذج عربي طبقةً مشوّهة', () => {
    const bilingualForm = [
      'اسم الباحث: ............ الكلية: كلية العلوم الطبية التطبيقية بالقريات',
      'اسم المجلة: Journal of Example Studies — قاعدة البيانات: Example Index',
      'تاريخ تقديم الطلب: عشرة من سبتمبر لعام ألفين وستة وعشرين ميلادية.',
      'يرفق الباحث ما يثبت النشر وترتيبه في البحث وانتماءه للجامعة عند التقديم.',
    ].join('\n');

    const verdict = assessText(bilingualForm);
    expect(verdict.metrics.latinRatio).toBeLessThan(0.2);
    expect(verdict.quality).toBe('good');
  });

  it('يعتبر الصفحة التي لا تحمل إلا سطورًا متكررة بلا نص خاص بها', () => {
    const pages = [WATERMARK_PAGE, WATERMARK_PAGE, `${WATERMARK_PAGE}\nنص مادة حقيقية يكفي طولها للفحص والاعتماد.`];
    const repeated = repeatedLines(pages);
    expect(repeated.has('نسخة غير رسمية')).toBe(true);
    expect(stripRepeated(pages[0]!, repeated)).toBe('');

    const verdicts = pages.map((page) => assessText(page, { repeated }));
    expect(verdicts[0]!.quality).toBe('none');
    expect(verdicts[0]!.note).toContain('علامة مائية');
    expect(verdicts[2]!.quality).toBe('good');
  });

  it('يصنّف المستند الذي لا يحوي مقطعًا مقروءًا واحدًا بأنه يحتاج مراجعة', () => {
    const summary = summarizeDocument([
      assessText(GARBLED_OCR),
      assessText(''),
    ]);
    expect(summary.status).toBe('needs_review');
    expect(summary.note).toContain('يحتاج مراجعة بشرية أو إدخالًا يدويًا');
  });

  it('يرفض تحويل نص OCR مشوّه إلى سند متحقق، ويقبله بعد إدخال يدوي معتمد فقط', async () => {
    const sourceId = await uploadTextSource(app, { title: 'لائحة ممسوحة', body: GARBLED_OCR });
    const detail = await request(app).get(`/api/sources/${sourceId}`).expect(200);
    expect(['needs_review', 'partial', 'needs_ocr']).toContain(detail.body.source.extractionStatus);

    const segmentId = detail.body.segments[0].id as string;
    const db = getDb();
    expect(effectiveSegment(db, segmentId)?.usableAsBasis).toBe(false);

    // A requirement may not quote text that was never confirmed readable.
    const refused = await request(app)
      .post('/api/requirements')
      .send({ sourceId, segmentId, text: 'متطلب من نص مشوّه', quote: 'ﺔﺤﺋﻼﻟا dgl ﻂﺑاﻮﺿ sdf' })
      .expect(400);
    expect(refused.body.error).toContain('لا يمكن قبول اقتباس');

    // Manual page text is recorded but is not a basis until a human approves it.
    const correction = await request(app)
      .post(`/api/segments/${segmentId}/corrections`)
      .send({ text: 'تُقدَّم الطلبات إلى اللجنة قبل خمسة عشر يومًا من موعد انعقاد الجلسة.', enteredBy: 'المقرر' })
      .expect(201);
    expect(correction.body.status).toBe('entered');
    expect(effectiveSegment(db, segmentId)?.usableAsBasis).toBe(false);

    await request(app)
      .put(`/api/corrections/${correction.body.id}`)
      .send({ status: 'approved', reviewedBy: 'المراجع', reviewNote: 'طوبق النص مع الأصل الورقي.' })
      .expect(200);

    const afterApproval = effectiveSegment(db, segmentId);
    expect(afterApproval?.usableAsBasis).toBe(true);
    expect(afterApproval?.origin).toBe('correction');

    const accepted = await request(app)
      .post('/api/requirements')
      .send({
        sourceId,
        segmentId,
        text: 'تقديم الطلب قبل خمسة عشر يومًا.',
        quote: 'تُقدَّم الطلبات إلى اللجنة قبل خمسة عشر يومًا',
      })
      .expect(201);
    expect(accepted.body.id).toBeTruthy();
  });

  it('لا يسند نتيجة إلى مقطع غير مقروء حتى لو كان المتطلب معتمدًا', async () => {
    const typeId = await createRequestType(app);
    const requestId = (
      await request(app).post('/api/requests').send({ refNo: 'ج-1', typeId, title: 'طلب' }).expect(201)
    ).body.id as string;
    const sourceId = await uploadTextSource(app, { title: 'لائحة ممسوحة', body: GARBLED_OCR });
    const segmentId = firstSegmentId(sourceId, 'ﻂﺑاﻮﺿ');

    const db = getDb();
    const at = new Date().toISOString();
    db.prepare(
      `INSERT INTO requirements (id, source_id, segment_id, scope, text, quote, locator, category,
                                 conflict_key, conflict_value, applies_to, tracks, status, origin, created_at, updated_at)
       VALUES ('req_ocr', ?, ?, 'real', 'متطلب مبني على نص مشوّه', '', '', '', '', '', '[]', '["conference"]',
               'approved', 'manual', ?, ?)`,
    ).run(sourceId, segmentId, at, at);

    const outcome = validateFindings(db, {
      requestId,
      scope: 'real',
      track: 'conference',
      rawFindings: [{ requirementId: 'req_ocr', basisSegmentId: segmentId, basisQuote: 'ﻂﺑاﻮﺿ', verdict: 'met' }],
    });

    const finding = outcome.accepted[0]!;
    expect(finding.verdict).toBe('unverifiable');
    expect(finding.validation.basisVerified).toBe(false);
    expect(finding.validation.issues.join(' ')).toContain('غير صالح كسند متحقق');
  });
});
