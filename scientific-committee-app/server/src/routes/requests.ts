import fs from 'node:fs';
import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../db.js';
import { asyncHandler, parseBody, scopeOf, param } from '../lib/http.js';
import { HttpError, audit, newId, nowIso, parseJson } from '../lib/util.js';
import { extractDocument } from '../services/extract.js';
import { resolveStoredPath, storeUpload, uploader } from '../services/storage.js';
import { assessReadiness } from '../services/readiness.js';

export const requestsRouter = Router();

const requestSchema = z.object({
  refNo: z.string().min(1, 'الرقم المرجعي مطلوب').max(80),
  typeId: z.string().min(1, 'نوع الطلب مطلوب'),
  title: z.string().min(3, 'عنوان الطلب مطلوب').max(300),
  applicantName: z.string().max(200).default(''),
  applicantUnit: z.string().max(200).default(''),
  submittedDate: z.string().max(40).default(''),
  submittedCalendar: z.enum(['', 'gregorian', 'hijri']).default(''),
  academicYear: z.string().max(40).default(''),
  summary: z.string().max(4000).default(''),
  scope: z.enum(['real', 'demo']).default('real'),
});

const STATUS_VALUES = ['new', 'awaiting_completion', 'under_study', 'studied', 'in_minutes', 'closed'] as const;

requestsRouter.get(
  '/requests',
  asyncHandler(async (req, res) => {
    const db = getDb();
    const scope = scopeOf(req);
    const rows = db
      .prepare<[string], Record<string, unknown>>(
        `SELECT r.*, t.name AS type_name, t.track AS type_track,
                (SELECT COUNT(*) FROM attachments a WHERE a.request_id = r.id) AS attachment_count,
                (SELECT COUNT(*) FROM studies s WHERE s.request_id = r.id) AS study_count,
                (SELECT MAX(version) FROM studies s WHERE s.request_id = r.id) AS latest_version
           FROM requests r LEFT JOIN request_types t ON t.id = r.type_id
          WHERE r.scope = ? ORDER BY r.created_at DESC`,
      )
      .all(scope);
    res.json({ requests: rows.map(mapRequest) });
  }),
);

requestsRouter.get(
  '/requests/:id',
  asyncHandler(async (req, res) => {
    const db = getDb();
    const row = db
      .prepare<[string], Record<string, unknown>>(
        `SELECT r.*, t.name AS type_name, t.track AS type_track FROM requests r
           LEFT JOIN request_types t ON t.id = r.type_id WHERE r.id = ?`,
      )
      .get(param(req, 'id'));
    if (!row) throw new HttpError(404, 'الطلب غير موجود.');

    const attachments = db
      .prepare<[string], Record<string, unknown>>(
        `SELECT id, label, checklist_item, file_name, mime, size, sha256, extraction_status, extraction_note,
                segment_count, created_at FROM attachments WHERE request_id = ? ORDER BY created_at`,
      )
      .all(param(req, 'id'))
      .map(mapAttachment);

    const studies = db
      .prepare<[string], { id: string; version: number; status: string; mode: string; ready: number; created_at: string; finalized_at: string }>(
        `SELECT id, version, status, mode, ready, created_at, finalized_at FROM studies
          WHERE request_id = ? ORDER BY version DESC`,
      )
      .all(param(req, 'id'))
      .map((s) => ({
        id: s.id,
        version: s.version,
        status: s.status,
        mode: s.mode,
        ready: s.ready === 1,
        createdAt: s.created_at,
        finalizedAt: s.finalized_at,
      }));

    const readiness = assessReadiness(db, {
      requestId: param(req, 'id'),
      scope: String(row.scope),
      typeId: (row.type_id as string | null) ?? null,
      track: ((row.type_track as string | null) ?? '') || '',
    });

    const checklist = row.type_id
      ? parseJson<string[]>(
          db.prepare<[string], { checklist: string }>(`SELECT checklist FROM request_types WHERE id = ?`).get(String(row.type_id))?.checklist,
          [],
        )
      : [];

    res.json({
      request: mapRequest(row),
      attachments,
      studies,
      readiness,
      checklist,
      missingAttachments: readiness.missingAttachments,
    });
  }),
);

