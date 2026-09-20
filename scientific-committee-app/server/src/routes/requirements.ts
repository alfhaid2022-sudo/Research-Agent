import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../db.js';
import { asyncHandler, parseBody, scopeOf, param } from '../lib/http.js';
import { HttpError, audit, newId, nowIso, parseJson } from '../lib/util.js';
import { quoteFoundIn } from '../services/citations.js';
import { effectiveSegment } from '../services/segments.js';

export const requirementsRouter = Router();

requirementsRouter.get(
  '/requirements',
  asyncHandler(async (req, res) => {
    const db = getDb();
    const status = typeof req.query.status === 'string' ? req.query.status : null;
    const sourceId = typeof req.query.sourceId === 'string' ? req.query.sourceId : null;
    const rows = db
      .prepare<[string, string | null, string | null, string | null, string | null], Record<string, unknown>>(
        `SELECT r.*, s.title AS source_title, s.version AS source_version, s.effective_date AS source_effective_date
           FROM requirements r JOIN sources s ON s.id = r.source_id
          WHERE r.scope = ?
            AND (? IS NULL OR r.status = ?)
            AND (? IS NULL OR r.source_id = ?)
          ORDER BY r.created_at DESC`,
      )
      .all(scopeOf(req), status, status, sourceId, sourceId);
    res.json({ requirements: rows.map(mapRequirement) });
  }),
);

const manualSchema = z.object({
  sourceId: z.string().min(1, 'المصدر مطلوب'),
  segmentId: z.string().optional(),
  text: z.string().min(5, 'نص المتطلب مطلوب').max(2000),
  quote: z.string().max(4000).default(''),
  category: z.string().max(120).default(''),
  conflictKey: z.string().max(120).default(''),
  conflictValue: z.string().max(120).default(''),
  appliesTo: z.array(z.string()).default([]),
  tracks: z.array(z.string().max(60)).default([]),
  page: z.number().int().positive().optional(),
  clause: z.string().max(120).default(''),
  applicationDate: z.string().max(60).default(''),
  dateCalendar: z.enum(['', 'gregorian', 'hijri', 'academic_year']).default(''),
});

requirementsRouter.post(
  '/requirements',
  asyncHandler(async (req, res) => {
    const body = parseBody(manualSchema, req.body);
    const db = getDb();
    const source = db
      .prepare<[string], { id: string; scope: string; track: string }>(
        `SELECT id, scope, track FROM sources WHERE id = ?`,
      )
      .get(body.sourceId);
    if (!source) throw new HttpError(404, 'المصدر غير موجود.');
    const sourceTrack = source.track ?? '';

    let locator = '';
    let page: number | null = body.page ?? null;
    if (body.segmentId) {
      const segment = db
        .prepare<[string], { id: string; source_id: string; locator: string; page: number | null }>(
          `SELECT id, source_id, locator, page FROM source_segments WHERE id = ?`,
        )
        .get(body.segmentId);
      if (!segment || segment.source_id !== body.sourceId) {
        throw new HttpError(400, 'المقطع المحدد لا يعود إلى هذا المصدر.');
      }
      locator = segment.locator;
      page = segment.page ?? page;
      // The quote is checked against the text that may actually serve as a basis:
      // an approved manual correction when there is one, otherwise the extracted text.
      const effective = effectiveSegment(db, segment.id);
      if (body.quote) {
        if (!effective?.usableAsBasis) {
          throw new HttpError(
            400,
            `لا يمكن قبول اقتباس من هذا المقطع: ${effective?.reason ?? 'نص المقطع غير متاح.'}`,
          );
        }
        if (!quoteFoundIn(effective.text, body.quote)) {
          throw new HttpError(400, 'الاقتباس غير موجود حرفيًا في نص المقطع المحدد.');
        }
      }
    }

    const id = newId('req');
    const at = nowIso();
    db.prepare(
      `INSERT INTO requirements (id, source_id, segment_id, scope, text, quote, locator, category,
                                 conflict_key, conflict_value, applies_to, tracks, page, clause,
                                 application_date, date_calendar, status, origin, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'candidate', 'manual', ?, ?)`,
    ).run(
      id,
      body.sourceId,
      body.segmentId ?? null,
      source.scope,
      body.text,
      body.quote,
      locator,
      body.category,
      body.conflictKey,
      body.conflictValue,
      JSON.stringify(body.appliesTo),
      JSON.stringify(body.tracks.length > 0 ? body.tracks : sourceTrack ? [sourceTrack] : []),
      page,
      body.clause,
      body.applicationDate,
      body.dateCalendar,
      at,
      at,
    );
    audit('requirement.create', 'requirement', id, { origin: 'manual' });
    res.status(201).json({ id });
  }),
);

