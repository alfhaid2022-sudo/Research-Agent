import fs from 'node:fs';
import { Router } from 'express';
import { z } from 'zod';
import { config } from '../config.js';
import { getDb } from '../db.js';
import { asyncHandler, booleanField, param, parseBody, scopeOf } from '../lib/http.js';
import { HttpError, audit, newId, nowIso, normalizeScope } from '../lib/util.js';
import { extractDocument } from '../services/extract.js';
import { effectiveSegment } from '../services/segments.js';
import { resolveStoredPath, storeUpload, uploader } from '../services/storage.js';
import { extractRequirementsForSource } from '../services/ai/requirements.js';

export const sourcesRouter = Router();

const metadataSchema = z.object({
  title: z.string().min(2, 'العنوان مطلوب').max(250),
  kind: z.enum(['regulation', 'policy', 'guide', 'form_template', 'other']).default('regulation'),
  issuer: z.string().max(200).default(''),
  version: z.string().max(80).default(''),
  effectiveDate: z.string().max(40).default(''),
  referenceNo: z.string().max(80).default(''),
  notes: z.string().max(2000).default(''),
  scope: z.enum(['real', 'demo']).default('real'),
  track: z.string().max(60).default(''),
  expectedSha256: z.string().max(64).default(''),
  isOfficialTemplate: booleanField.default(false),
});

sourcesRouter.get(
  '/sources',
  asyncHandler(async (req, res) => {
    const db = getDb();
    const onlyTemplates = req.query.templates === '1';
    const rows = db
      .prepare<[string, number], Record<string, unknown>>(
        `SELECT id, kind, title, issuer, version, effective_date, reference_no, notes, scope,
                is_official_template, file_name, mime, size, sha256, extraction_status, extraction_note,
                segment_count, needs_ocr_segments, needs_review_segments, track, page_count,
                expected_sha256, intake_status, intake_note, created_at, updated_at
           FROM sources WHERE scope = ? AND is_official_template = ?
          ORDER BY created_at DESC`,
      )
      .all(scopeOf(req), onlyTemplates ? 1 : 0);
    res.json({ sources: rows.map(mapSource) });
  }),
);

sourcesRouter.get(
  '/sources/:id',
  asyncHandler(async (req, res) => {
    const db = getDb();
    const row = db.prepare<[string], Record<string, unknown>>(`SELECT * FROM sources WHERE id = ?`).get(param(req, 'id'));
    if (!row) throw new HttpError(404, 'المصدر غير موجود.');
    const segments = db
      .prepare<[string], { id: string; ordinal: number; locator: string; page: number | null; text: string; needs_ocr: number; quality: string; quality_note: string }>(
        `SELECT id, ordinal, locator, page, text, needs_ocr, quality, quality_note
           FROM source_segments WHERE source_id = ? ORDER BY ordinal`,
      )
      .all(param(req, 'id'));
    const requirementCounts = db
      .prepare<[string], { status: string; c: number }>(
        `SELECT status, COUNT(*) AS c FROM requirements WHERE source_id = ? GROUP BY status`,
      )
      .all(param(req, 'id'));
    res.json({
      source: mapSource(row),
      segments: segments.map((segment) => {
        const effective = effectiveSegment(db, segment.id);
        return {
          id: segment.id,
          ordinal: segment.ordinal,
          locator: segment.locator,
          page: segment.page,
          text: segment.text,
          needsOcr: segment.needs_ocr === 1,
          quality: segment.quality,
          qualityNote: segment.quality_note,
          effectiveText: effective?.text ?? segment.text,
          textOrigin: effective?.origin ?? 'extracted',
          usableAsBasis: effective?.usableAsBasis ?? false,
          basisReason: effective?.reason ?? '',
          correctionStatus: effective?.correctionStatus ?? 'none',
        };
      }),
      requirementCounts: Object.fromEntries(requirementCounts.map((r) => [r.status, r.c])),
    });
  }),
);

