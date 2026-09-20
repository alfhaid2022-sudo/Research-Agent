import { Router } from 'express';
import { z } from 'zod';
import { config } from '../config.js';
import { getDb } from '../db.js';
import { asyncHandler, parseBody, param } from '../lib/http.js';
import { HttpError, audit, nowIso, parseJson } from '../lib/util.js';
import { VERDICTS } from '../services/citations.js';
import {
  buildStudyExportModel,
  renderStudyHtml,
} from '../services/export.js';
import { renderStudyDocx } from '../services/docx.js';
import {
  createStudy,
  finalizeStudy,
  getStudy,
  refreshReadiness,
  resolveConflict,
  runAiAnalysis,
  updateFinding,
} from '../services/study.js';

export const studiesRouter = Router();

studiesRouter.post(
  '/requests/:id/studies',
  asyncHandler(async (req, res) => {
    const study = createStudy(getDb(), param(req, 'id'));
    res.status(201).json({ id: study.id, version: study.version, ready: study.ready === 1 });
  }),
);

studiesRouter.get(
  '/studies/:id',
  asyncHandler(async (req, res) => {
    const db = getDb();
    const study = refreshReadiness(db, param(req, 'id'));
    const request = db
      .prepare<[string], Record<string, unknown>>(
        `SELECT r.*, t.name AS type_name FROM requests r LEFT JOIN request_types t ON t.id = r.type_id WHERE r.id = ?`,
      )
      .get(study.request_id);

    const findings = db
      .prepare<[string], Record<string, unknown>>(`SELECT * FROM findings WHERE study_id = ? ORDER BY ordinal`)
      .all(param(req, 'id'))
      .map((row) => {
        const source = row.basis_source_id
          ? db
              .prepare<[string], { title: string; version: string; effective_date: string }>(
                `SELECT title, version, effective_date FROM sources WHERE id = ?`,
              )
              .get(String(row.basis_source_id))
          : undefined;
        const attachment = row.evidence_attachment_id
          ? db
              .prepare<[string], { file_name: string; label: string }>(
                `SELECT file_name, label FROM attachments WHERE id = ?`,
              )
              .get(String(row.evidence_attachment_id))
          : undefined;
        return {
          id: row.id as string,
          ordinal: row.ordinal as number,
          requirementId: (row.requirement_id as string | null) ?? null,
          requirementText: row.requirement_text as string,
          basisSourceId: (row.basis_source_id as string | null) ?? null,
          basisSourceTitle: source?.title ?? '',
          basisSourceVersion: source?.version ?? '',
          basisEffectiveDate: source?.effective_date ?? '',
          basisSegmentId: (row.basis_segment_id as string | null) ?? null,
          basisLocator: row.basis_locator as string,
          basisQuote: row.basis_quote as string,
          evidenceAttachmentId: (row.evidence_attachment_id as string | null) ?? null,
          evidenceAttachmentName: attachment ? attachment.label || attachment.file_name : '',
          evidenceLocator: row.evidence_locator as string,
          evidenceQuote: row.evidence_quote as string,
          verdict: row.verdict as string,
          verdictReason: row.verdict_reason as string,
          facts: row.facts as string,
          inference: row.inference as string,
          calculation: row.calculation as string,
          notes: row.notes as string,
          gap: row.gap as string,
          validation: parseJson<Record<string, unknown>>(row.validation as string, {}),
          origin: row.origin as string,
          edited: row.edited === 1,
        };
      });

    const revisions = db
      .prepare<[string], Record<string, unknown>>(
        `SELECT id, finding_id, field, old_value, new_value, reason, actor, created_at
           FROM study_revisions WHERE study_id = ? ORDER BY created_at DESC`,
      )
      .all(param(req, 'id'))
      .map((r) => ({
        id: r.id as string,
        findingId: (r.finding_id as string | null) ?? null,
        field: r.field as string,
        oldValue: r.old_value as string,
        newValue: r.new_value as string,
        reason: r.reason as string,
        actor: r.actor as string,
        createdAt: r.created_at as string,
      }));

    res.json({
      study: {
        id: study.id,
        requestId: study.request_id,
        version: study.version,
        status: study.status,
        mode: study.mode,
        ready: study.ready === 1,
        readiness: parseJson(study.readiness, []),
        conflicts: parseJson(study.conflicts, []),
        summary: study.summary,
        memo: study.memo,
        recommendation: study.recommendation,
        completionItems: parseJson<string[]>(study.completion_items, []),
        minuteDraft: study.minute_draft,
        aiMeta: parseJson(study.ai_meta, {}),
        createdAt: study.created_at,
        updatedAt: study.updated_at,
        finalizedAt: study.finalized_at,
      },
      request: request
        ? {
            id: request.id as string,
            refNo: request.ref_no as string,
            title: request.title as string,
            typeName: (request.type_name as string | null) ?? '',
            applicantName: request.applicant_name as string,
            applicantUnit: request.applicant_unit as string,
            submittedDate: request.submitted_date as string,
            scope: request.scope as string,
            status: request.status as string,
          }
        : null,
      findings,
      revisions,
    });
  }),
);

