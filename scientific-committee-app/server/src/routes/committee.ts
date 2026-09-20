import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../db.js';
import { asyncHandler, param, parseBody, scopeOf } from '../lib/http.js';
import { HttpError, audit, newId, nowIso } from '../lib/util.js';

export const committeeRouter = Router();

/**
 * Committee composition — the single source of truth for both the attendance
 * table and the signature table of every meeting. Editing a name here changes it
 * in both places, which is the mismatch the source form suffered from.
 */
export function committeeMembers(scope: string) {
  return getDb()
    .prepare<[string], { id: string; ordinal: number; name: string; role: string; active: number; note: string }>(
      `SELECT id, ordinal, name, role, active, note FROM committee_members WHERE scope = ? ORDER BY ordinal, created_at`,
    )
    .all(scope)
    .map((row) => ({
      id: row.id,
      ordinal: row.ordinal,
      name: row.name,
      role: row.role,
      active: row.active === 1,
      note: row.note,
    }));
}

committeeRouter.get(
  '/committee-members',
  asyncHandler(async (req, res) => {
    res.json({
      members: committeeMembers(scopeOf(req)),
      notice:
        'تشكيل اللجنة مصدر واحد لجدول الحضور وجدول التوقيع معًا، فلا يختلف اسم بينهما. حالة الحضور تُسجَّل لكل اجتماع على حدة ولا تُنسخ من اجتماع سابق.',
    });
  }),
);

const memberSchema = z.object({
  name: z.string().min(2, 'اسم العضو مطلوب').max(200),
  role: z.string().max(120).default(''),
  ordinal: z.number().int().nonnegative().default(0),
  note: z.string().max(1000).default(''),
  active: z.boolean().default(true),
  scope: z.enum(['real', 'demo']).default('real'),
});

committeeRouter.post(
  '/committee-members',
  asyncHandler(async (req, res) => {
    const body = parseBody(memberSchema, req.body);
    const db = getDb();
    const at = nowIso();
    const id = newId('mem');
    const ordinal =
      body.ordinal ||
      (db
        .prepare<[string], { m: number | null }>(`SELECT MAX(ordinal) AS m FROM committee_members WHERE scope = ?`)
        .get(body.scope)?.m ?? 0) + 1;
    db.prepare(
      `INSERT INTO committee_members (id, scope, ordinal, name, role, active, note, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(id, body.scope, ordinal, body.name, body.role, body.active ? 1 : 0, body.note, at, at);
    audit('committee.add_member', 'committee_member', id, { scope: body.scope });
    res.status(201).json({ id, ordinal });
  }),
);

committeeRouter.put(
  '/committee-members/:id',
  asyncHandler(async (req, res) => {
    const body = parseBody(memberSchema.partial(), req.body);
    const db = getDb();
    const id = param(req, 'id');
    const result = db
      .prepare(
        `UPDATE committee_members SET name = COALESCE(?, name), role = COALESCE(?, role),
                ordinal = COALESCE(?, ordinal), note = COALESCE(?, note), active = COALESCE(?, active),
                updated_at = ?
          WHERE id = ?`,
      )
      .run(
        body.name ?? null,
        body.role ?? null,
        body.ordinal ?? null,
        body.note ?? null,
        body.active === undefined ? null : body.active ? 1 : 0,
        nowIso(),
        id,
      );
    if (result.changes === 0) throw new HttpError(404, 'العضو غير موجود.');
    audit('committee.update_member', 'committee_member', id, body);
    res.json({ ok: true });
  }),
);

committeeRouter.delete(
  '/committee-members/:id',
  asyncHandler(async (req, res) => {
    const db = getDb();
    const id = param(req, 'id');
    const used = db
      .prepare<[string], { c: number }>(`SELECT COUNT(*) AS c FROM minute_attendance WHERE member_id = ?`)
      .get(id)?.c ?? 0;
    if (used > 0) {
      throw new HttpError(409, `العضو مسجَّل في ${used} محضرًا. عطّله بدل حذفه حتى لا يفقد المحضر سجله.`);
    }
    db.prepare(`DELETE FROM committee_members WHERE id = ?`).run(id);
    res.json({ ok: true });
  }),
);
