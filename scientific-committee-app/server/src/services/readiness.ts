import type { Database } from 'better-sqlite3';
import { aiConfigured } from '../config.js';
import { parseJson } from '../lib/util.js';
import { effectiveSegment } from './segments.js';

export interface ReadinessItem {
  key: string;
  label: string;
  ok: boolean;
  blocking: boolean;
  detail: string;
}

export interface SourceConflict {
  conflictKey: string;
  sides: Array<{
    requirementId: string;
    sourceId: string;
    sourceTitle: string;
    sourceVersion: string;
    effectiveDate: string;
    locator: string;
    value: string;
    text: string;
  }>;
  resolutionNote: string;
  resolved: boolean;
}

interface RequirementRow {
  id: string;
  source_id: string;
  segment_id: string | null;
  text: string;
  locator: string;
  conflict_key: string;
  conflict_value: string;
  applies_to: string;
  tracks: string;
}

/**
 * Approved requirements that apply to one request.
 *
 * A requirement applies only inside its own track: conference rules are never
 * pulled onto an excellence-award request, and a requirement with no declared
 * track applies to nothing until its track is set.
 */
export function applicableRequirements(
  db: Database,
  args: { scope: string; typeId: string | null; track?: string },
): RequirementRow[] {
  const rows = db
    .prepare<[string], RequirementRow>(
      `SELECT id, source_id, segment_id, text, locator, conflict_key, conflict_value, applies_to, tracks
         FROM requirements
        WHERE scope = ? AND status = 'approved'
        ORDER BY created_at`,
    )
    .all(args.scope);
  return rows.filter((row) => {
    const tracks = parseJson<string[]>(row.tracks, []);
    if (tracks.length === 0) return false;
    if (args.track === undefined || args.track === '') return false;
    if (!tracks.includes(args.track)) return false;
    const appliesTo = parseJson<string[]>(row.applies_to, []);
    if (appliesTo.length === 0) return true;
    return args.typeId !== null && appliesTo.includes(args.typeId);
  });
}

/** Requirements whose cited text is not yet a verified basis (bad OCR, unreviewed manual text). */
export function requirementsWithoutUsableBasis(db: Database, requirements: RequirementRow[]) {
  return requirements
    .map((requirement) => {
      const segment = requirement.segment_id ? effectiveSegment(db, requirement.segment_id) : null;
      if (segment && segment.usableAsBasis) return null;
      return {
        requirementId: requirement.id,
        text: requirement.text,
        reason: segment ? segment.reason : 'لا يوجد مقطع مصدر مرتبط بهذا المتطلب.',
      };
    })
    .filter((item): item is { requirementId: string; text: string; reason: string } => item !== null);
}

/**
 * Detects requirements that share a conflict key but carry different values from
 * different sources. The app surfaces the conflict; it never picks a winner.
 */
export function detectConflicts(
  db: Database,
  requirements: RequirementRow[],
  previous: SourceConflict[] = [],
): SourceConflict[] {
  const groups = new Map<string, RequirementRow[]>();
  for (const req of requirements) {
    const key = req.conflict_key.trim();
    if (!key) continue;
    const list = groups.get(key) ?? [];
    list.push(req);
    groups.set(key, list);
  }

  const getSource = db.prepare<[string], { id: string; title: string; version: string; effective_date: string }>(
    `SELECT id, title, version, effective_date FROM sources WHERE id = ?`,
  );

  const conflicts: SourceConflict[] = [];
  for (const [key, list] of groups) {
    const distinctValues = new Set(list.map((r) => r.conflict_value.trim()).filter((v) => v.length > 0));
    const distinctSources = new Set(list.map((r) => r.source_id));
    if (distinctValues.size < 2 || distinctSources.size < 2) continue;
    const prior = previous.find((c) => c.conflictKey === key);
    conflicts.push({
      conflictKey: key,
      sides: list.map((req) => {
        const source = getSource.get(req.source_id);
        return {
          requirementId: req.id,
          sourceId: req.source_id,
          sourceTitle: source?.title ?? '(مصدر محذوف)',
          sourceVersion: source?.version ?? '',
          effectiveDate: source?.effective_date ?? '',
          locator: req.locator,
          value: req.conflict_value,
          text: req.text,
        };
      }),
      resolutionNote: prior?.resolutionNote ?? '',
      resolved: prior?.resolved ?? false,
    });
  }
  return conflicts;
}

