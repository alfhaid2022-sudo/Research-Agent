import type { Database } from 'better-sqlite3';
import { normalizeArabic, parseJson } from '../lib/util.js';
import { effectiveSegment } from './segments.js';

export type Verdict = 'met' | 'not_met' | 'unverifiable' | 'not_applicable';
export const VERDICTS: Verdict[] = ['met', 'not_met', 'unverifiable', 'not_applicable'];

export interface RawFinding {
  requirementId?: string | null;
  basisSegmentId?: string | null;
  basisQuote?: string | null;
  evidenceAttachmentId?: string | null;
  evidenceQuote?: string | null;
  verdict?: string | null;
  verdictReason?: string | null;
  facts?: string | null;
  inference?: string | null;
  calculation?: string | null;
  notes?: string | null;
  gap?: string | null;
}

export interface ValidatedFinding {
  requirementId: string;
  requirementText: string;
  basisSourceId: string;
  basisSegmentId: string | null;
  basisLocator: string;
  basisQuote: string;
  evidenceAttachmentId: string | null;
  evidenceLocator: string;
  evidenceQuote: string;
  verdict: Verdict;
  verdictReason: string;
  facts: string;
  inference: string;
  calculation: string;
  notes: string;
  gap: string;
  validation: {
    basisVerified: boolean;
    evidenceVerified: boolean;
    basisOrigin?: 'extracted' | 'correction';
    issues: string[];
    downgradedFrom?: Verdict;
  };
}

export interface RejectedFinding {
  raw: RawFinding;
  reason: string;
}

export interface ValidationOutcome {
  accepted: ValidatedFinding[];
  rejected: RejectedFinding[];
}

interface RequirementRow {
  id: string;
  source_id: string;
  segment_id: string | null;
  scope: string;
  status: string;
  text: string;
  quote: string;
  locator: string;
  tracks: string;
}

/**
 * Verifies every model-produced citation against the database before anything is
 * shown to the user. A finding whose requirement does not exist is dropped, and a
 * finding whose quote cannot be located in the cited text loses its citation and is
 * downgraded to "غير قابل للتحقق". Nothing unverified is ever presented as evidence.
 */
