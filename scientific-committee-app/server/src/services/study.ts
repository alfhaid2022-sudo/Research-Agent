import type { Database } from 'better-sqlite3';
import { HttpError, audit, newId, nowIso, parseJson } from '../lib/util.js';
import { type RawFinding, type ValidatedFinding, type Verdict, normalizeVerdict, validateFindings } from './citations.js';
import { type SourceConflict, applicableRequirements, assessReadiness } from './readiness.js';
import { buildStudyInput, draftStudyWithModel } from './ai/study.js';

export interface StudyRow {
  id: string;
  request_id: string;
  version: number;
  status: string;
  mode: string;
  ready: number;
  readiness: string;
  conflicts: string;
  summary: string;
  memo: string;
  recommendation: string;
  completion_items: string;
  minute_draft: string;
  ai_meta: string;
  created_at: string;
  updated_at: string;
  finalized_at: string;
}

function getRequest(db: Database, requestId: string) {
  const row = db
    .prepare<[string], { id: string; scope: string; type_id: string | null; ref_no: string; title: string; track: string | null }>(
      // The track comes from the request type, so it can never drift from it.
      `SELECT r.id, r.scope, r.type_id, r.ref_no, r.title, t.track AS track
         FROM requests r LEFT JOIN request_types t ON t.id = r.type_id
        WHERE r.id = ?`,
    )
    .get(requestId);
  if (!row) throw new HttpError(404, 'الطلب غير موجود.');
  return { ...row, track: row.track ?? '' };
}

/** Opens a new study version for a request, pre-populated with the applicable approved requirements. */
export function createStudy(db: Database, requestId: string): StudyRow {
  const request = getRequest(db, requestId);
  const readiness = assessReadiness(db, {
    requestId,
    scope: request.scope,
    typeId: request.type_id,
    track: request.track,
  });

  const version =
    (db
      .prepare<[string], { v: number | null }>(`SELECT MAX(version) AS v FROM studies WHERE request_id = ?`)
      .get(requestId)?.v ?? 0) + 1;

  const id = newId('std');
  const at = nowIso();
  db.prepare(
    `INSERT INTO studies (id, request_id, version, status, mode, ready, readiness, conflicts,
                          summary, memo, recommendation, completion_items, minute_draft, ai_meta,
                          created_at, updated_at, finalized_at)
     VALUES (?, ?, ?, 'draft', 'manual', ?, ?, ?, '', '', '', ?, '', '{}', ?, ?, '')`,
  ).run(
    id,
    requestId,
    version,
    readiness.ready ? 1 : 0,
    JSON.stringify(readiness.items),
    JSON.stringify(readiness.conflicts),
    JSON.stringify(readiness.missingAttachments.map((m) => `مرفق مطلوب لم يُرفع: ${m}`)),
    at,
    at,
  );

  const requirements = applicableRequirements(db, {
    scope: request.scope,
    typeId: request.type_id,
    track: request.track,
  });
  const insertFinding = db.prepare(
    `INSERT INTO findings (id, study_id, ordinal, requirement_id, requirement_text, basis_source_id,
                           basis_segment_id, basis_locator, basis_quote, verdict, verdict_reason, origin)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'unverifiable', ?, 'manual')`,
  );
  requirements.forEach((req, index) => {
    const detail = db
      .prepare<[string], { segment_id: string | null; locator: string; quote: string }>(
        `SELECT segment_id, locator, quote FROM requirements WHERE id = ?`,
      )
      .get(req.id);
    insertFinding.run(
      newId('fnd'),
      id,
      index + 1,
      req.id,
      req.text,
      req.source_id,
      detail?.segment_id ?? null,
      detail?.locator ?? '',
      detail?.quote ?? '',
      'لم تُدرس بعد.',
    );
  });

  db.prepare(`UPDATE requests SET status = 'under_study', updated_at = ? WHERE id = ? AND status IN ('new','awaiting_completion')`).run(
    at,
    requestId,
  );
  audit('study.create', 'study', id, { requestId, version, ready: readiness.ready });
  return getStudy(db, id);
}

