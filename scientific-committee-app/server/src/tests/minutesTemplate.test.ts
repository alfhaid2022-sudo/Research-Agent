import JSZip from 'jszip';
import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { fillMinutesTemplate } from '../services/minutesTemplate.js';
import type { MinutesExportModel } from '../services/export.js';
import { resetDb, testApp } from './helpers.js';

const app = testApp();

/**
 * A synthetic stand-in for the institution's form: same Arabic anchors and the
 * same kinds of extra parts (header, image, styles), so the preservation and
 * filling rules can be tested without putting the real form or any member name
 * in the repository.
 */
function cell(text: string): string {
  return `<w:tc><w:tcPr><w:tcW w:w="2000" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:bidi/></w:pPr><w:r><w:rPr><w:rtl/></w:rPr><w:t>${text}</w:t></w:r></w:p></w:tc>`;
}
function row(...texts: string[]): string {
  return `<w:tr>${texts.map(cell).join('')}</w:tr>`;
}
function table(...rowsXml: string[]): string {
  return `<w:tbl><w:tblPr><w:bidiVisual/><w:tblW w:w="0" w:type="auto"/></w:tblPr>${rowsXml.join('')}</w:tbl>`;
}
function paragraph(text: string): string {
  return `<w:p><w:pPr><w:bidi/></w:pPr><w:r><w:t>${text}</w:t></w:r></w:p>`;
}

const FLOATING_ENTITY_TABLE =
  `<w:tbl><w:tblPr><w:tblpPr w:vertAnchor="page" w:horzAnchor="margin" w:tblpY="2053"/><w:bidiVisual/>` +
  `<w:tblW w:w="0" w:type="auto"/></w:tblPr>${row('', 'الجهة ذات العلاقة', '')}</w:tbl>`;

const DOCUMENT_XML =
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
  `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>` +
  paragraph('محضر اجتماع') +
  table(row('اسم اللجنة', '', 'التاريخ', ''), row('رقم الجلسة', '', 'الوقت', '')) +
  paragraph('أولاً: أعضاء اللجنة حسب قرار تكوينها:') +
  table(
    row('م', 'الاسم', 'الصفة', 'حالة الحضور', 'سبب التغيب'),
    row('1', 'اسم من القالب أ', 'مقرراً', 'حضور', ''),
    row('2', 'اسم من القالب ب', 'عضواً', 'حضور', ''),
  ) +
  paragraph('ثانياً: جدول أعمال الجلسة:') +
  table(row('م', 'الموضوع'), row('', '')) +
  paragraph('ثالثاً: المناقشات والقرارات أو التوصيات:') +
  table(
    row('1', 'الموضوع 1', ''),
    row('2', 'ملخص وصف الموضوع ومناقشته', ''),
    row('3', 'القرار/التوصية', ''),
  ) +
  paragraph('') +
  FLOATING_ENTITY_TABLE +
  paragraph('رابعاً: يوصي أعضاء اللجنة برفع هذا المحضر إلى صفة من القالب.') +
  paragraph('خامساً: رأي الأعضاء في المحضر:') +
  table(
    row('م', 'الاسم', 'الصفة', 'التوقيع'),
    row('1', 'اسم مختلف من القالب أ', 'مقرراً', 'توقيع من القالب'),
    row('2', 'اسم مختلف من القالب ب', 'عضواً', 'توقيع من القالب'),
  ) +
  paragraph('سادساً: الإضافات والملحوظات:') +
  paragraph('....................................................') +
  `<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1608" w:bottom="270" w:left="1411"/></w:sectPr>` +
  `</w:body></w:document>`;

const EXTRA_PARTS: Record<string, Buffer | string> = {
  '[Content_Types].xml': '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>',
  '_rels/.rels': '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>',
  'word/_rels/document.xml.rels': '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>',
  'word/styles.xml': '<?xml version="1.0"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"/>',
  'word/header1.xml': '<?xml version="1.0"?><w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"/>',
  'word/media/image1.png': Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3, 4, 5]),
  'docProps/core.xml': '<?xml version="1.0"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"/>',
};