studiesRouter.put(
  '/studies/:id',
  asyncHandler(async (req, res) => {
    const body = parseBody(
      z.object({
        summary: z.string().max(6000).optional(),
        memo: z.string().max(20000).optional(),
        recommendation: z.string().max(6000).optional(),
        completionItems: z.array(z.string().max(500)).optional(),
        minuteDraft: z.string().max(20000).optional(),
      }),
      req.body,
    );
    const db = getDb();
    const study = getStudy(db, param(req, 'id'));
    if (study.status === 'final') throw new HttpError(409, 'الدراسة نهائية ولا تقبل التعديل. افتح إصدارًا جديدًا.');
    db.prepare(
      `UPDATE studies SET summary = COALESCE(?, summary), memo = COALESCE(?, memo),
              recommendation = COALESCE(?, recommendation),
              completion_items = COALESCE(?, completion_items),
              minute_draft = COALESCE(?, minute_draft), updated_at = ?
        WHERE id = ?`,
    ).run(
      body.summary ?? null,
      body.memo ?? null,
      body.recommendation ?? null,
      body.completionItems ? JSON.stringify(body.completionItems) : null,
      body.minuteDraft ?? null,
      nowIso(),
      param(req, 'id'),
    );
    audit('study.update', 'study', param(req, 'id'), Object.keys(body).join(','));
    res.json({ ok: true });
  }),
);

studiesRouter.post(
  '/studies/:id/analyze',
  asyncHandler(async (req, res) => {
    const report = await runAiAnalysis(getDb(), param(req, 'id'), config.ai.model);
    res.json(report);
  }),
);

studiesRouter.put(
  '/studies/:id/findings/:findingId',
  asyncHandler(async (req, res) => {
    const body = parseBody(
      z.object({
        verdict: z.enum(VERDICTS as [string, ...string[]]).optional(),
        verdictReason: z.string().max(2000).optional(),
        notes: z.string().max(4000).optional(),
        gap: z.string().max(2000).optional(),
        facts: z.string().max(4000).optional(),
        inference: z.string().max(4000).optional(),
        calculation: z.string().max(4000).optional(),
        reason: z.string().min(3, 'سبب التعديل مطلوب لتسجيله في سجل المراجعات').max(1000),
        actor: z.string().max(150).default('مراجع محلي'),
      }),
      req.body,
    );
    const { reason, actor, ...patch } = body;
    updateFinding(getDb(), {
      studyId: param(req, 'id'),
      findingId: param(req, 'findingId'),
      patch,
      reason,
      actor,
    });
    res.json({ ok: true });
  }),
);

studiesRouter.post(
  '/studies/:id/conflicts/resolve',
  asyncHandler(async (req, res) => {
    const body = parseBody(
      z.object({
        conflictKey: z.string().min(1),
        note: z.string().min(10, 'سجّل توجيه اللجنة الذي يحسم التعارض'),
        actor: z.string().max(150).default('مراجع محلي'),
      }),
      req.body,
    );
    const study = resolveConflict(getDb(), {
      studyId: param(req, 'id'),
      conflictKey: body.conflictKey,
      note: body.note,
      actor: body.actor,
    });
    res.json({ ok: true, ready: study.ready === 1 });
  }),
);

studiesRouter.post(
  '/studies/:id/finalize',
  asyncHandler(async (req, res) => {
    const study = finalizeStudy(getDb(), param(req, 'id'));
    res.json({ ok: true, status: study.status, finalizedAt: study.finalized_at });
  }),
);

studiesRouter.get(
  '/studies/:id/export.html',
  asyncHandler(async (req, res) => {
    const model = buildStudyExportModel(getDb(), param(req, 'id'));
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(renderStudyHtml(model));
  }),
);

studiesRouter.get(
  '/studies/:id/export.docx',
  asyncHandler(async (req, res) => {
    const model = buildStudyExportModel(getDb(), param(req, 'id'));
    const buffer = await renderStudyDocx(model);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(`دراسة-${model.request.refNo}-v${model.study.version}.docx`)}`,
    );
    res.send(buffer);
  }),
);