export function getStudy(db: Database, studyId: string): StudyRow {
  const row = db.prepare<[string], StudyRow>(`SELECT * FROM studies WHERE id = ?`).get(studyId);
  if (!row) throw new HttpError(404, 'الدراسة غير موجودة.');
  return row;
}

export function refreshReadiness(db: Database, studyId: string): StudyRow {
  const study = getStudy(db, studyId);
  const request = getRequest(db, study.request_id);
  const previous = parseJson<SourceConflict[]>(study.conflicts, []);
  const readiness = assessReadiness(db, {
    requestId: study.request_id,
    scope: request.scope,
    typeId: request.type_id,
    track: request.track,
    previousConflicts: previous,
  });
  db.prepare(`UPDATE studies SET ready = ?, readiness = ?, conflicts = ?, updated_at = ? WHERE id = ?`).run(
    readiness.ready ? 1 : 0,
    JSON.stringify(readiness.items),
    JSON.stringify(readiness.conflicts),
    nowIso(),
    studyId,
  );
  return getStudy(db, studyId);
}

export interface AiRunReport {
  acceptedCount: number;
  rejected: Array<{ reason: string; requirementId: string | null }>;
  issues: string[];
  ranAt: string;
  model: string;
}

/** Runs the model over the study, then writes only the findings that survived citation validation. */
export async function runAiAnalysis(db: Database, studyId: string, modelName: string): Promise<AiRunReport> {
  const study = getStudy(db, studyId);
  if (study.status === 'final') throw new HttpError(409, 'لا يمكن تعديل دراسة نهائية. افتح إصدارًا جديدًا.');
  const request = getRequest(db, study.request_id);

  const requirementIds = db
    .prepare<[string], { requirement_id: string | null }>(
      `SELECT requirement_id FROM findings WHERE study_id = ? ORDER BY ordinal`,
    )
    .all(studyId)
    .map((r) => r.requirement_id)
    .filter((id): id is string => Boolean(id));

  if (requirementIds.length === 0) {
    throw new HttpError(422, 'لا توجد متطلبات معتمدة في هذه الدراسة لتحليلها.');
  }

  const input = buildStudyInput(db, study.request_id, requirementIds);
  input.conflicts = parseJson<SourceConflict[]>(study.conflicts, []).map((c) => ({
    conflictKey: c.conflictKey,
    sides: c.sides.map((s) => ({ sourceTitle: s.sourceTitle, value: s.value, locator: s.locator })),
  }));

  const draft = await draftStudyWithModel(input);
  const outcome = validateFindings(db, {
    requestId: study.request_id,
    scope: request.scope,
    track: request.track,
    rawFindings: draft.findings,
  });

  applyValidatedFindings(db, studyId, outcome.accepted);

  const report: AiRunReport = {
    acceptedCount: outcome.accepted.length,
    rejected: outcome.rejected.map((r) => ({ reason: r.reason, requirementId: r.raw.requirementId ?? null })),
    issues: outcome.accepted.flatMap((f) => f.validation.issues),
    ranAt: nowIso(),
    model: modelName,
  };

  const existingCompletion = parseJson<string[]>(study.completion_items, []);
  const completionItems = [...new Set([...existingCompletion, ...draft.completionItems])];

  db.prepare(
    `UPDATE studies SET mode = 'ai', summary = ?, memo = ?, recommendation = ?, completion_items = ?,
                        minute_draft = ?, ai_meta = ?, updated_at = ? WHERE id = ?`,
  ).run(
    draft.summary,
    draft.memo,
    draft.recommendation,
    JSON.stringify(completionItems),
    draft.minuteDraft,
    JSON.stringify(report),
    nowIso(),
    studyId,
  );

  audit('study.ai_run', 'study', studyId, report);
  return report;
}

