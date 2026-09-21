import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../db.js';
import { asyncHandler, parseBody, scopeOf, param } from '../lib/http.js';
import { HttpError, audit, newId, nowIso, parseJson } from '../lib/util.js';
import { aiStatus } from '../services/ai/provider.js';

export const settingsRouter = Router();

const DEFAULT_SETTINGS: Record<string, string> = {
  'org.university': 'جامعة الجوف',
  'org.college': 'كلية العلوم الطبية التطبيقية',
  'org.department': 'قسم علوم المختبرات الإكلينيكية',
  'org.committee': 'اللجنة العلمية',
  'org.reviewer': '',
};

settingsRouter.get(
  '/settings',
  asyncHandler(async (_req, res) => {
    const db = getDb();
    const rows = db.prepare<[], { key: string; value: string }>(`SELECT key, value FROM settings`).all();
    const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    res.json({ settings: { ...DEFAULT_SETTINGS, ...stored }, ai: aiStatus() });
  }),
);

settingsRouter.put(
  '/settings',
  asyncHandler(async (req, res) => {
    const body = parseBody(z.record(z.string(), z.string().max(300)), req.body);
    const db = getDb();
    const at = nowIso();
    const upsert = db.prepare(
      `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    );
    db.transaction(() => {
      for (const [key, value] of Object.entries(body)) upsert.run(key, value, at);
    })();
    audit('settings.update', 'settings', '', Object.keys(body).join(','));
    const rows = db.prepare<[], { key: string; value: string }>(`SELECT key, value FROM settings`).all();
    res.json({ settings: { ...DEFAULT_SETTINGS, ...Object.fromEntries(rows.map((r) => [r.key, r.value])) } });
  }),
);

settingsRouter.get(
  '/ai/status',
  asyncHandler(async (_req, res) => {
    res.json(aiStatus());
  }),
);

// --- request types ---------------------------------------------------------

const requestTypeSchema = z.object({
  name: z.string().min(2, 'اسم النوع مطلوب').max(150),
  track: z.string().min(1, 'اختر مسار النوع — لا تُطبَّق ضوابط مسار على مسار آخر').max(60),
  description: z.string().max(1000).default(''),
  checklist: z.array(z.string().min(1).max(200)).default([]),
  active: z.boolean().default(true),
  scope: z.enum(['real', 'demo']).default('real'),
});

settingsRouter.get(
  '/request-types',
  asyncHandler(async (req, res) => {
    const db = getDb();
    const rows = db
      .prepare<[string], { id: string; track: string; name: string; description: string; checklist: string; active: number; scope: string }>(
        `SELECT id, track, name, description, checklist, active, scope FROM request_types WHERE scope = ? ORDER BY created_at`,
      )
      .all(scopeOf(req));
    res.json({
      requestTypes: rows.map((row) => ({
        id: row.id,
        track: row.track,
        name: row.name,
        description: row.description,
        checklist: parseJson<string[]>(row.checklist, []),
        active: row.active === 1,
        scope: row.scope,
      })),
    });
  }),
);

settingsRouter.post(
  '/request-types',
  asyncHandler(async (req, res) => {
    const body = parseBody(requestTypeSchema, req.body);
    const db = getDb();
    const id = newId('rt');
    const at = nowIso();
    db.prepare(
      `INSERT INTO request_types (id, track, name, description, checklist, active, scope, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      body.track,
      body.name,
      body.description,
      JSON.stringify(body.checklist),
      body.active ? 1 : 0,
      body.scope,
      at,
      at,
    );
    audit('request_type.create', 'request_type', id, body.name);
    res.status(201).json({ id });
  }),
);

settingsRouter.put(
  '/request-types/:id',
  asyncHandler(async (req, res) => {
    const body = parseBody(requestTypeSchema.partial(), req.body);
    const db = getDb();
    const existing = db.prepare<[string], { id: string }>(`SELECT id FROM request_types WHERE id = ?`).get(param(req, 'id'));
    if (!existing) throw new HttpError(404, 'نوع الطلب غير موجود.');
    const at = nowIso();
    db.prepare(
      `UPDATE request_types SET
         name = COALESCE(?, name),
         track = COALESCE(?, track),
         description = COALESCE(?, description),
         checklist = COALESCE(?, checklist),
         active = COALESCE(?, active),
         updated_at = ?
       WHERE id = ?`,
    ).run(
      body.name ?? null,
      body.track ?? null,
      body.description ?? null,
      body.checklist ? JSON.stringify(body.checklist) : null,
      body.active === undefined ? null : body.active ? 1 : 0,
      at,
      param(req, 'id'),
    );
    audit('request_type.update', 'request_type', param(req, 'id'), body);
    res.json({ ok: true });
  }),
);

settingsRouter.delete(
  '/request-types/:id',
  asyncHandler(async (req, res) => {
    const db = getDb();
    const used = db
      .prepare<[string], { c: number }>(`SELECT COUNT(*) AS c FROM requests WHERE type_id = ?`)
      .get(param(req, 'id'))?.c ?? 0;
    if (used > 0) {
      throw new HttpError(409, `لا يمكن حذف نوع مستخدم في ${used} طلبًا. عطّله بدل حذفه.`);
    }
    db.prepare(`DELETE FROM request_types WHERE id = ?`).run(param(req, 'id'));
    audit('request_type.delete', 'request_type', param(req, 'id'));
    res.json({ ok: true });
  }),
);