const reviewSchema = z.object({
  status: z.enum(['candidate', 'approved', 'rejected']).optional(),
  text: z.string().min(5).max(2000).optional(),
  category: z.string().max(120).optional(),
  conflictKey: z.string().max(120).optional(),
  conflictValue: z.string().max(120).optional(),
  appliesTo: z.array(z.string()).optional(),
  tracks: z.array(z.string().max(60)).optional(),
  clause: z.string().max(120).optional(),
  applicationDate: z.string().max(60).optional(),
  dateCalendar: z.enum(['', 'gregorian', 'hijri', 'academic_year']).optional(),
  reviewNote: z.string().max(2000).optional(),
  reviewedBy: z.string().max(150).optional(),
});

requirementsRouter.put(
  '/requirements/:id',
  asyncHandler(async (req, res) => {
    const body = parseBody(reviewSchema, req.body);
    const db = getDb();
    const existing = db
      .prepare<[string], { id: string; status: string }>(`SELECT id, status FROM requirements WHERE id = ?`)
      .get(param(req, 'id'));
    if (!existing) throw new HttpError(404, 'المتطلب غير موجود.');

    const at = nowIso();
    const reviewing = body.status !== undefined && body.status !== existing.status;
    db.prepare(
      `UPDATE requirements SET
          status = COALESCE(?, status), text = COALESCE(?, text), category = COALESCE(?, category),
          conflict_key = COALESCE(?, conflict_key), conflict_value = COALESCE(?, conflict_value),
          applies_to = COALESCE(?, applies_to), tracks = COALESCE(?, tracks),
          clause = COALESCE(?, clause), application_date = COALESCE(?, application_date),
          date_calendar = COALESCE(?, date_calendar), review_note = COALESCE(?, review_note),
          reviewed_by = COALESCE(?, reviewed_by), reviewed_at = CASE WHEN ? THEN ? ELSE reviewed_at END,
          updated_at = ?
        WHERE id = ?`,
    ).run(
      body.status ?? null,
      body.text ?? null,
      body.category ?? null,
      body.conflictKey ?? null,
      body.conflictValue ?? null,
      body.appliesTo ? JSON.stringify(body.appliesTo) : null,
      body.tracks ? JSON.stringify(body.tracks) : null,
      body.clause ?? null,
      body.applicationDate ?? null,
      body.dateCalendar ?? null,
      body.reviewNote ?? null,
      body.reviewedBy ?? null,
      reviewing ? 1 : 0,
      at,
      at,
      param(req, 'id'),
    );
    audit('requirement.review', 'requirement', param(req, 'id'), body);
    res.json({ ok: true });
  }),
);

requirementsRouter.post(
  '/requirements/bulk-status',
  asyncHandler(async (req, res) => {
    const body = parseBody(
      z.object({
        ids: z.array(z.string().min(1)).min(1, 'حدد متطلبًا واحدًا على الأقل'),
        status: z.enum(['candidate', 'approved', 'rejected']),
        reviewedBy: z.string().max(150).default(''),
      }),
      req.body,
    );
    const db = getDb();
    const at = nowIso();
    const update = db.prepare(
      `UPDATE requirements SET status = ?, reviewed_by = ?, reviewed_at = ?, updated_at = ? WHERE id = ?`,
    );
    db.transaction(() => {
      for (const id of body.ids) update.run(body.status, body.reviewedBy, at, at, id);
    })();
    audit('requirement.bulk_status', 'requirement', body.ids.join(','), body.status);
    res.json({ ok: true, updated: body.ids.length });
  }),
);

requirementsRouter.delete(
  '/requirements/:id',
  asyncHandler(async (req, res) => {
    const db = getDb();
    const cited = db
      .prepare<[string], { c: number }>(`SELECT COUNT(*) AS c FROM findings WHERE requirement_id = ?`)
      .get(param(req, 'id'))?.c ?? 0;
    if (cited > 0) throw new HttpError(409, `لا يمكن حذف متطلب مستشهد به في ${cited} بندًا. ارفضه بدل حذفه.`);
    db.prepare(`DELETE FROM requirements WHERE id = ?`).run(param(req, 'id'));
    audit('requirement.delete', 'requirement', param(req, 'id'));
    res.json({ ok: true });
  }),
);

function mapRequirement(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    sourceId: row.source_id as string,
    sourceTitle: row.source_title as string,
    sourceVersion: row.source_version as string,
    sourceEffectiveDate: row.source_effective_date as string,
    segmentId: (row.segment_id as string | null) ?? null,
    scope: row.scope as string,
    text: row.text as string,
    quote: row.quote as string,
    locator: row.locator as string,
    category: row.category as string,
    conflictKey: row.conflict_key as string,
    conflictValue: row.conflict_value as string,
    appliesTo: parseJson<string[]>(row.applies_to as string, []),
    tracks: parseJson<string[]>(row.tracks as string, []),
    page: (row.page as number | null) ?? null,
    clause: (row.clause as string) ?? '',
    applicationDate: (row.application_date as string) ?? '',
    dateCalendar: (row.date_calendar as string) ?? '',
    status: row.status as string,
    origin: row.origin as string,
    reviewNote: row.review_note as string,
    reviewedBy: row.reviewed_by as string,
    reviewedAt: row.reviewed_at as string,
    createdAt: row.created_at as string,
  };
}