/** Overwrites AI-produced findings while preserving rows the reviewer already edited. */
export function applyValidatedFindings(db: Database, studyId: string, findings: ValidatedFinding[]): void {
  const existing = db
    .prepare<[string], { id: string; requirement_id: string | null; edited: number; ordinal: number }>(
      `SELECT id, requirement_id, edited, ordinal FROM findings WHERE study_id = ?`,
    )
    .all(studyId);
  const byRequirement = new Map(existing.filter((f) => f.requirement_id).map((f) => [f.requirement_id!, f]));
  let nextOrdinal = existing.reduce((max, f) => Math.max(max, f.ordinal), 0);

  const update = db.prepare(
    `UPDATE findings SET requirement_text = ?, basis_source_id = ?, basis_segment_id = ?, basis_locator = ?,
                         basis_quote = ?, evidence_attachment_id = ?, evidence_locator = ?, evidence_quote = ?,
                         verdict = ?, verdict_reason = ?, facts = ?, inference = ?, calculation = ?,
                         notes = ?, gap = ?, validation = ?, origin = 'ai'
      WHERE id = ?`,
  );
  const insert = db.prepare(
    `INSERT INTO findings (id, study_id, ordinal, requirement_id, requirement_text, basis_source_id,
                           basis_segment_id, basis_locator, basis_quote, evidence_attachment_id,
                           evidence_locator, evidence_quote, verdict, verdict_reason, facts, inference,
                           calculation, notes, gap, validation, origin, edited)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ai', 0)`,
  );

  for (const finding of findings) {
    const target = byRequirement.get(finding.requirementId);
    if (target && target.edited === 1) continue; // never silently overwrite a reviewer's edit
    const values = [
      finding.requirementText,
      finding.basisSourceId,
      finding.basisSegmentId,
      finding.basisLocator,
      finding.basisQuote,
      finding.evidenceAttachmentId,
      finding.evidenceLocator,
      finding.evidenceQuote,
      finding.verdict,
      finding.verdictReason,
      finding.facts,
      finding.inference,
      finding.calculation,
      finding.notes,
      finding.gap,
      JSON.stringify(finding.validation),
    ] as const;
    if (target) update.run(...values, target.id);
    else {
      nextOrdinal += 1;
      insert.run(newId('fnd'), studyId, nextOrdinal, finding.requirementId, ...values);
    }
  }
}

export interface FindingPatch {
  verdict?: string;
  verdictReason?: string;
  notes?: string;
  gap?: string;
  facts?: string;
  inference?: string;
  calculation?: string;
  evidenceLocator?: string;
}

const PATCH_COLUMNS: Record<keyof FindingPatch, string> = {
  verdict: 'verdict',
  verdictReason: 'verdict_reason',
  notes: 'notes',
  gap: 'gap',
  facts: 'facts',
  inference: 'inference',
  calculation: 'calculation',
  evidenceLocator: 'evidence_locator',
};

