import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../db.js';
import { asyncHandler, param, parseBody, scopeOf } from '../lib/http.js';
import { HttpError, audit, newId, nowIso } from '../lib/util.js';
import { effectiveSegment } from '../services/segments.js';

export const intakeRouter = Router();

// ---------------------------------------------------------------- tracks ---

intakeRouter.get(
  '/tracks',
  asyncHandler(async (req, res) => {
    const rows = getDb()
      .prepare<[string], { slug: string; name: string; description: string; builtin: number }>(
        `SELECT slug, name, description, builtin FROM tracks WHERE scope = ? ORDER BY builtin DESC, created_at`,
      )
      .all(scopeOf(req));
    res.json({
      tracks: rows.map((row) => ({
        slug: row.slug,
        name: row.name,
        description: row.description,
        builtin: row.builtin === 1,
      })),
    });
  }),
);

intakeRouter.post(
  '/tracks',
  asyncHandler(async (req, res) => {
    const body = parseBody(
      z.object({
        slug: z.string().min(2).max(60).regex(/^[a-z0-9_-]+$/, 'المعرّف بأحرف لاتينية صغيرة وأرقام وشرطات فقط'),
        name: z.string().min(2).max(150),
        description: z.string().max(600).default(''),
        scope: z.enum(['real', 'demo']).default('real'),
      }),
      req.body,
    );
    const db = getDb();
    const exists = db
      .prepare<[string, string], { slug: string }>(`SELECT slug FROM tracks WHERE scope = ? AND slug = ?`)
      .get(body.scope, body.slug);
    if (exists) throw new HttpError(409, 'المسار موجود بالفعل.');
    db.prepare(
      `INSERT INTO tracks (slug, scope, name, description, builtin, created_at) VALUES (?, ?, ?, ?, 0, ?)`,
    ).run(body.slug, body.scope, body.name, body.description, nowIso());
    audit('track.create', 'track', body.slug, body.name);
    res.status(201).json({ slug: body.slug });
  }),
);

intakeRouter.delete(
  '/tracks/:slug',
  asyncHandler(async (req, res) => {
    const db = getDb();
    const slug = param(req, 'slug');
    const scope = scopeOf(req);
    const track = db
      .prepare<[string, string], { builtin: number }>(`SELECT builtin FROM tracks WHERE scope = ? AND slug = ?`)
      .get(scope, slug);
    if (!track) throw new HttpError(404, 'المسار غير موجود.');
    if (track.builtin === 1) throw new HttpError(409, 'لا يمكن حذف مسار مدمج.');
    const used = db
      .prepare<[string, string], { c: number }>(`SELECT COUNT(*) AS c FROM request_types WHERE scope = ? AND track = ?`)
      .get(scope, slug)?.c ?? 0;
    if (used > 0) throw new HttpError(409, `المسار مستخدم في ${used} نوع طلب.`);
    db.prepare(`DELETE FROM tracks WHERE scope = ? AND slug = ?`).run(scope, slug);
    res.json({ ok: true });
  }),
);

// ----------------------------------------------------- manual page text ---

intakeRouter.get(
  '/segments/:id/corrections',
  asyncHandler(async (req, res) => {
    const db = getDb();
    const segmentId = param(req, 'id');
    const rows = db
      .prepare<[string], Record<string, unknown>>(
        `SELECT id, text, entered_by, entered_at, status, reviewed_by, reviewed_at, review_note, source_sha256, page
           FROM segment_corrections WHERE segment_id = ? ORDER BY entered_at DESC`,
      )
      .all(segmentId);
    res.json({
      effective: effectiveSegment(db, segmentId),
      corrections: rows.map((row) => ({
        id: row.id as string,
        text: row.text as string,
        enteredBy: row.entered_by as string,
        enteredAt: row.entered_at as string,
        status: row.status as string,
        reviewedBy: row.reviewed_by as string,
        reviewedAt: row.reviewed_at as string,
        reviewNote: row.review_note as string,
        sourceSha256: row.source_sha256 as string,
        page: (row.page as number | null) ?? null,
      })),
    });
  }),
);

/**
 * Records page text typed or corrected by a human. It is bound to the page and to
 * the current file digest, and it does not become a valid basis until a reviewer
 * approves it. Nothing is sent to any external OCR service.
 */
intakeRouter.post(
  '/segments/:id/corrections',
  asyncHandler(async (req, res) => {
    const body = parseBody(
      z.object({
        text: z.string().min(10, 'أدخل نص الصفحة كما هو في الأصل').max(60000),
        enteredBy: z.string().max(150).default(''),
      }),
      req.body,
    );
    const db = getDb();
    const segmentId = param(req, 'id');
    const segment = db
      .prepare<[string], { id: string; source_id: string; page: number | null }>(
        `SELECT id, source_id, page FROM source_segments WHERE id = ?`,
      )
      .get(segmentId);
    if (!segment) throw new HttpError(404, 'المقطع غير موجود.');
    const sha =
      db.prepare<[string], { sha256: string }>(`SELECT sha256 FROM sources WHERE id = ?`).get(segment.source_id)?.sha256 ?? '';

    const id = newId('cor');
    db.prepare(
      `INSERT INTO segment_corrections (id, segment_id, source_id, source_sha256, page, text, entered_by, entered_at, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'entered')`,
    ).run(id, segmentId, segment.source_id, sha, segment.page, body.text, body.enteredBy, nowIso());
    audit('segment.correction', 'segment', segmentId, { correctionId: id, by: body.enteredBy });
    res.status(201).json({
      id,
      status: 'entered',
      note: 'سُجّل النص اليدوي بانتظار مراجعة بشرية. لا يُستخدم كسند متحقق قبل الاعتماد.',
    });
  }),
);