async function buildTemplate(documentXml = DOCUMENT_XML): Promise<Buffer> {
  const zip = new JSZip();
  for (const [name, content] of Object.entries(EXTRA_PARTS)) zip.file(name, content);
  zip.file('word/document.xml', documentXml);
  return Buffer.from(await zip.generateAsync({ type: 'nodebuffer' }));
}

function model(overrides: Partial<MinutesExportModel> = {}): MinutesExportModel {
  return {
    org: { university: 'جامعة الجوف', college: 'كلية العلوم الطبية التطبيقية', department: 'قسم علوم المختبرات الإكلينيكية', committee: 'اللجنة العلمية' },
    scope: 'real',
    title: 'محضر اختبار',
    committeeName: 'اللجنة العلمية',
    meetingDate: '1448-02-05',
    meetingCalendar: 'hijri',
    meetingTime: '10:00',
    sessionNo: '3',
    addressee: { name: '', title: '', state: 'pending_review' },
    notes: '',
    additions: '',
    members: [
      { ordinal: 1, name: 'عضو أ', role: 'مقرراً', state: 'present', absenceReason: '' },
      { ordinal: 2, name: 'عضو ب', role: 'عضواً', state: 'absent', absenceReason: 'إجازة' },
    ],
    items: [
      { ordinal: 1, refNo: 'س-1', requestTitle: 'طلب', subject: 'الموضوع الأول', body: 'مناقشة أولى', decision: '', relatedEntity: 'جهة أولى' },
      { ordinal: 2, refNo: '', requestTitle: '', subject: 'الموضوع الثاني', body: 'مناقشة ثانية', decision: '', relatedEntity: 'جهة ثانية' },
    ],
    demoNotice: '',
    templateNotice: '',
    ...overrides,
  };
}

async function readParts(buffer: Buffer): Promise<Map<string, Buffer>> {
  const zip = await JSZip.loadAsync(buffer);
  const out = new Map<string, Buffer>();
  for (const name of Object.keys(zip.files)) {
    if (zip.files[name]!.dir) continue;
    out.set(name, Buffer.from(await zip.files[name]!.async('nodebuffer')));
  }
  return out;
}

async function documentText(buffer: Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  return zip.file('word/document.xml')!.async('string');
}

beforeEach(() => resetDb());