sourcesRouter.post(
  '/sources',
  uploader.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new HttpError(400, 'يجب رفع ملف المصدر.');
    const body = parseBody(metadataSchema, req.body);
    const stored = storeUpload(req.file);
    const extraction = await extractDocument(stored.fileName, stored.buffer);

    const db = getDb();
    const id = newId('src');
    const at = nowIso();
    const needsOcrCount = extraction.segments.filter((segment) => segment.quality === 'none').length;
    const needsReviewCount = extraction.segments.filter((segment) => segment.quality === 'suspect').length;
    const intake = checkIntake(body.expectedSha256, stored.sha256);

    db.transaction(() => {
      db.prepare(
        `INSERT INTO sources (id, kind, title, issuer, version, effective_date, reference_no, notes, scope,
                              is_official_template, file_name, stored_name, mime, size, sha256,
                              extraction_status, extraction_note, segment_count, needs_ocr_segments,
                              needs_review_segments, track, page_count, expected_sha256, intake_status,
                              intake_note, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        id,
        body.isOfficialTemplate ? 'form_template' : body.kind,
        body.title,
        body.issuer,
        body.version,
        body.effectiveDate,
        body.referenceNo,
        body.notes,
        body.scope,
        body.isOfficialTemplate ? 1 : 0,
        stored.fileName,
        stored.storedName,
        stored.mime,
        stored.size,
        stored.sha256,
        extraction.status,
        extraction.note,
        extraction.segments.length,
        needsOcrCount,
        needsReviewCount,
        body.track,
        extraction.pageCount,
        body.expectedSha256.trim().toLowerCase(),
        intake.status,
        intake.note,
        at,
        at,
      );
      const insertSegment = db.prepare(
        `INSERT INTO source_segments (id, source_id, ordinal, locator, page, text, needs_ocr, quality, quality_note)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      for (const segment of extraction.segments) {
        insertSegment.run(
          newId('seg'),
          id,
          segment.ordinal,
          segment.locator,
          segment.page,
          segment.text,
          segment.needsOcr ? 1 : 0,
          segment.quality,
          segment.qualityNote,
        );
      }
    })();

    audit('source.create', 'source', id, { title: body.title, status: extraction.status, intake: intake.status });
    res.status(201).json({
      id,
      intake,
      extraction: {
        status: extraction.status,
        note: extraction.note,
        segments: extraction.segments.length,
        needsOcr: needsOcrCount,
        needsReview: needsReviewCount,
        pageCount: extraction.pageCount,
      },
    });
  }),
);

sourcesRouter.put(
  '/sources/:id',
  asyncHandler(async (req, res) => {
    const body = parseBody(metadataSchema.partial(), req.body);
    const db = getDb();
    const existing = db.prepare<[string], { id: string }>(`SELECT id FROM sources WHERE id = ?`).get(param(req, 'id'));
    if (!existing) throw new HttpError(404, 'المصدر غير موجود.');
    db.prepare(
      `UPDATE sources SET title = COALESCE(?, title), kind = COALESCE(?, kind), issuer = COALESCE(?, issuer),
              version = COALESCE(?, version), effective_date = COALESCE(?, effective_date),
              reference_no = COALESCE(?, reference_no), notes = COALESCE(?, notes),
              is_official_template = COALESCE(?, is_official_template), updated_at = ?
        WHERE id = ?`,
    ).run(
      body.title ?? null,
      body.kind ?? null,
      body.issuer ?? null,
      body.version ?? null,
      body.effectiveDate ?? null,
      body.referenceNo ?? null,
      body.notes ?? null,
      body.isOfficialTemplate === undefined ? null : body.isOfficialTemplate ? 1 : 0,
      nowIso(),
      param(req, 'id'),
    );
    audit('source.update', 'source', param(req, 'id'), body);
    res.json({ ok: true });
  }),
);