export interface ReadinessResult {
  items: ReadinessItem[];
  ready: boolean;
  conflicts: SourceConflict[];
  requirementCount: number;
  missingAttachments: string[];
  unusableBasis: Array<{ requirementId: string; text: string; reason: string }>;
  unresolvedRelations: Array<{ id: string; kind: string; subject: string; fromTitle: string; toTitle: string }>;
}

export function assessReadiness(
  db: Database,
  args: {
    requestId: string;
    scope: string;
    typeId: string | null;
    track?: string;
    previousConflicts?: SourceConflict[];
  },
): ReadinessResult {
  const items: ReadinessItem[] = [];
  const track = args.track ?? '';

  items.push({
    key: 'track',
    label: 'مسار الطلب',
    ok: track !== '',
    blocking: true,
    detail:
      track !== ''
        ? `الطلب يتبع مسارًا محددًا، ولا تُطبَّق عليه إلا متطلبات هذا المسار.`
        : 'لم يُحدَّد مسار الطلب (مؤتمر/ندوة أم مكافأة تميز أم مسار آخر)، فلا يمكن تحديد المتطلبات المنطبقة.',
  });

  const templateCount = db
    .prepare<[string], { c: number }>(
      `SELECT COUNT(*) AS c FROM sources WHERE scope = ? AND is_official_template = 1`,
    )
    .get(args.scope)?.c ?? 0;
  items.push({
    key: 'official_template',
    label: 'النموذج الرسمي',
    ok: templateCount > 0,
    blocking: true,
    detail:
      templateCount > 0
        ? 'النموذج الرسمي مسجَّل في مكتبة النماذج.'
        : 'النموذج الرسمي لم يضف بعد. أي نموذج مستخدم الآن هو مسودة داخلية لا تمثل النموذج المعتمد.',
  });

  const regulationCount = db
    .prepare<[string, string, string], { c: number }>(
      `SELECT COUNT(*) AS c FROM sources
        WHERE scope = ? AND is_official_template = 0
          AND extraction_status IN ('extracted','partial')
          AND (track = '' OR track = ? OR ? = '')`,
    )
    .get(args.scope, track, track)?.c ?? 0;
  items.push({
    key: 'regulations',
    label: 'اللوائح المفهرسة',
    ok: regulationCount > 0,
    blocking: true,
    detail:
      regulationCount > 0
        ? `${regulationCount} مصدرًا نظاميًا في هذا المسار نصّه مقروء جزئيًا أو كليًا.`
        : 'لا توجد لائحة في مسار هذا الطلب بنص مقروء. ارفع اللائحة، أو أدخل نص صفحاتها يدويًا واعتمده.',
  });

  const requirements = applicableRequirements(db, { scope: args.scope, typeId: args.typeId, track });
  items.push({
    key: 'approved_requirements',
    label: 'المتطلبات المعتمدة',
    ok: requirements.length > 0,
    blocking: true,
    detail:
      requirements.length > 0
        ? `${requirements.length} متطلبًا معتمدًا ينطبق على هذا النوع من الطلبات داخل مساره.`
        : 'لا توجد متطلبات معتمدة بشريًا تنطبق على مسار هذا الطلب. راجع المتطلبات المرشحة واعتمدها وحدّد مسارها.',
  });

  // Requirements whose source text was never confirmed readable cannot back a verdict.
  const unusableBasis = requirementsWithoutUsableBasis(db, requirements);
  items.push({
    key: 'verified_basis',
    label: 'سند نصي متحقق',
    ok: requirements.length > 0 && unusableBasis.length === 0,
    blocking: true,
    detail:
      requirements.length === 0
        ? 'لا توجد متطلبات لفحص سندها النصي.'
        : unusableBasis.length === 0
          ? 'كل متطلب معتمد مرتبط بنص مصدر متحقق (مستخرج بجودة مقبولة أو نص يدوي معتمد).'
          : `${unusableBasis.length} متطلبًا بلا سند نصي متحقق (نص ممسوح أو مشوّه أو نص يدوي لم يُعتمد بعد).`,
  });

  const unresolvedRelationRows = db
    .prepare<[string, string, string], { id: string; kind: string; subject: string; from_title: string; to_title: string }>(
      `SELECT r.id, r.kind, r.subject, f.title AS from_title, t.title AS to_title
         FROM source_relations r
         JOIN sources f ON f.id = r.from_source_id
         JOIN sources t ON t.id = r.to_source_id
        WHERE r.scope = ? AND r.status = 'unresolved' AND (r.track = '' OR r.track = ? OR ? = '')`,
    )
    .all(args.scope, track, track);
  const unresolvedRelations = unresolvedRelationRows.map((row) => ({
    id: row.id,
    kind: row.kind,
    subject: row.subject,
    fromTitle: row.from_title,
    toTitle: row.to_title,
  }));
  items.push({
    key: 'source_relations',
    label: 'علاقات التعديل والاستبدال',
    ok: unresolvedRelations.length === 0,
    blocking: true,
    detail:
      unresolvedRelations.length === 0
        ? 'لا توجد علاقة تعديل أو استبدال غير محسومة بين مصادر هذا المسار.'
        : `${unresolvedRelations.length} علاقة بين مصدرين (تعديل/استبدال/تفسير) لم تُحسم مراجعتها، ولا يجوز إصدار نتيجة حاسمة قبل حسمها.`,
  });

  items.push({
    key: 'request_type',
    label: 'نوع الطلب',
    ok: args.typeId !== null && args.typeId !== '',
    blocking: true,
    detail: args.typeId ? 'نوع الطلب محدد.' : 'لم يُحدَّد نوع الطلب، فلا يمكن تحديد المتطلبات المنطبقة.',
  });

  const readableAttachments = db
    .prepare<[string], { c: number }>(
      `SELECT COUNT(*) AS c FROM attachments
        WHERE request_id = ? AND extraction_status IN ('extracted','partial')`,
    )
    .get(args.requestId)?.c ?? 0;
  items.push({
    key: 'attachments',
    label: 'مرفقات مقروءة',
    ok: readableAttachments > 0,
    blocking: true,
    detail:
      readableAttachments > 0
        ? `${readableAttachments} مرفقًا نصّه مقروء وقابل للاستشهاد.`
        : 'لا يوجد مرفق بنص مقروء. لا يمكن إسناد أي نتيجة إلى دليل من الطلب.',
  });

  const conflicts = detectConflicts(db, requirements, args.previousConflicts ?? []);
  const unresolved = conflicts.filter((c) => !c.resolved);
  items.push({
    key: 'conflicts',
    label: 'تعارض المصادر',
    ok: unresolved.length === 0,
    blocking: true,
    detail:
      unresolved.length === 0
        ? 'لا يوجد تعارض غير محسوم بين المصادر المعتمدة.'
        : `${unresolved.length} تعارضًا بين مصدرين أو أكثر يحتاج توجيهًا من اللجنة قبل إصدار نتيجة حاسمة.`,
  });

  items.push({
    key: 'ai',
    label: 'التحليل الآلي',
    ok: aiConfigured(),
    blocking: false,
    detail: aiConfigured()
      ? 'خدمة التحليل الآلي مُعدّة من جهة الخادم.'
      : 'التحليل الآلي غير مفعّل (لا يوجد مفتاح في بيئة الخادم). يمكن إدارة الملفات والدراسة يدويًا.',
  });

  const request = db
    .prepare<[string], { type_id: string | null }>(`SELECT type_id FROM requests WHERE id = ?`)
    .get(args.requestId);
  const checklist = request?.type_id
    ? parseJson<string[]>(
        db.prepare<[string], { checklist: string }>(`SELECT checklist FROM request_types WHERE id = ?`).get(request.type_id)
          ?.checklist,
        [],
      )
    : [];
  const labels = db
    .prepare<[string], { label: string }>(`SELECT label FROM attachments WHERE request_id = ?`)
    .all(args.requestId)
    .map((r) => r.label.trim())
    .filter((l) => l.length > 0);
  const missingAttachments = checklist.filter((item) => !labels.includes(item));

  return {
    items,
    ready: items.every((item) => !item.blocking || item.ok),
    conflicts,
    requirementCount: requirements.length,
    missingAttachments,
    unusableBasis,
    unresolvedRelations,
  };
}