/** Every reviewer edit is written to the revision log with its reason and timestamp. */
export function updateFinding(
  db: Database,
  args: { studyId: string; findingId: string; patch: FindingPatch; reason: string; actor: string },
): void {
  const study = getStudy(db, args.studyId);
  if (study.status === 'final') throw new HttpError(409, 'الدراسة نهائية ولا تقبل التعديل. افتح إصدارًا جديدًا.');
  const current = db
    .prepare<[string, string], Record<string, string>>(`SELECT * FROM findings WHERE id = ? AND study_id = ?`)
    .get(args.findingId, args.studyId);
  if (!current) throw new HttpError(404, 'البند غير موجود في هذه الدراسة.');

  const at = nowIso();
  const logRevision = db.prepare(
    `INSERT INTO study_revisions (id, study_id, finding_id, field, old_value, new_value, reason, actor, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  let changed = false;
  for (const [key, column] of Object.entries(PATCH_COLUMNS) as Array<[keyof FindingPatch, string]>) {
    const incoming = args.patch[key];
    if (incoming === undefined) continue;
    const next = key === 'verdict' ? normalizeVerdict(incoming) : String(incoming);
    const previous = String(current[column] ?? '');
    if (next === previous) continue;
    db.prepare(`UPDATE findings SET ${column} = ?, edited = 1 WHERE id = ?`).run(next, args.findingId);
    logRevision.run(newId('rev'), args.studyId, args.findingId, column, previous, next, args.reason, args.actor, at);
    changed = true;
  }
  if (changed) {
    db.prepare(`UPDATE studies SET updated_at = ? WHERE id = ?`).run(at, args.studyId);
    audit('finding.update', 'finding', args.findingId, { studyId: args.studyId, reason: args.reason });
  }
}

export function resolveConflict(
  db: Database,
  args: { studyId: string; conflictKey: string; note: string; actor: string },
): StudyRow {
  const study = getStudy(db, args.studyId);
  const conflicts = parseJson<SourceConflict[]>(study.conflicts, []);
  const target = conflicts.find((c) => c.conflictKey === args.conflictKey);
  if (!target) throw new HttpError(404, 'التعارض غير موجود في هذه الدراسة.');
  if (args.note.trim().length < 10) {
    throw new HttpError(400, 'يجب تسجيل توجيه اللجنة الذي يحسم التعارض (10 أحرف على الأقل).');
  }
  target.resolutionNote = args.note.trim();
  target.resolved = true;
  const at = nowIso();
  db.prepare(`UPDATE studies SET conflicts = ?, updated_at = ? WHERE id = ?`).run(
    JSON.stringify(conflicts),
    at,
    args.studyId,
  );
  db.prepare(
    `INSERT INTO study_revisions (id, study_id, finding_id, field, old_value, new_value, reason, actor, created_at)
     VALUES (?, ?, NULL, 'conflict_resolution', '', ?, ?, ?, ?)`,
  ).run(newId('rev'), args.studyId, args.conflictKey, args.note.trim(), args.actor, at);
  audit('study.conflict_resolved', 'study', args.studyId, { conflictKey: args.conflictKey });
  return refreshReadiness(db, args.studyId);
}

/** A study becomes final only when every blocking readiness check passes. */
export function finalizeStudy(db: Database, studyId: string): StudyRow {
  const refreshed = refreshReadiness(db, studyId);
  if (refreshed.status === 'final') return refreshed;
  if (refreshed.ready !== 1) {
    const blocking = parseJson<Array<{ label: string; ok: boolean; blocking: boolean; detail: string }>>(
      refreshed.readiness,
      [],
    ).filter((item) => item.blocking && !item.ok);
    throw new HttpError(409, 'لا يمكن إصدار دراسة نهائية قبل اكتمال متطلبات الجاهزية.', {
      blocking: blocking.map((item) => `${item.label}: ${item.detail}`),
    });
  }
  const pending = db
    .prepare<[string], { c: number }>(
      `SELECT COUNT(*) AS c FROM findings WHERE study_id = ? AND verdict_reason = 'لم تُدرس بعد.'`,
    )
    .get(studyId)?.c ?? 0;
  if (pending > 0) {
    throw new HttpError(409, `ما زال ${pending} بندًا في المصفوفة دون دراسة. أكمل الدراسة أو علّل النتيجة.`);
  }

  const at = nowIso();
  db.prepare(`UPDATE studies SET status = 'final', finalized_at = ?, updated_at = ? WHERE id = ?`).run(at, at, studyId);
  db.prepare(`UPDATE requests SET status = 'studied', updated_at = ? WHERE id = ?`).run(at, refreshed.request_id);
  audit('study.finalize', 'study', studyId, {});
  return getStudy(db, studyId);
}

export const VERDICT_LABELS: Record<Verdict, string> = {
  met: 'مستوفى',
  not_met: 'غير مستوفى',
  unverifiable: 'غير قابل للتحقق',
  not_applicable: 'لا ينطبق',
};

export type { RawFinding };