export function validateFindings(
  db: Database,
  args: { requestId: string; scope: string; track?: string; rawFindings: RawFinding[] },
): ValidationOutcome {
  const accepted: ValidatedFinding[] = [];
  const rejected: RejectedFinding[] = [];
  const seen = new Set<string>();

  const getRequirement = db.prepare<[string], RequirementRow>(
    `SELECT id, source_id, segment_id, scope, status, text, quote, locator, tracks FROM requirements WHERE id = ?`,
  );
  const getAttachment = db.prepare<[string], { id: string; request_id: string; file_name: string }>(
    `SELECT id, request_id, file_name FROM attachments WHERE id = ?`,
  );
  const getAttachmentSegments = db.prepare<[string], { locator: string; text: string }>(
    `SELECT locator, text FROM attachment_segments WHERE attachment_id = ? ORDER BY ordinal`,
  );

  for (const raw of rawFindings(args.rawFindings)) {
    const issues: string[] = [];
    const requirementId = (raw.requirementId ?? '').trim();
    if (!requirementId) {
      rejected.push({ raw, reason: 'بند بلا معرف متطلب — لا يمكن ربطه بسند نظامي.' });
      continue;
    }
    const requirement = getRequirement.get(requirementId);
    if (!requirement) {
      rejected.push({ raw, reason: `معرف متطلب غير موجود (${requirementId}) — استشهاد مرفوض.` });
      continue;
    }
    if (requirement.status !== 'approved') {
      rejected.push({ raw, reason: `المتطلب (${requirementId}) غير معتمد من المراجع البشري.` });
      continue;
    }
    if (requirement.scope !== args.scope) {
      rejected.push({
        raw,
        reason: `المتطلب (${requirementId}) يتبع نطاقًا مختلفًا (${requirement.scope}) — لا يجوز الخلط بين البيانات الفعلية وبيانات العرض التجريبي.`,
      });
      continue;
    }
    const requirementTracks = parseJson<string[]>(requirement.tracks, []);
    if (requirementTracks.length === 0) {
      rejected.push({
        raw,
        reason: `المتطلب (${requirementId}) بلا مسار محدد — لا يجوز تطبيقه على أي طلب قبل تحديد مساره.`,
      });
      continue;
    }
    if (args.track !== undefined && !requirementTracks.includes(args.track)) {
      rejected.push({
        raw,
        reason: `المتطلب (${requirementId}) يتبع مسارًا آخر (${requirementTracks.join('، ')}) ولا يُطبَّق على مسار هذا الطلب (${args.track || 'غير محدد'}).`,
      });
      continue;
    }
    if (seen.has(requirementId)) {
      rejected.push({ raw, reason: `تكرار للمتطلب (${requirementId}) في المصفوفة.` });
      continue;
    }
    seen.add(requirementId);

    // --- legal basis -------------------------------------------------------
    let basisSegmentId: string | null = null;
    let basisLocator = requirement.locator;
    let basisQuote = '';
    let basisVerified = false;

    const candidateSegmentId = (raw.basisSegmentId ?? requirement.segment_id ?? '').trim();
    const segment = candidateSegmentId ? effectiveSegment(db, candidateSegmentId) : null;
    let basisOrigin: 'extracted' | 'correction' | undefined;
    if (!segment) {
      if (candidateSegmentId) issues.push(`مقطع المصدر المستشهد به (${candidateSegmentId}) غير موجود.`);
      else issues.push('لم يُحدَّد مقطع المصدر للسند النظامي.');
    } else if (segment.sourceId !== requirement.source_id) {
      issues.push('مقطع المصدر المستشهد به لا يعود إلى مصدر المتطلب.');
    } else if (!segment.usableAsBasis) {
      // Unreadable or unreviewed text can never become a verified basis.
      basisSegmentId = segment.id;
      basisLocator = segment.locator;
      issues.push(`نص المقطع غير صالح كسند متحقق: ${segment.reason}`);
    } else {
      basisSegmentId = segment.id;
      basisLocator = segment.locator;
      basisOrigin = segment.origin;
      const quote = (raw.basisQuote ?? requirement.quote ?? '').trim();
      if (quote.length === 0) {
        issues.push('لا يوجد اقتباس حرفي من نص اللائحة.');
      } else if (quoteFoundIn(segment.text, quote)) {
        basisQuote = quote;
        basisVerified = true;
      } else {
        issues.push('الاقتباس المنسوب إلى اللائحة غير موجود في نص المقطع — تم حذفه.');
      }
    }

    // --- request evidence --------------------------------------------------
    let evidenceAttachmentId: string | null = null;
    let evidenceLocator = '';
    let evidenceQuote = '';
    let evidenceVerified = false;

    const attachmentId = (raw.evidenceAttachmentId ?? '').trim();
    if (attachmentId) {
      const attachment = getAttachment.get(attachmentId);
      if (!attachment) {
        issues.push(`المرفق المستشهد به (${attachmentId}) غير موجود.`);
      } else if (attachment.request_id !== args.requestId) {
        issues.push('المرفق المستشهد به لا يعود إلى هذا الطلب.');
      } else {
        evidenceAttachmentId = attachment.id;
        const quote = (raw.evidenceQuote ?? '').trim();
        if (quote.length === 0) {
          issues.push('لا يوجد اقتباس من المرفق يثبت الدليل.');
        } else {
          const hit = getAttachmentSegments.all(attachment.id).find((s) => quoteFoundIn(s.text, quote));
          if (hit) {
            evidenceQuote = quote;
            evidenceLocator = hit.locator;
            evidenceVerified = true;
          } else {
            issues.push('الاقتباس المنسوب إلى المرفق غير موجود في النص المستخرج منه — تم حذفه.');
          }
        }
      }
    }

    // --- verdict discipline ------------------------------------------------
    let verdict = normalizeVerdict(raw.verdict);
    let verdictReason = (raw.verdictReason ?? '').trim();
    let downgradedFrom: Verdict | undefined;

    if (!basisVerified && verdict !== 'not_applicable') {
      downgradedFrom = verdict;
      verdict = 'unverifiable';
      verdictReason = appendReason(verdictReason, 'تعذّر التحقق من السند النظامي الحرفي لهذا المتطلب.');
    }
    if ((verdict === 'met' || verdict === 'not_met') && !evidenceVerified) {
      downgradedFrom = downgradedFrom ?? verdict;
      verdict = 'unverifiable';
      verdictReason = appendReason(
        verdictReason,
        'لا يوجد دليل قابل للتحقق في مرفقات الطلب. نقص الدليل لا يعني عدم الاستيفاء.',
      );
    }
    if (verdict === 'not_applicable' && verdictReason.length === 0) {
      verdictReason = 'لم يُذكر سبب عدم الانطباق.';
    }

    accepted.push({
      requirementId,
      requirementText: requirement.text,
      basisSourceId: requirement.source_id,
      basisSegmentId,
      basisLocator,
      basisQuote,
      evidenceAttachmentId,
      evidenceLocator,
      evidenceQuote,
      verdict,
      verdictReason,
      facts: (raw.facts ?? '').trim(),
      inference: (raw.inference ?? '').trim(),
      calculation: (raw.calculation ?? '').trim(),
      notes: (raw.notes ?? '').trim(),
      gap: (raw.gap ?? '').trim(),
      validation: {
        basisVerified,
        evidenceVerified,
        issues,
        ...(basisOrigin ? { basisOrigin } : {}),
        ...(downgradedFrom ? { downgradedFrom } : {}),
      },
    });
  }

  return { accepted, rejected };
}

function rawFindings(list: RawFinding[] | undefined): RawFinding[] {
  return Array.isArray(list) ? list : [];
}

export function normalizeVerdict(value: unknown): Verdict {
  const v = String(value ?? '').trim();
  return (VERDICTS as string[]).includes(v) ? (v as Verdict) : 'unverifiable';
}

function appendReason(existing: string, added: string): string {
  return existing.length > 0 ? `${existing} — ${added}` : added;
}

/** A quote counts as verified only if it really occurs in the stored text. */
export function quoteFoundIn(haystack: string, quote: string): boolean {
  const normalizedQuote = normalizeArabic(quote);
  if (normalizedQuote.length < 8) return false;
  return normalizeArabic(haystack).includes(normalizedQuote);
}
