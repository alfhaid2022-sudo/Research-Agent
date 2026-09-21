/**
 * Judges whether extracted text is actually usable as a legal basis.
 *
 * A character count above zero is NOT success: a scanned regulation can yield
 * only a repeated watermark, and a bad OCR layer can yield Arabic text peppered
 * with Latin characters. Both are reported honestly instead of being treated as
 * readable text.
 *
 * Being written in a script other than Arabic is NOT a defect. An attachment may
 * legitimately be an English paper or an indexing record, and a page of readable
 * English is readable. Only a page that mixes the two scripts the way a broken
 * text layer does, or that carries Arabic in presentation forms, is held back.
 */

export type TextQuality = 'good' | 'suspect' | 'none';

export interface QualityVerdict {
  quality: TextQuality;
  note: string;
  metrics: {
    chars: number;
    arabicRatio: number;
    latinRatio: number;
    distinctChars: number;
    /** Share of the Arabic letters that came out as presentation forms. */
    presentationRatio: number;
    repeatedShare: number;
  };
}

const MIN_USEFUL_CHARS = 25;
/**
 * Share of the minority script above which a bilingual page stops looking like a
 * document with a few foreign terms and starts looking like a broken text layer.
 */
const MAX_MINORITY_RATIO = 0.2;
/**
 * Arabic extracted as Unicode presentation forms (U+FB50-FDFF, U+FE70-FEFF) comes
 * from a PDF that stored glyph shapes rather than letters. It renders, but it is
 * not searchable or quotable text.
 */
const MAX_PRESENTATION_RATIO = 0.2;

function countLetters(text: string): { arabic: number; presentation: number; latin: number; total: number } {
  let arabic = 0;
  let presentation = 0;
  let latin = 0;
  for (const char of text) {
    // Presentation forms are Arabic letters too. Counting them as "not Arabic"
    // made a whole Arabic page look like a Latin one.
    if (/[\ufb50-\ufdff\ufe70-\ufeff]/u.test(char)) {
      arabic += 1;
      presentation += 1;
    } else if (/[؀-ۿ]/.test(char)) {
      arabic += 1;
    } else if (/[A-Za-z]/.test(char)) {
      latin += 1;
    }
  }
  return { arabic, presentation, latin, total: arabic + latin };
}

export function normalizeLine(line: string): string {
  return line.replace(/\s+/g, ' ').trim();
}

/**
 * Lines that repeat across most pages of a document are headers, footers or a
 * watermark — they carry no page-specific content.
 */
export function repeatedLines(pages: string[], threshold = 0.6): Set<string> {
  if (pages.length < 2) return new Set();
  const counts = new Map<string, number>();
  for (const page of pages) {
    const unique = new Set(
      page
        .split('\n')
        .map(normalizeLine)
        .filter((line) => line.length > 0),
    );
    for (const line of unique) counts.set(line, (counts.get(line) ?? 0) + 1);
  }
  const limit = Math.max(2, Math.ceil(pages.length * threshold));
  return new Set([...counts.entries()].filter(([, count]) => count >= limit).map(([line]) => line));
}

export function stripRepeated(text: string, repeated: Set<string>): string {
  return text
    .split('\n')
    .filter((line) => !repeated.has(normalizeLine(line)))
    .join('\n')
    .trim();
}