sourcesRouter.delete(
  '/sources/:id',
  asyncHandler(async (req, res) => {
    const db = getDb();
    const source = db
      .prepare<[string], { id: string; stored_name: string }>(`SELECT id, stored_name FROM sources WHERE id = ?`)
      .get(param(req, 'id'));
    if (!source) throw new HttpError(404, 'المصدر غير موجود.');
    const cited = db
      .prepare<[string], { c: number }>(`SELECT COUNT(*) AS c FROM findings WHERE basis_source_id = ?`)
      .get(param(req, 'id'))?.c ?? 0;
    if (cited > 0) {
      throw new HttpError(409, `لا يمكن حذف مصدر مستشهد به في ${cited} بندًا من بنود الدراسات.`);
    }
    db.prepare(`DELETE FROM sources WHERE id = ?`).run(param(req, 'id'));
    try {
      fs.rmSync(resolveStoredPath(source.stored_name), { force: true });
    } catch {
      /* the database row is gone either way; a stale file is harmless */
    }
    audit('source.delete', 'source', param(req, 'id'));
    res.json({ ok: true });
  }),
);

sourcesRouter.get(
  '/sources/:id/file',
  asyncHandler(async (req, res) => {
    const db = getDb();
    const source = db
      .prepare<[string], { stored_name: string; file_name: string; mime: string }>(
        `SELECT stored_name, file_name, mime FROM sources WHERE id = ?`,
      )
      .get(param(req, 'id'));
    if (!source) throw new HttpError(404, 'المصدر غير موجود.');
    const full = resolveStoredPath(source.stored_name);
    // Always download; never let an uploaded document render as a page in this origin.
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(source.file_name)}`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    fs.createReadStream(full).pipe(res);
  }),
);

sourcesRouter.post(
  '/sources/:id/extract-requirements',
  asyncHandler(async (req, res) => {
    const report = await extractRequirementsForSource(getDb(), param(req, 'id'));
    audit('source.extract_requirements', 'source', param(req, 'id'), report);
    res.json(report);
  }),
);

/** Compares the received file digest with the digest the coordinator announced. */
function checkIntake(expected: string, actual: string): { status: string; note: string } {
  const wanted = expected.trim().toLowerCase();
  if (!wanted) {
    return { status: 'received', note: 'لم تُسجَّل بصمة متوقعة لهذا الملف، فلم تُقارن.' };
  }
  if (wanted === actual.toLowerCase()) {
    return { status: 'verified', note: 'بصمة الملف المستلم تطابق البصمة المتوقعة (SHA-256).' };
  }
  return {
    status: 'hash_mismatch',
    note: 'بصمة الملف المستلم لا تطابق البصمة المتوقعة. لا يجوز اعتماد هذا الملف كأصل حتى يُحسم الاختلاف.',
  };
}

function mapSource(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    kind: row.kind as string,
    title: row.title as string,
    issuer: row.issuer as string,
    version: row.version as string,
    effectiveDate: row.effective_date as string,
    referenceNo: row.reference_no as string,
    notes: row.notes as string,
    scope: normalizeScope(row.scope),
    isOfficialTemplate: row.is_official_template === 1,
    fileName: row.file_name as string,
    mime: row.mime as string,
    size: row.size as number,
    sha256: row.sha256 as string,
    extractionStatus: row.extraction_status as string,
    extractionNote: row.extraction_note as string,
    segmentCount: row.segment_count as number,
    needsOcrSegments: row.needs_ocr_segments as number,
    needsReviewSegments: (row.needs_review_segments as number) ?? 0,
    track: (row.track as string) ?? '',
    pageCount: (row.page_count as number) ?? 0,
    expectedSha256: (row.expected_sha256 as string) ?? '',
    intakeStatus: (row.intake_status as string) ?? 'received',
    intakeNote: (row.intake_note as string) ?? '',
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const maxUploadMb = Math.floor(config.maxUploadBytes / 1024 / 1024);
