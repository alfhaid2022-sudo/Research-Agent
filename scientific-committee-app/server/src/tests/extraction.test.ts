import { describe, expect, it } from 'vitest';
import { extractDocument, isSupportedExtension } from '../services/extract.js';
import { safeBaseName } from '../services/storage.js';
import { SAMPLE_REGULATION } from './helpers.js';

describe('استخراج النصوص من الملفات', () => {
  it('يستخرج مقاطع من ملف نصي مدعوم ويحدد موضع كل مادة', async () => {
    const result = await extractDocument('لائحة.txt', Buffer.from(SAMPLE_REGULATION, 'utf8'));
    expect(result.status).toBe('extracted');
    expect(result.segments.length).toBeGreaterThanOrEqual(2);
    const locators = result.segments.map((s) => s.locator);
    expect(locators.some((l) => l.startsWith('المادة'))).toBe(true);
    expect(result.segments.every((s) => s.needsOcr === false)).toBe(true);
  });

  it('يعلن صراحة أن الامتداد غير مدعوم بدل ادعاء القراءة', async () => {
    const result = await extractDocument('scan.tiff', Buffer.from('binary', 'utf8'));
    expect(result.status).toBe('unsupported');
    expect(result.segments).toHaveLength(0);
    expect(result.note).toContain('غير مدعوم');
  });

  it('يعلّم ملف DOCX بلا نص بأنه يحتاج OCR/مراجعة', async () => {
    // A DOCX whose body holds no extractable text must not be reported as read.
    const { Document, Packer, Paragraph } = await import('docx');
    const doc = new Document({ sections: [{ children: [new Paragraph('')] }] });
    const buffer = await Packer.toBuffer(doc);
    const result = await extractDocument('ممسوح.docx', Buffer.from(buffer));
    expect(result.status).toBe('needs_ocr');
    expect(result.note).toContain('OCR');
  });

  it('يتعرف على الامتدادات المدعومة وينظّف أسماء الملفات من مسارات الاجتياز', () => {
    expect(isSupportedExtension('a.pdf')).toBe(true);
    expect(isSupportedExtension('a.docx')).toBe(true);
    expect(isSupportedExtension('a.exe')).toBe(false);
    expect(safeBaseName('../../etc/passwd')).toBe('passwd');
    expect(safeBaseName('C:\\Windows\\system32\\x.txt')).toBe('x.txt');
  });
});
