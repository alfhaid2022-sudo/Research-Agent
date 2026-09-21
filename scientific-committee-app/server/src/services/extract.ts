import path from 'node:path';
import { type QualityVerdict, assessText, repeatedLines, summarizeDocument } from './textQuality.js';

export type ExtractionStatus =
  | 'extracted'
  | 'partial'
  | 'needs_review'
  | 'needs_ocr'
  | 'unsupported'
  | 'failed';

export interface ExtractedSegment {
  ordinal: number;
  locator: string;
  page: number | null;
  text: string;
  needsOcr: boolean;
  quality: QualityVerdict['quality'];
  qualityNote: string;
}

export interface ExtractionResult {
  status: ExtractionStatus;
  note: string;
  segments: ExtractedSegment[];
  /** Pages in the source document (PDF only); 0 when the format has no pages. */
  pageCount: number;
}

export const SUPPORTED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.md', '.csv'] as const;

export function isSupportedExtension(fileName: string): boolean {
  const ext = path.extname(fileName).toLowerCase();
  return (SUPPORTED_EXTENSIONS as readonly string[]).includes(ext);
}

/** Detects an Arabic article/clause heading at the start of a block, if one is really there. */
function locatorFor(block: string, index: number): string {
  const head = block.trimStart().slice(0, 80);
  const article = head.match(/^(المادة|البند|الفقرة|القاعدة|الفصل)\s*[\(\[]?\s*([0-9٠-٩]+)/u);
  if (article) return `${article[1]} ${article[2]}`;
  return `الفقرة ${index}`;
}

/** Minimum characters for a paragraph block (not a page) to count as readable. */
const BLOCK_MIN_CHARS = 8;

const HEADING_ONLY = /^(المادة|البند|الفقرة|القاعدة|الفصل)\s*[\(\[]?\s*[0-9\u0660-\u0669]+\s*[\)\]]?\s*$/u;

function splitTextIntoSegments(text: string): ExtractedSegment[] {
  const blocks = text
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n+/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  // A bare heading line ("المادة 3") belongs with the clause that follows it.
  const merged: string[] = [];
  for (const block of blocks) {
    const last = merged[merged.length - 1];
    if (last !== undefined && last.length < 60 && HEADING_ONLY.test(last.trim())) {
      merged[merged.length - 1] = `${last}\n${block}`;
    } else {
      merged.push(block);
    }
  }

  return merged.map((block, i) => {
    const verdict = assessText(block, { minChars: BLOCK_MIN_CHARS });
    return {
      ordinal: i + 1,
      locator: locatorFor(block, i + 1),
      page: null,
      text: block,
      needsOcr: verdict.quality === 'none',
      quality: verdict.quality,
      qualityNote: verdict.note,
    };
  });
}

async function extractPdf(buffer: Buffer): Promise<ExtractionResult> {
  const pdfjs: any = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
    isEvalSupported: false,
  }).promise;

  const pageTexts: string[] = [];
  for (let pageNo = 1; pageNo <= doc.numPages; pageNo += 1) {
    const page = await doc.getPage(pageNo);
    const content = await page.getTextContent();
    const text = (content.items as Array<{ str?: string; hasEOL?: boolean }>)
      .map((item) => (item.str ?? '') + (item.hasEOL ? '\n' : ''))
      .join('')
      .replace(/[ \t]+/g, ' ')
      .trim();
    pageTexts.push(text);
  }
  await doc.destroy?.();

  if (pageTexts.length === 0) {
    return { status: 'failed', note: 'لم يتم العثور على صفحات قابلة للقراءة في الملف.', segments: [], pageCount: 0 };
  }

  // Header/footer/watermark lines repeat across pages and carry no page content.
  const repeated = repeatedLines(pageTexts);
  const verdicts = pageTexts.map((text) => assessText(text, { repeated }));
  const segments: ExtractedSegment[] = pageTexts.map((text, index) => ({
    ordinal: index + 1,
    locator: `صفحة ${index + 1}`,
    page: index + 1,
    text,
    needsOcr: verdicts[index]!.quality === 'none',
    quality: verdicts[index]!.quality,
    qualityNote: verdicts[index]!.note,
  }));

  const summary = summarizeDocument(verdicts);
  return { status: summary.status, note: summary.note, segments, pageCount: pageTexts.length };
}

async function extractDocx(buffer: Buffer): Promise<ExtractionResult> {
  const mammoth: any = await import('mammoth');
  const result = await mammoth.extractRawText({ buffer });
  const text: string = result?.value ?? '';
  if (assessText(text).quality === 'none') {
    return {
      status: 'needs_ocr',
      note: 'ملف DOCX لا يحتوي نصًا قابلًا للاستخراج (قد يحتوي صورًا فقط). يحتاج مراجعة يدوية أو OCR. لم تُرسل أي بيانات إلى خدمة خارجية.',
      segments: [],
      pageCount: 0,
    };
  }
  const segments = splitTextIntoSegments(text);
  const summary = summarizeDocument(segments.map((segment) => assessText(segment.text, { minChars: BLOCK_MIN_CHARS })));
  return { status: summary.status, note: summary.note, segments, pageCount: 0 };
}

function extractPlainText(buffer: Buffer): ExtractionResult {
  const text = buffer.toString('utf8');
  if (text.trim().length === 0) {
    return { status: 'failed', note: 'الملف النصي فارغ.', segments: [], pageCount: 0 };
  }
  const segments = splitTextIntoSegments(text);
  const summary = summarizeDocument(segments.map((segment) => assessText(segment.text, { minChars: BLOCK_MIN_CHARS })));
  return { status: summary.status, note: summary.note, segments, pageCount: 0 };
}

/**
 * Extracts text segments from a supported document.
 * Never claims to have read content it could not read: unreadable pages are
 * returned with needsOcr = true and an honest status.
 */
export async function extractDocument(fileName: string, buffer: Buffer): Promise<ExtractionResult> {
  const ext = path.extname(fileName).toLowerCase();
  try {
    if (ext === '.pdf') return await extractPdf(buffer);
    if (ext === '.docx') return await extractDocx(buffer);
    if (ext === '.txt' || ext === '.md' || ext === '.csv') return extractPlainText(buffer);
    return {
      status: 'unsupported',
      note: `الامتداد ${ext || '(بدون امتداد)'} غير مدعوم للاستخراج في هذا الإصدار. الصيغ المدعومة: ${SUPPORTED_EXTENSIONS.join('، ')}.`,
      segments: [],
      pageCount: 0,
    };
  } catch (error) {
    return {
      status: 'failed',
      note: `تعذّر استخراج النص: ${(error as Error).message}`,
      segments: [],
      pageCount: 0,
    };
  }
}