export function assessText(
  text: string,
  options: { repeated?: Set<string>; minChars?: number } = {},
): QualityVerdict {
  // A PDF page needs real content to count as read; a single paragraph inside a
  // readable text file may legitimately be short (a heading, a title line).
  const minChars = options.minChars ?? MIN_USEFUL_CHARS;
  const body = options.repeated ? stripRepeated(text, options.repeated) : text.trim();
  const chars = body.replace(/\s/g, '').length;
  const letters = countLetters(body);
  const arabicRatio = letters.total === 0 ? 0 : letters.arabic / letters.total;
  const latinRatio = letters.total === 0 ? 0 : letters.latin / letters.total;
  const distinctChars = new Set(body.replace(/\s/g, '')).size;
  const originalChars = text.replace(/\s/g, '').length;
  const repeatedShare = originalChars === 0 ? 0 : 1 - chars / originalChars;

  const presentationRatio = letters.arabic === 0 ? 0 : letters.presentation / letters.arabic;

  const metrics = { chars, arabicRatio, latinRatio, distinctChars, presentationRatio, repeatedShare };

  if (chars < minChars) {
    return {
      quality: 'none',
      note:
        repeatedShare > 0.5
          ? 'لا يوجد نص خاص بهذه الصفحة بعد استبعاد السطور المتكررة (يُرجَّح أنها علامة مائية أو ترويسة). تحتاج OCR أو إدخالًا يدويًا.'
          : 'لا يوجد نص قابل للاستخراج في هذه الصفحة. تحتاج OCR أو إدخالًا يدويًا.',
      metrics,
    };
  }
  if (letters.arabic > 0 && presentationRatio > MAX_PRESENTATION_RATIO) {
    return {
      quality: 'suspect',
      note: `${Math.round(presentationRatio * 100)}% من الحروف العربية خرجت بأشكال العرض (Presentation Forms)، وهي طبقة نص مشوّهة تُعرض ولا تُقرأ آليًا ولا يصح الاقتباس منها. تحتاج مراجعة بشرية أو إدخالًا يدويًا.`,
      metrics,
    };
  }
  // Both scripts present in force is the signature of a broken layer, not of a
  // bilingual document: a form with an English journal name stays well below this.
  if (letters.arabic > 0 && letters.latin > 0 && Math.min(arabicRatio, latinRatio) > MAX_MINORITY_RATIO) {
    const minorityIsLatin = latinRatio <= arabicRatio;
    return {
      quality: 'suspect',
      note: minorityIsLatin
        ? `طبقة النص تبدو مشوّهة: ${Math.round(latinRatio * 100)}% من الحروف لاتينية داخل نص عربي. تحتاج مراجعة بشرية أو إدخالًا يدويًا قبل الاستشهاد.`
        : `طبقة النص تبدو مشوّهة: ${Math.round(arabicRatio * 100)}% من الحروف عربية داخل نص لاتيني. تحتاج مراجعة بشرية أو إدخالًا يدويًا قبل الاستشهاد.`,
      metrics,
    };
  }
  // Long text built from very few distinct characters is a repeated stamp or
  // watermark, not prose. Short headings legitimately have few distinct letters.
  if (chars >= 60 && distinctChars < 12) {
    return {
      quality: 'suspect',
      note: 'تنوّع الحروف منخفض جدًا مع طول النص، وهو نمط نص مكرر أو علامة مائية. تحتاج مراجعة بشرية.',
      metrics,
    };
  }
  return { quality: 'good', note: 'نص مقروء.', metrics };
}

export interface DocumentQualitySummary {
  status: 'extracted' | 'partial' | 'needs_review' | 'needs_ocr';
  note: string;
  goodPages: number;
  suspectPages: number;
  nonePages: number;
}

export function summarizeDocument(verdicts: QualityVerdict[]): DocumentQualitySummary {
  const goodPages = verdicts.filter((v) => v.quality === 'good').length;
  const suspectPages = verdicts.filter((v) => v.quality === 'suspect').length;
  const nonePages = verdicts.filter((v) => v.quality === 'none').length;
  const total = verdicts.length;

  if (total === 0) {
    return { status: 'needs_ocr', note: 'لم يُستخرج أي مقطع من الملف.', goodPages, suspectPages, nonePages };
  }
  if (nonePages === total) {
    return {
      status: 'needs_ocr',
      note: `لا يحتوي الملف نصًا قابلًا للاستخراج (${total} صفحة/مقطع). يُرجَّح أنه ممسوح ضوئيًا؛ يحتاج OCR أو إدخالًا يدويًا. لم تُرسل أي بيانات إلى خدمة خارجية.`,
      goodPages,
      suspectPages,
      nonePages,
    };
  }
  if (goodPages === 0) {
    return {
      status: 'needs_review',
      note: `النص المستخرج غير موثوق: ${suspectPages} مقطعًا مشوّهًا و${nonePages} بلا نص، ولا يوجد مقطع مقروء. يحتاج مراجعة بشرية أو إدخالًا يدويًا قبل أي استشهاد.`,
      goodPages,
      suspectPages,
      nonePages,
    };
  }
  if (suspectPages + nonePages > 0) {
    return {
      status: 'partial',
      note: `${goodPages} مقطعًا مقروءًا، و${suspectPages} يحتاج مراجعة، و${nonePages} بلا نص (يحتاج OCR أو إدخالًا يدويًا).`,
      goodPages,
      suspectPages,
      nonePages,
    };
  }
  return { status: 'extracted', note: `تم استخراج ${goodPages} مقطعًا مقروءًا.`, goodPages, suspectPages, nonePages };
}