requestsRouter.post(
  '/requests',
  asyncHandler(async (req, res) => {
    const body = parseBody(requestSchema, req.body);
    const db = getDb();
    const type = db
      .prepare<[string], { id: string; scope: string }>(`SELECT id, scope FROM request_types WHERE id = ?`)
      .get(body.typeId);
    if (!type) throw new HttpError(400, 'نوع الطلب غير موجود.');
    if (type.scope !== body.scope) {
      throw new HttpError(400, 'لا يجوز استخدام نوع طلب من نطاق مختلف (تجريبي مقابل فعلي).');
    }
    const duplicate = db
      .prepare<[string, string], { id: string }>(`SELECT id FROM requests WHERE scope = ? AND ref_no = ?`)
      .get(body.scope, body.refNo);
    if (duplicate) throw new HttpError(409, 'الرقم المرجعي مستخدم في طلب آخر.');

    const id = newId('rq');
    const at = nowIso();
    const track =
      db.prepare<[string], { track: string }>(`SELECT track FROM request_types WHERE id = ?`).get(body.typeId)?.track ?? '';
    db.prepare(
      `INSERT INTO requests (id, ref_no, type_id, title, applicant_name, applicant_unit, submitted_date,
                             submitted_calendar, academic_year, track, summary, status, scope, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?, ?)`,
    ).run(
      id,
      body.refNo,
      body.typeId,
      body.title,
      body.applicantName,
      body.applicantUnit,
      body.submittedDate,
      body.submittedCalendar,
      body.academicYear,
      track,
      body.summary,
      body.scope,
      at,
      at,
    );
    audit('request.create', 'request', id, { refNo: body.refNo, scope: body.scope });
    res.status(201).json({ id });
  }),
);

requestsRouter.put(
  '/requests/:id',
  asyncHandler(async (req, res) => {
    const body = parseBody(
      requestSchema.partial().extend({ status: z.enum(STATUS_VALUES).optional() }),
      req.body,
    );
    const db = getDb();
    const existing = db.prepare<[string], { id: string }>(`SELECT id FROM requests WHERE id = ?`).get(param(req, 'id'));
    if (!existing) throw new HttpError(404, 'الطلب غير موجود.');
    db.prepare(
      `UPDATE requests SET ref_no = COALESCE(?, ref_no), type_id = COALESCE(?, type_id),
              title = COALESCE(?, title), applicant_name = COALESCE(?, applicant_name),
              applicant_unit = COALESCE(?, applicant_unit), submitted_date = COALESCE(?, submitted_date),
              submitted_calendar = COALESCE(?, submitted_calendar), academic_year = COALESCE(?, academic_year),
              summary = COALESCE(?, summary), status = COALESCE(?, status), updated_at = ?
        WHERE id = ?`,
    ).run(
      body.refNo ?? null,
      body.typeId ?? null,
      body.title ?? null,
      body.applicantName ?? null,
      body.applicantUnit ?? null,
      body.submittedDate ?? null,
      body.submittedCalendar ?? null,
      body.academicYear ?? null,
      body.summary ?? null,
      body.status ?? null,
      nowIso(),
      param(req, 'id'),
    );
    audit('request.update', 'request', param(req, 'id'), body);
    res.json({ ok: true });
  }),
);

requestsRouter.post(
  '/requests/:id/attachments',
  uploader.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new HttpError(400, 'يجب اختيار ملف للرفع.');
    const db = getDb();
    const request = db.prepare<[string], { id: string }>(`SELECT id FROM requests WHERE id = ?`).get(param(req, 'id'));
    if (!request) throw new HttpError(404, 'الطلب غير موجود.');

    const label = String((req.body as { label?: string }).label ?? '').slice(0, 200);

    // The uploader may state which checklist item the file is meant to cover. It must be
    // one of the type's own items — the app never invents a checklist entry from free text.
    const checklistItem = String((req.body as { checklistItem?: string }).checklistItem ?? '').trim();
    if (checklistItem) {
      const typeId = db
        .prepare<[string], { type_id: string | null }>(`SELECT type_id FROM requests WHERE id = ?`)
        .get(param(req, 'id'))?.type_id ?? null;
      const checklist = typeId
        ? parseJson<string[]>(
            db.prepare<[string], { checklist: string }>(`SELECT checklist FROM request_types WHERE id = ?`).get(typeId)
              ?.checklist,
            [],
          )
        : [];
      if (!checklist.includes(checklistItem)) {
        throw new HttpError(400, 'بند القائمة المحدد لا ينتمي إلى قائمة نوع هذا الطلب.');
      }
    }

    const stored = storeUpload(req.file);
    const extraction = await extractDocument(stored.fileName, stored.buffer);

    const id = newId('att');
    const at = nowIso();
    db.transaction(() => {
      db.prepare(
        `INSERT INTO attachments (id, request_id, label, checklist_item, file_name, stored_name, mime, size, sha256,
                                  extraction_status, extraction_note, segment_count, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        id,
        param(req, 'id'),
        label,
        checklistItem,
        stored.fileName,
        stored.storedName,
        stored.mime,
        stored.size,
        stored.sha256,
        extraction.status,
        extraction.note,
        extraction.segments.length,
        at,
      );
      const insertSegment = db.prepare(
        `INSERT INTO attachment_segments (id, attachment_id, ordinal, locator, page, text, needs_ocr)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      );
      for (const segment of extraction.segments) {
        insertSegment.run(newId('aseg'), id, segment.ordinal, segment.locator, segment.page, segment.text, segment.needsOcr ? 1 : 0);
      }
    })();

    audit('attachment.create', 'attachment', id, { requestId: param(req, 'id'), status: extraction.status });
    res.status(201).json({ id, extraction: { status: extraction.status, note: extraction.note, segments: extraction.segments.length } });
  }),
);

