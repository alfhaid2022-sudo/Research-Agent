import type { Database } from 'better-sqlite3';

export interface EffectiveSegment {
  id: string;
  sourceId: string;
  locator: string;
  page: number | null;
  /** The text that may be quoted: the approved correction when there is one. */
  text: string;
  origin: 'extracted' | 'correction';
  quality: string;
  /** False when the text was never confirmed readable by a human or by quality checks. */
  usableAsBasis: boolean;
  reason: string;
  correctionStatus: string;
}

interface SegmentRow {
  id: string;
  source_id: string;
  locator: string;
  page: number | null;
  text: string;
  quality: string;
  quality_note: string;
}

interface CorrectionRow {
  id: string;
  text: string;
  status: string;
  source_sha256: string;
  entered_by: string;
  reviewed_by: string;
}

/**
 * Decides what text may back a citation.
 *
 * Extracted text counts only when the quality check passed. Anything else needs a
 * human-entered correction that a reviewer approved, and that correction is bound
 * to the file digest it was written against — if the file is replaced, the
 * correction stops applying instead of silently following the new file.
 */
export function effectiveSegment(db: Database, segmentId: string): EffectiveSegment | null {
  const segment = db
    .prepare<[string], SegmentRow>(
      `SELECT id, source_id, locator, page, text, quality, quality_note FROM source_segments WHERE id = ?`,
    )
    .get(segmentId);
  if (!segment) return null;

  const sourceSha =
    db.prepare<[string], { sha256: string }>(`SELECT sha256 FROM sources WHERE id = ?`).get(segment.source_id)?.sha256 ?? '';

  const correction = db
    .prepare<[string], CorrectionRow>(
      `SELECT id, text, status, source_sha256, entered_by, reviewed_by FROM segment_corrections
        WHERE segment_id = ? ORDER BY entered_at DESC LIMIT 1`,
    )
    .get(segmentId);

  const base = {
    id: segment.id,
    sourceId: segment.source_id,
    locator: segment.locator,
    page: segment.page,
    quality: segment.quality,
    correctionStatus: correction?.status ?? 'none',
  };

  if (correction && correction.status === 'approved') {
    if (correction.source_sha256 !== sourceSha) {
      return {
        ...base,
        text: segment.text,
        origin: 'extracted',
        usableAsBasis: false,
        reason:
          'النص اليدوي المعتمد مرتبط ببصمة ملف مختلفة عن الملف الحالي؛ يجب إعادة مراجعته بعد استبدال الملف.',
      };
    }
    return {
      ...base,
      text: correction.text,
      origin: 'correction',
      usableAsBasis: true,
      reason: 'نص مُدخَل يدويًا ومعتمد من مراجع بشري.',
    };
  }

  if (segment.quality === 'good') {
    return {
      ...base,
      text: segment.text,
      origin: 'extracted',
      usableAsBasis: true,
      reason: 'نص مستخرج اجتاز فحص الجودة.',
    };
  }

  return {
    ...base,
    text: segment.text,
    origin: 'extracted',
    usableAsBasis: false,
    reason: correction
      ? `يوجد نص يدوي بحالة «${correction.status === 'entered' ? 'مُدخَل بانتظار المراجعة' : correction.status}» ولم يُعتمد بعد. ${segment.quality_note}`
      : `النص المستخرج غير صالح كسند: ${segment.quality_note}`,
  };
}

/** Segments that may currently back a citation in this source. */
export function usableSegments(db: Database, sourceId: string): EffectiveSegment[] {
  const ids = db
    .prepare<[string], { id: string }>(`SELECT id FROM source_segments WHERE source_id = ? ORDER BY ordinal`)
    .all(sourceId)
    .map((row) => row.id);
  return ids
    .map((id) => effectiveSegment(db, id))
    .filter((segment): segment is EffectiveSegment => segment !== null && segment.usableAsBasis);
}
