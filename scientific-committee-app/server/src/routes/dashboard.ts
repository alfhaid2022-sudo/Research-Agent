import { Router } from 'express';
import { getDb } from '../db.js';
import { asyncHandler, scopeOf } from '../lib/http.js';
import { aiStatus } from '../services/ai/provider.js';

export const dashboardRouter = Router();

dashboardRouter.get(
  '/dashboard',
  asyncHandler(async (req, res) => {
    const db = getDb();
    const scope = scopeOf(req);

    const statusRows = db
      .prepare<[string], { status: string; c: number }>(
        `SELECT status, COUNT(*) AS c FROM requests WHERE scope = ? GROUP BY status`,
      )
      .all(scope);

    const requirementRows = db
      .prepare<[string], { status: string; c: number }>(
        `SELECT status, COUNT(*) AS c FROM requirements WHERE scope = ? GROUP BY status`,
      )
      .all(scope);

    const sources = db
      .prepare<[string], { total: number; templates: number; needs_ocr: number }>(
        `SELECT COUNT(*) AS total,
                SUM(CASE WHEN is_official_template = 1 THEN 1 ELSE 0 END) AS templates,
                SUM(CASE WHEN extraction_status IN ('needs_ocr','failed','unsupported') THEN 1 ELSE 0 END) AS needs_ocr
           FROM sources WHERE scope = ?`,
      )
      .get(scope) ?? { total: 0, templates: 0, needs_ocr: 0 };

    const draftStudies = db
      .prepare<[string], Record<string, unknown>>(
        `SELECT s.id, s.version, s.ready, s.updated_at, r.ref_no, r.title
           FROM studies s JOIN requests r ON r.id = s.request_id
          WHERE r.scope = ? AND s.status = 'draft'
          ORDER BY s.updated_at DESC LIMIT 10`,
      )
      .all(scope);

    const awaitingCompletion = db
      .prepare<[string], Record<string, unknown>>(
        `SELECT r.id, r.ref_no, r.title,
                (SELECT COUNT(*) FROM attachments a WHERE a.request_id = r.id) AS attachment_count
           FROM requests r
          WHERE r.scope = ? AND r.status IN ('new','awaiting_completion')
          ORDER BY r.created_at DESC LIMIT 10`,
      )
      .all(scope);

    const minutesCount = db
      .prepare<[string], { c: number }>(`SELECT COUNT(*) AS c FROM minutes WHERE scope = ?`)
      .get(scope)?.c ?? 0;

    const setup = [
      {
        key: 'official_template',
        label: 'النموذج الرسمي',
        ok: (sources.templates ?? 0) > 0,
        detail:
          (sources.templates ?? 0) > 0
            ? 'النموذج الرسمي مسجَّل، وربط الحقول بالقالب لم يُعتمد بعد.'
            : 'النموذج الرسمي لم يضف بعد.',
      },
      {
        key: 'regulations',
        label: 'مكتبة اللوائح',
        ok: (sources.total ?? 0) - (sources.templates ?? 0) > 0,
        detail: `${(sources.total ?? 0) - (sources.templates ?? 0)} مصدرًا نظاميًا مرفوعًا.`,
      },
      {
        key: 'requirements',
        label: 'اعتماد المتطلبات',
        ok: (requirementRows.find((r) => r.status === 'approved')?.c ?? 0) > 0,
        detail: `${requirementRows.find((r) => r.status === 'candidate')?.c ?? 0} متطلبًا مرشحًا بانتظار المراجعة، و${
          requirementRows.find((r) => r.status === 'approved')?.c ?? 0
        } معتمدًا.`,
      },
      {
        key: 'request_types',
        label: 'أنواع الطلبات',
        ok:
          (db
            .prepare<[string], { c: number }>(`SELECT COUNT(*) AS c FROM request_types WHERE scope = ? AND active = 1`)
            .get(scope)?.c ?? 0) > 0,
        detail: 'أنواع الطلبات قابلة للإعداد من شاشة الإعدادات.',
      },
    ];

    res.json({
      scope,
      requestsByStatus: Object.fromEntries(statusRows.map((r) => [r.status, r.c])),
      requirementsByStatus: Object.fromEntries(requirementRows.map((r) => [r.status, r.c])),
      sources: { total: sources.total ?? 0, templates: sources.templates ?? 0, needsOcr: sources.needs_ocr ?? 0 },
      minutesCount,
      setup,
      ai: aiStatus(),
      draftStudies: draftStudies.map((s) => ({
        id: s.id as string,
        version: s.version as number,
        ready: s.ready === 1,
        updatedAt: s.updated_at as string,
        refNo: s.ref_no as string,
        title: s.title as string,
      })),
      awaitingCompletion: awaitingCompletion.map((r) => ({
        id: r.id as string,
        refNo: r.ref_no as string,
        title: r.title as string,
        attachmentCount: (r.attachment_count as number) ?? 0,
      })),
    });
  }),
);