requestsRouter.get(
  '/attachments/:id/file',
  asyncHandler(async (req, res) => {
    const db = getDb();
    const attachment = db
      .prepare<[string], { stored_name: string; file_name: string }>(
        `SELECT stored_name, file_name FROM attachments WHERE id = ?`,
      )
      .get(param(req, 'id'));
    if (!attachment) throw new HttpError(404, 'المرفق غير موجود.');
    const full = resolveStoredPath(attachment.stored_name);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(attachment.file_name)}`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    fs.createReadStream(full).pipe(res);
  }),
);

requestsRouter.get(
  '/attachments/:id/segments',
  asyncHandler(async (req, res) => {
    const db = getDb();
    const segments = db
      .prepare<[string], { id: string; ordinal: number; locator: string; text: string; needs_ocr: number }>(
        `SELECT id, ordinal, locator, text, needs_ocr FROM attachment_segments WHERE attachment_id = ? ORDER BY ordinal`,
      )
      .all(param(req, 'id'));
    res.json({
      segments: segments.map((s) => ({ id: s.id, ordinal: s.ordinal, locator: s.locator, text: s.text, needsOcr: s.needs_ocr === 1 })),
    });
  }),
);

requestsRouter.delete(
  '/attachments/:id',
  asyncHandler(async (req, res) => {
    const db = getDb();
    const attachment = db
      .prepare<[string], { id: string; stored_name: string }>(`SELECT id, stored_name FROM attachments WHERE id = ?`)
      .get(param(req, 'id'));
    if (!attachment) throw new HttpError(404, 'المرفق غير موجود.');
    const cited = db
      .prepare<[string], { c: number }>(`SELECT COUNT(*) AS c FROM findings WHERE evidence_attachment_id = ?`)
      .get(param(req, 'id'))?.c ?? 0;
    if (cited > 0) throw new HttpError(409, `لا يمكن حذف مرفق مستشهد به في ${cited} بندًا من بنود الدراسة.`);
    db.prepare(`DELETE FROM attachments WHERE id = ?`).run(param(req, 'id'));
    try {
      fs.rmSync(resolveStoredPath(attachment.stored_name), { force: true });
    } catch {
      /* row removed; a stale file on disk is harmless */
    }
    audit('attachment.delete', 'attachment', param(req, 'id'));
    res.json({ ok: true });
  }),
);

function mapRequest(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    refNo: row.ref_no as string,
    typeId: (row.type_id as string | null) ?? null,
    typeName: (row.type_name as string | null) ?? '',
    title: row.title as string,
    applicantName: row.applicant_name as string,
    applicantUnit: row.applicant_unit as string,
    submittedDate: row.submitted_date as string,
    submittedCalendar: (row.submitted_calendar as string) ?? '',
    academicYear: (row.academic_year as string) ?? '',
    track: ((row.type_track as string | null) ?? (row.track as string | null) ?? ''),
    summary: row.summary as string,
    status: row.status as string,
    scope: row.scope as string,
    attachmentCount: (row.attachment_count as number) ?? 0,
    studyCount: (row.study_count as number) ?? 0,
    latestVersion: (row.latest_version as number | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapAttachment(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    label: row.label as string,
    /** The checklist item the uploader says this file covers — a claim, not a verification. */
    checklistItem: (row.checklist_item as string | null) ?? '',
    fileName: row.file_name as string,
    mime: row.mime as string,
    size: row.size as number,
    sha256: row.sha256 as string,
    extractionStatus: row.extraction_status as string,
    extractionNote: row.extraction_note as string,
    segmentCount: row.segment_count as number,
    createdAt: row.created_at as string,
  };
}
