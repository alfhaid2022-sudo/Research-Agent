import type { Database } from 'better-sqlite3';
import { HttpError, newId, nowIso } from '../../lib/util.js';
import { quoteFoundIn } from '../citations.js';
import { usableSegments } from '../segments.js';
import { DATA_NOT_INSTRUCTIONS_RULE, asUntrustedData, callModel, parseModelJson } from './provider.js';

const SYSTEM = `
أنت مساعد فهرسة أنظمة ولوائح. مهمتك استخراج متطلبات مرشحة من نص لائحة مُعطى فقط.
قواعد ملزمة:
- لا تخترع قاعدة أو استثناء أو تاريخ نفاذ أو رقم مادة غير موجود في النص المعطى.
- كل متطلب يجب أن يستند إلى اقتباس حرفي منسوخ نسخًا تامًا من مقطع واحد من النص المعطى.
- إذا لم يتضمن المقطع متطلبًا واضحًا فلا تُخرج شيئًا عنه.
- المخرجات مرشحة للمراجعة البشرية، وليست معتمدة.
${DATA_NOT_INSTRUCTIONS_RULE}
- لا تستنتج مسار المتطلب ولا تاريخ تطبيقه؛ يُحدَّدان من بيانات المصدر ومن المراجع البشري.
أخرج JSON فقط بالشكل:
{"requirements":[{"segmentId":"...","text":"صياغة المتطلب بالعربية","quote":"اقتباس حرفي من المقطع","category":"تصنيف مختصر","clause":"رقم البند/الفقرة كما ورد في النص أو فراغ","conflictKey":"مفتاح موضوعي موحّد أو فراغ","conflictValue":"القيمة المحددة (مثل عدد الأيام) أو فراغ"}]}
`.trim();

export interface ExtractedRequirementCandidate {
  id: string;
  text: string;
  quote: string;
  segmentId: string;
  locator: string;
  category: string;
  conflictKey: string;
  conflictValue: string;
}

export interface RequirementExtractionReport {
  created: number;
  rejected: Array<{ reason: string; text: string }>;
  segmentsSent: number;
}

interface ModelRequirement {
  segmentId?: string;
  text?: string;
  quote?: string;
  category?: string;
  clause?: string;
  conflictKey?: string;
  conflictValue?: string;
}

/**
 * Asks the model for candidate requirements, then keeps only those whose quote is
 * genuinely present in the cited segment. Candidates are stored unapproved.
 */
export async function extractRequirementsForSource(
  db: Database,
  sourceId: string,
): Promise<RequirementExtractionReport> {
  const source = db
    .prepare<[string], { id: string; title: string; scope: string; version: string; issuer: string; track: string }>(
      `SELECT id, title, scope, version, issuer, track FROM sources WHERE id = ?`,
    )
    .get(sourceId);
  if (!source) throw new HttpError(404, 'المصدر غير موجود.');

  // Only text that may serve as a basis is sent: good extraction, or approved manual text.
  const segments = usableSegments(db, sourceId).filter((segment) => segment.text.trim().length > 40);

  if (segments.length === 0) {
    throw new HttpError(
      422,
      'لا توجد مقاطع نصية صالحة كسند في هذا المصدر. الملف يحتاج OCR أو إدخال نص صفحاته يدويًا واعتماده قبل الاستخراج.',
    );
  }

  const body = segments
    .map((segment) => `#segmentId: ${segment.id}\n#الموضع: ${segment.locator}\n${segment.text}`)
    .join('\n\n---\n\n');

  const reply = await callModel({
    system: SYSTEM,
    user: [
      `المصدر: ${source.title}${source.version ? ` — إصدار ${source.version}` : ''}${source.issuer ? ` — الجهة: ${source.issuer}` : ''}`,
      'استخرج المتطلبات المرشحة من المقاطع التالية:',
      asUntrustedData(source.title, body),
    ].join('\n\n'),
  });

  const parsed = parseModelJson<{ requirements?: ModelRequirement[] }>(reply);
  const candidates = Array.isArray(parsed.requirements) ? parsed.requirements : [];

  const segmentById = new Map(segments.map((s) => [s.id, s]));
  const rejected: Array<{ reason: string; text: string }> = [];
  const insert = db.prepare(
    `INSERT INTO requirements
       (id, source_id, segment_id, scope, text, quote, locator, category, conflict_key, conflict_value,
        applies_to, tracks, page, clause, status, origin, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', ?, ?, ?, 'candidate', 'ai', ?, ?)`,
  );

  let created = 0;
  const at = nowIso();
  for (const candidate of candidates) {
    const text = (candidate.text ?? '').trim();
    const quote = (candidate.quote ?? '').trim();
    const segment = segmentById.get((candidate.segmentId ?? '').trim());
    if (text.length < 5) {
      rejected.push({ reason: 'نص المتطلب فارغ أو أقصر من أن يكون متطلبًا.', text });
      continue;
    }
    if (!segment) {
      rejected.push({ reason: 'المقطع المستشهد به غير موجود في هذا المصدر — استشهاد مرفوض.', text });
      continue;
    }
    if (!quoteFoundIn(segment.text, quote)) {
      rejected.push({ reason: 'الاقتباس غير موجود حرفيًا في نص المقطع — استشهاد مرفوض.', text });
      continue;
    }
    insert.run(
      newId('req'),
      sourceId,
      segment.id,
      source.scope,
      text,
      quote,
      segment.locator,
      (candidate.category ?? '').trim(),
      (candidate.conflictKey ?? '').trim(),
      (candidate.conflictValue ?? '').trim(),
      // The track is inherited from the source and never guessed by the model.
      JSON.stringify(source.track ? [source.track] : []),
      segment.page,
      (candidate.clause ?? '').trim(),
      at,
      at,
    );
    created += 1;
  }

  return { created, rejected, segmentsSent: segments.length };
}