intakeRouter.put(
  '/corrections/:id',
  asyncHandler(async (req, res) => {
    const body = parseBody(
      z.object({
        status: z.enum(['approved', 'rejected', 'entered']),
        reviewedBy: z.string().min(2, 'اسم المراجع مطلوب').max(150),
        reviewNote: z.string().max(2000).default(''),
      }),
      req.body,
    );
    const db = getDb();
    const id = param(req, 'id');
    const result = db
      .prepare(`UPDATE segment_corrections SET status = ?, reviewed_by = ?, reviewed_at = ?, review_note = ? WHERE id = ?`)
      .run(body.status, body.reviewedBy, nowIso(), body.reviewNote, id);
    if (result.changes === 0) throw new HttpError(404, 'النص اليدوي غير موجود.');
    audit('segment.correction_review', 'correction', id, body);
    res.json({ ok: true });
  }),
);

// ------------------------------------------------------ source relations ---

const RELATION_KINDS = ['amends', 'supersedes', 'interprets', 'conflicts'] as const;

export const RELATION_LABELS: Record<string, string> = {
  amends: 'يعدّل',
  supersedes: 'يحلّ محل',
  interprets: 'يفسّر',
  conflicts: 'يتعارض مع',
};

intakeRouter.get(
  '/relations',
  asyncHandler(async (req, res) => {
    const db = getDb();
    const rows = db
      .prepare<[string], Record<string, unknown>>(
        `SELECT r.*, f.title AS from_title, f.version AS from_version, t.title AS to_title, t.version AS to_version
           FROM source_relations r
           JOIN sources f ON f.id = r.from_source_id
           JOIN sources t ON t.id = r.to_source_id
          WHERE r.scope = ? ORDER BY r.created_at DESC`,
      )
      .all(scopeOf(req));
    res.json({ relations: rows.map(mapRelation) });
  }),
);

intakeRouter.post(
  '/relations',
  asyncHandler(async (req, res) => {
    const body = parseBody(
      z.object({
        fromSourceId: z.string().min(1),
        toSourceId: z.string().min(1),
        kind: z.enum(RELATION_KINDS),
        subject: z.string().max(200).default(''),
        note: z.string().max(2000).default(''),
        track: z.string().max(60).default(''),
        scope: z.enum(['real', 'demo']).default('real'),
      }),
      req.body,
    );
    if (body.fromSourceId === body.toSourceId) throw new HttpError(400, 'لا يمكن ربط المصدر بنفسه.');
    const db = getDb();
    for (const sourceId of [body.fromSourceId, body.toSourceId]) {
      const exists = db.prepare<[string], { id: string }>(`SELECT id FROM sources WHERE id = ?`).get(sourceId);
      if (!exists) throw new HttpError(404, 'أحد المصدرين غير موجود.');
    }
    const id = newId('rel');
    db.prepare(
      `INSERT INTO source_relations (id, scope, track, from_source_id, to_source_id, kind, subject, note, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'unresolved', ?)`,
    ).run(id, body.scope, body.track, body.fromSourceId, body.toSourceId, body.kind, body.subject, body.note, nowIso());
    audit('relation.create', 'relation', id, body);
    res.status(201).json({ id, status: 'unresolved' });
  }),
);

intakeRouter.post(
  '/relations/:id/resolve',
  asyncHandler(async (req, res) => {
    const body = parseBody(
      z.object({
        note: z.string().min(10, 'سجّل نتيجة المراجعة التي تحسم أثر العلاقة'),
        resolvedBy: z.string().max(150).default(''),
      }),
      req.body,
    );
    const db = getDb();
    const id = param(req, 'id');
    const result = db
      .prepare(`UPDATE source_relations SET status = 'resolved', resolution_note = ?, resolved_by = ?, resolved_at = ? WHERE id = ?`)
      .run(body.note, body.resolvedBy, nowIso(), id);
    if (result.changes === 0) throw new HttpError(404, 'العلاقة غير موجودة.');
    audit('relation.resolve', 'relation', id, body);
    res.json({ ok: true });
  }),
);

intakeRouter.delete(
  '/relations/:id',
  asyncHandler(async (req, res) => {
    getDb().prepare(`DELETE FROM source_relations WHERE id = ?`).run(param(req, 'id'));
    res.json({ ok: true });
  }),
);

function mapRelation(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    scope: row.scope as string,
    track: row.track as string,
    kind: row.kind as string,
    kindLabel: RELATION_LABELS[row.kind as string] ?? (row.kind as string),
    fromSourceId: row.from_source_id as string,
    fromTitle: row.from_title as string,
    fromVersion: row.from_version as string,
    toSourceId: row.to_source_id as string,
    toTitle: row.to_title as string,
    toVersion: row.to_version as string,
    subject: row.subject as string,
    note: row.note as string,
    status: row.status as string,
    resolutionNote: row.resolution_note as string,
    resolvedBy: row.resolved_by as string,
    resolvedAt: row.resolved_at as string,
    createdAt: row.created_at as string,
  };
}