describe('التصدير على نموذج المحضر الرسمي', () => {
  it('يحافظ على كل أجزاء القالب بايتًا ببايت عدا نص المستند', async () => {
    const template = await buildTemplate();
    const { buffer } = await fillMinutesTemplate(template, model());

    const before = await readParts(template);
    const after = await readParts(buffer);
    expect([...after.keys()].sort()).toEqual([...before.keys()].sort());
    for (const [name, content] of before) {
      if (name === 'word/document.xml') continue;
      expect(after.get(name)!.equals(content), `تغيّر الجزء ${name}`).toBe(true);
    }
    // The image and the header survive untouched.
    expect(after.get('word/media/image1.png')!.equals(before.get('word/media/image1.png')!)).toBe(true);
  });

  it('يحافظ على إعداد الصفحة واتجاه RTL كما في القالب', async () => {
    const { buffer } = await fillMinutesTemplate(await buildTemplate(), model());
    const xml = await documentText(buffer);
    expect(xml).toContain('w:pgSz w:w="12240" w:h="15840"');
    expect(xml).toContain('w:top="1440"');
    expect(xml).toContain('<w:bidiVisual/>');
    expect(xml).toContain('<w:bidi/>');
  });

  it('يبني جدولي الحضور والتوقيع من تشكيل واحد ولا ينسخ أسماء القالب', async () => {
    const { buffer } = await fillMinutesTemplate(await buildTemplate(), model());
    const xml = await documentText(buffer);

    expect(xml).not.toContain('اسم من القالب');
    expect(xml).not.toContain('اسم مختلف من القالب');
    // Each member appears twice: once in attendance, once in the signature table.
    expect(xml.split('عضو أ').length - 1).toBe(2);
    expect(xml.split('عضو ب').length - 1).toBe(2);
  });

  it('لا ينسخ حالة الحضور ولا التوقيعات من القالب', async () => {
    const { buffer } = await fillMinutesTemplate(await buildTemplate(), model());
    const xml = await documentText(buffer);
    expect(xml).not.toContain('توقيع من القالب');
    expect(xml).not.toContain('>حضور<');
    expect(xml).toContain('حاضر');
    expect(xml).toContain('غائب');
    expect(xml).toContain('إجازة');
  });

  it('يترك حالة الحضور «لم يُسجَّل» عندما لا تُسجَّل للاجتماع', async () => {
    const { buffer } = await fillMinutesTemplate(
      await buildTemplate(),
      model({
        members: [{ ordinal: 1, name: 'عضو ج', role: 'عضواً', state: 'unrecorded', absenceReason: '' }],
      }),
    );
    expect(await documentText(buffer)).toContain('لم يُسجَّل');
  });

  it('يبقي الجهة ذات العلاقة ملتصقة ببندها عند تكرار البنود', async () => {
    const { buffer, report } = await fillMinutesTemplate(await buildTemplate(), model());
    // Measure inside the discussions section only: the subjects also appear
    // earlier in the agenda table.
    const xml = await documentText(buffer);
    const discussions = xml.slice(xml.indexOf('ثالثاً'));
    const firstItem = discussions.indexOf('الموضوع الأول');
    const firstEntity = discussions.indexOf('جهة أولى');
    const secondItem = discussions.indexOf('الموضوع الثاني');
    const secondEntity = discussions.indexOf('جهة ثانية');
    expect(firstItem).toBeGreaterThan(-1);
    expect(firstEntity).toBeGreaterThan(firstItem);
    expect(secondItem).toBeGreaterThan(firstEntity);
    expect(secondEntity).toBeGreaterThan(secondItem);
    // Each block keeps the template's own "الموضوع N" label, renumbered per item.
    expect(discussions).toContain('الموضوع 1');
    expect(discussions).toContain('الموضوع 2');
    expect(report.deviations.join(' ')).toContain('الجهة ذات العلاقة');
  });

  it('لا يستبدل المخاطب في «رابعاً» قبل تأكيده، ويستبدله بعد التأكيد', async () => {
    const pending = await fillMinutesTemplate(await buildTemplate(), model());
    expect(await documentText(pending.buffer)).toContain('صفة من القالب');
    expect(pending.report.warnings.join(' ')).toContain('لم يؤكَّد');

    const confirmed = await fillMinutesTemplate(
      await buildTemplate(),
      model({ addressee: { name: 'رئيس القسم', title: 'سعادة', state: 'confirmed' } }),
    );
    const xml = await documentText(confirmed.buffer);
    expect(xml).toContain('سعادة رئيس القسم');
    expect(xml).not.toContain('صفة من القالب');
  });

  it('يرفض ملفًا لا يطابق هيكل النموذج بدل إنتاج مستند لا يطابقه', async () => {
    const wrong = await buildTemplate(
      `<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">` +
        `<w:body>${paragraph('مستند آخر لا علاقة له')}</w:body></w:document>`,
    );
    await expect(fillMinutesTemplate(wrong, model())).rejects.toThrow(/لا يطابق هيكل نموذج المحضر/);
  });

  it('يبلّغ أن التصدير على النموذج غير متاح قبل رفع النموذج الرسمي', async () => {
    const created = await request(app)
      .post('/api/minutes')
      .send({ title: 'محضر بلا نموذج', scope: 'real' })
      .expect(201);

    const check = await request(app).get(`/api/minutes/${created.body.id}/template-check`).expect(200);
    expect(check.body.available).toBe(false);
    expect(check.body.reason).toContain('النموذج الرسمي لم يضف بعد');

    const exported = await request(app).get(`/api/minutes/${created.body.id}/export-template.docx`).expect(409);
    expect(exported.body.error).toContain('النموذج الرسمي لم يضف بعد');
  });
});
