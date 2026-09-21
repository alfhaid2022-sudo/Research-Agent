import fs from 'node:fs';
import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../db.js';
import { asyncHandler, parseBody, scopeOf, param } from '../lib/http.js';
import { HttpError, audit, newId, nowIso } from '../lib/util.js';
import { buildMinutesExportModel, renderMinutesHtml } from '../services/export.js';
import { fillMinutesTemplate } from '../services/minutesTemplate.js';
import { resolveStoredPath } from '../services/storage.js';
import { committeeMembers } from './committee.js';
import { renderMinutesDocx } from '../services/docx.js';

export const minutesRouter = Router();

minutesRouter.get(
  '/minutes',
  asyncHandler(async (req, res) => {
    const db = getDb();
    const rows = db
      .prepare<[string], Record<string, unknown>>(
        `SELECT m.*, (SELECT COUNT(*) FROM minute_items i WHERE i.minutes_id = m.id) AS item_count
           FROM minutes m WHERE m.scope = ? ORDER BY m.created_at DESC`,
      )
      .all(scopeOf(req));
    res.json({
      minutes: rows.map((row) => ({
        id: row.id as string,
        title: row.title as string,
        meetingDate: row.meeting_date as string,
        sessionNo: row.session_no as string,
        status: row.status as string,
        scope: row.scope as string,
        itemCount: (row.item_count as number) ?? 0,
        createdAt: row.created_at as string,
      })),
    });
  }),
);

minutesRouter.post(
  '/minutes',
  asyncHandler(async (req, res) => {
    const body = parseBody(
      z.object({
        title: z.string().min(2, 'عنوان المحضر مطلوب').max(250),
        committeeName: z.string().max(200).default(''),
        meetingDate: z.string().max(40).default(''),
        meetingCalendar: z.enum(['', 'gregorian', 'hijri']).default(''),
        meetingTime: z.string().max(40).default(''),
        sessionNo: z.string().max(40).default(''),
        addresseeName: z.string().max(200).default(''),
        addresseeTitle: z.string().max(200).default(''),
        notes: z.string().max(8000).default(''),
        additions: z.string().max(8000).default(''),
        scope: z.enum(['real', 'demo']).default('real'),
      }),
      req.body,
    );
    const db = getDb();
    const id = newId('min');
    const at = nowIso();
    db.prepare(
      `INSERT INTO minutes (id, scope, title, committee_name, meeting_date, meeting_calendar, meeting_time,
                            session_no, addressee_name, addressee_title, addressee_state, status, notes,
                            additions, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_review', 'draft', ?, ?, ?, ?)`,
    ).run(
      id,
      body.scope,
      body.title,
      body.committeeName,
      body.meetingDate,
      body.meetingCalendar,
      body.meetingTime,
      body.sessionNo,
      body.addresseeName,
      body.addresseeTitle,
      body.notes,
      body.additions,
      at,
      at,
    );
    // Attendance rows start unrecorded for every current member: never copied
    // from another meeting and never pre-marked as present.
    const insertAttendance = db.prepare(
      `INSERT OR IGNORE INTO minute_attendance (id, minutes_id, member_id, state) VALUES (?, ?, ?, 'unrecorded')`,
    );
    for (const member of committeeMembers(body.scope)) {
      insertAttendance.run(newId('att'), id, member.id);
    }
    audit('minutes.create', 'minutes', id, body.title);
    res.status(201).json({ id });
  }),
);

minutesRouter.get(
  '/minutes/:id',
  asyncHandler(async (req, res) => {
    const db = getDb();
    const minutes = db.prepare<[string], Record<string, unknown>>(`SELECT * FROM minutes WHERE id = ?`).get(param(req, 'id'));
    if (!minutes) throw new HttpError(404, 'المحضر غير موجود.');
    const items = db
      .prepare<[string], Record<string, unknown>>(
        `SELECT i.*, r.ref_no, r.title AS request_title, s.version AS study_version, s.status AS study_status
           FROM minute_items i
           LEFT JOIN requests r ON r.id = i.request_id
           LEFT JOIN studies s ON s.id = i.study_id
          WHERE i.minutes_id = ? ORDER BY i.ordinal`,
      )
      .all(param(req, 'id'));

    const scope = String(minutes.scope);
    const members = committeeMembers(scope);
    const attendanceRows = db
      .prepare<[string], { member_id: string; state: string; absence_reason: string; recorded_by: string; recorded_at: string }>(
        `SELECT member_id, state, absence_reason, recorded_by, recorded_at FROM minute_attendance WHERE minutes_id = ?`,
      )
      .all(param(req, 'id'));
    const byMember = new Map(attendanceRows.map((row) => [row.member_id, row]));
    // Attendance and signatures are both projected from the one composition list.
    const attendance = members.map((member) => {
      const row = byMember.get(member.id);
      return {
        memberId: member.id,
        ordinal: member.ordinal,
        name: member.name,
        role: member.role,
        state: row?.state ?? 'unrecorded',
        absenceReason: row?.absence_reason ?? '',
        recordedBy: row?.recorded_by ?? '',
        recordedAt: row?.recorded_at ?? '',
      };
    });
    res.json({
      minutes: {
        id: minutes.id as string,
        title: minutes.title as string,
        committeeName: (minutes.committee_name as string) ?? '',
        meetingDate: minutes.meeting_date as string,
        meetingCalendar: (minutes.meeting_calendar as string) ?? '',
        meetingTime: (minutes.meeting_time as string) ?? '',
        sessionNo: minutes.session_no as string,
        addresseeName: (minutes.addressee_name as string) ?? '',
        addresseeTitle: (minutes.addressee_title as string) ?? '',
        addresseeState: (minutes.addressee_state as string) ?? 'pending_review',
        status: minutes.status as string,
        notes: minutes.notes as string,
        additions: (minutes.additions as string) ?? '',
        scope: minutes.scope as string,
        createdAt: minutes.created_at as string,
      },
      attendance,
      signatures: attendance.map((row) => ({
        memberId: row.memberId,
        ordinal: row.ordinal,
        name: row.name,
        role: row.role,
        signature: '',
      })),
      structureNotice:
        'ترتيب أقسام المحضر مطابق لهيكل النموذج المطلوب، غير أن مطابقة تنسيق النموذج الرسمي لم تُعتمد بعد لعدم استلام ملف القالب والتحقق منه. التوقيعات والقرارات والاعتماد لا تُنشأ آليًا.',
      items: items.map((item) => ({
        id: item.id as string,
        ordinal: item.ordinal as number,
        requestId: (item.request_id as string | null) ?? null,
        studyId: (item.study_id as string | null) ?? null,
        refNo: (item.ref_no as string | null) ?? '',
        requestTitle: (item.request_title as string | null) ?? '',
        studyVersion: (item.study_version as number | null) ?? null,
        studyStatus: (item.study_status as string | null) ?? '',
        subject: (item.subject as string) ?? '',
        body: item.body as string,
        decision: (item.decision as string) ?? '',
        relatedEntity: (item.related_entity as string) ?? '',
      })),
    });
  }),
);

minutesRouter.put(
  '/minutes/:id',
  asyncHandler(async (req, res) => {
    const body = parseBody(
      z.object({
        title: z.string().min(2).max(250).optional(),
        committeeName: z.string().max(200).optional(),
        meetingDate: z.string().max(40).optional(),
        meetingCalendar: z.enum(['', 'gregorian', 'hijri']).optional(),
        meetingTime: z.string().max(40).optional(),
        sessionNo: z.string().max(40).optional(),
        addresseeName: z.string().max(200).optional(),
        addresseeTitle: z.string().max(200).optional(),
        addresseeState: z.enum(['pending_review', 'confirmed']).optional(),
        notes: z.string().max(8000).optional(),
        additions: z.string().max(8000).optional(),
      }),
      req.body,
    );
    const db = getDb();
    db.prepare(
      `UPDATE minutes SET title = COALESCE(?, title), committee_name = COALESCE(?, committee_name),
              meeting_date = COALESCE(?, meeting_date), meeting_calendar = COALESCE(?, meeting_calendar),
              meeting_time = COALESCE(?, meeting_time), session_no = COALESCE(?, session_no),
              addressee_name = COALESCE(?, addressee_name), addressee_title = COALESCE(?, addressee_title),
              addressee_state = COALESCE(?, addressee_state), notes = COALESCE(?, notes),
              additions = COALESCE(?, additions), updated_at = ?
        WHERE id = ?`,
    ).run(
      body.title ?? null,
      body.committeeName ?? null,
      body.meetingDate ?? null,
      body.meetingCalendar ?? null,
      body.meetingTime ?? null,
      body.sessionNo ?? null,
      body.addresseeName ?? null,
      body.addresseeTitle ?? null,
      body.addresseeState ?? null,
      body.notes ?? null,
      body.additions ?? null,
      nowIso(),
      param(req, 'id'),
    );
    res.json({ ok: true });
  }),
);

/** Pulls a study's draft minute item into the minutes. It never invents attendance or a decision. */
minutesRouter.post(
  '/minutes/:id/items',
  asyncHandler(async (req, res) => {
    const body = parseBody(
      z.object({
        studyId: z.string().min(1).optional(),
        subject: z.string().max(400).optional(),
        body: z.string().max(20000).optional(),
        decision: z.string().max(20000).optional(),
        relatedEntity: z.string().max(200).optional(),
      }),
      req.body,
    );
    const db = getDb();
    const minutes = db
      .prepare<[string], { id: string; scope: string }>(`SELECT id, scope FROM minutes WHERE id = ?`)
      .get(param(req, 'id'));
    if (!minutes) throw new HttpError(404, 'المحضر غير موجود.');

    const ordinalOf = () =>
      (db
        .prepare<[string], { m: number | null }>(`SELECT MAX(ordinal) AS m FROM minute_items WHERE minutes_id = ?`)
        .get(param(req, 'id'))?.m ?? 0) + 1;

    // An agenda item may exist without a study; a study-backed item carries its draft.
    if (!body.studyId) {
      if (!body.subject && !body.body) {
        throw new HttpError(400, 'أدخل موضوع البند أو اختر دراسة مرتبطة به.');
      }
      const agendaId = newId('mi');
      db.prepare(
        `INSERT INTO minute_items (id, minutes_id, request_id, study_id, ordinal, subject, body, decision, related_entity, created_at)
         VALUES (?, ?, NULL, NULL, ?, ?, ?, ?, ?, ?)`,
      ).run(
        agendaId,
        param(req, 'id'),
        ordinalOf(),
        body.subject ?? '',
        body.body ?? '',
        body.decision ?? '',
        body.relatedEntity ?? '',
        nowIso(),
      );
      audit('minutes.add_item', 'minutes', param(req, 'id'), { agenda: true });
      res.status(201).json({ id: agendaId });
      return;
    }

    const study = db
      .prepare<[string], { id: string; request_id: string; minute_draft: string; summary: string; recommendation: string; status: string }>(
        `SELECT id, request_id, minute_draft, summary, recommendation, status FROM studies WHERE id = ?`,
      )
      .get(body.studyId);
    if (!study) throw new HttpError(404, 'الدراسة غير موجودة.');

    const request = db
      .prepare<[string], { scope: string; ref_no: string; title: string }>(
        `SELECT scope, ref_no, title FROM requests WHERE id = ?`,
      )
      .get(study.request_id);
    if (!request) throw new HttpError(404, 'طلب الدراسة غير موجود.');
    if (request.scope !== minutes.scope) {
      throw new HttpError(400, 'لا يجوز إدراج دراسة من نطاق مختلف (تجريبي مقابل فعلي) في هذا المحضر.');
    }

    const duplicate = db
      .prepare<[string, string], { id: string }>(`SELECT id FROM minute_items WHERE minutes_id = ? AND study_id = ?`)
      .get(param(req, 'id'), body.studyId);
    if (duplicate) throw new HttpError(409, 'هذه الدراسة مدرجة في المحضر بالفعل.');

    const ordinal = ordinalOf();

    const text =
      body.body?.trim() ||
      study.minute_draft.trim() ||
      [
        study.summary ? `ملخص الطلب: ${study.summary}` : '',
        study.recommendation ? `التوصية المبدئية المعروضة على اللجنة: ${study.recommendation}` : '',
        study.status === 'final' ? '' : 'تنبيه: الدراسة المرتبطة ما زالت مسودة غير نهائية.',
      ]
        .filter(Boolean)
        .join('\n') ||
      'لم تُسجَّل مسودة بند لهذه الدراسة بعد.';

    const id = newId('mi');
    db.prepare(
      `INSERT INTO minute_items (id, minutes_id, request_id, study_id, ordinal, subject, body, decision, related_entity, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, '', ?, ?)`,
    ).run(
      id,
      param(req, 'id'),
      study.request_id,
      study.id,
      ordinal,
      body.subject?.trim() || `طلب رقم ${request.ref_no} — ${request.title}`,
      text,
      body.relatedEntity ?? '',
      nowIso(),
    );
    db.prepare(`UPDATE requests SET status = 'in_minutes', updated_at = ? WHERE id = ? AND status = 'studied'`).run(
      nowIso(),
      study.request_id,
    );
    audit('minutes.add_item', 'minutes', param(req, 'id'), { studyId: study.id, refNo: request.ref_no });
    res.status(201).json({ id, ordinal });
  }),
);

minutesRouter.put(
  '/minutes/:id/items/:itemId',
  asyncHandler(async (req, res) => {
    const body = parseBody(
      z.object({
        subject: z.string().max(400).optional(),
        body: z.string().max(20000).optional(),
        decision: z.string().max(20000).optional(),
        relatedEntity: z.string().max(200).optional(),
      }),
      req.body,
    );
    const db = getDb();
    const result = db
      .prepare(
        `UPDATE minute_items SET subject = COALESCE(?, subject), body = COALESCE(?, body),
                decision = COALESCE(?, decision), related_entity = COALESCE(?, related_entity)
          WHERE id = ? AND minutes_id = ?`,
      )
      .run(
        body.subject ?? null,
        body.body ?? null,
        body.decision ?? null,
        body.relatedEntity ?? null,
        param(req, 'itemId'),
        param(req, 'id'),
      );
    if (result.changes === 0) throw new HttpError(404, 'البند غير موجود في هذا المحضر.');
    res.json({ ok: true });
  }),
);

minutesRouter.delete(
  '/minutes/:id/items/:itemId',
  asyncHandler(async (req, res) => {
    getDb().prepare(`DELETE FROM minute_items WHERE id = ? AND minutes_id = ?`).run(param(req, 'itemId'), param(req, 'id'));
    res.json({ ok: true });
  }),
);

/** Records attendance for one member in one meeting. Nothing is ever pre-marked. */
minutesRouter.put(
  '/minutes/:id/attendance/:memberId',
  asyncHandler(async (req, res) => {
    const body = parseBody(
      z.object({
        state: z.enum(['unrecorded', 'present', 'absent']),
        absenceReason: z.string().max(500).default(''),
        recordedBy: z.string().max(150).default(''),
      }),
      req.body,
    );
    if (body.state === 'absent' && body.absenceReason.trim().length === 0) {
      throw new HttpError(400, 'سجّل سبب التغيب كما يطلبه النموذج.');
    }
    const db = getDb();
    const minutesId = param(req, 'id');
    const memberId = param(req, 'memberId');
    const member = db
      .prepare<[string], { id: string; scope: string }>(`SELECT id, scope FROM committee_members WHERE id = ?`)
      .get(memberId);
    if (!member) throw new HttpError(404, 'العضو غير موجود في تشكيل اللجنة.');
    const minutes = db
      .prepare<[string], { id: string; scope: string }>(`SELECT id, scope FROM minutes WHERE id = ?`)
      .get(minutesId);
    if (!minutes) throw new HttpError(404, 'المحضر غير موجود.');
    if (minutes.scope !== member.scope) throw new HttpError(400, 'العضو يتبع نطاقًا مختلفًا عن المحضر.');

    const at = nowIso();
    const existing = db
      .prepare<[string, string], { id: string }>(
        `SELECT id FROM minute_attendance WHERE minutes_id = ? AND member_id = ?`,
      )
      .get(minutesId, memberId);
    if (existing) {
      db.prepare(
        `UPDATE minute_attendance SET state = ?, absence_reason = ?, recorded_by = ?, recorded_at = ? WHERE id = ?`,
      ).run(body.state, body.absenceReason, body.recordedBy, at, existing.id);
    } else {
      db.prepare(
        `INSERT INTO minute_attendance (id, minutes_id, member_id, state, absence_reason, recorded_by, recorded_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ).run(newId('att'), minutesId, memberId, body.state, body.absenceReason, body.recordedBy, at);
    }
    audit('minutes.attendance', 'minutes', minutesId, { memberId, state: body.state });
    res.json({ ok: true });
  }),
);

minutesRouter.get(
  '/minutes/:id/export.html',
  asyncHandler(async (req, res) => {
    const model = buildMinutesExportModel(getDb(), param(req, 'id'));
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(renderMinutesHtml(model));
  }),
);

/** Locates the official template registered for a scope. */
function officialTemplate(scope: string): { id: string; title: string; storedName: string; fileName: string } {
  const row = getDb()
    .prepare<[string], { id: string; title: string; stored_name: string; file_name: string }>(
      `SELECT id, title, stored_name, file_name FROM sources
        WHERE scope = ? AND is_official_template = 1 AND stored_name <> ''
        ORDER BY created_at DESC LIMIT 1`,
    )
    .get(scope);
  if (!row) {
    throw new HttpError(
      409,
      'النموذج الرسمي لم يضف بعد في هذا النطاق، فلا يمكن التصدير عليه. ارفعه في شاشة النماذج، أو استخدم تصدير المسودة العامة.',
    );
  }
  return { id: row.id, title: row.title, storedName: row.stored_name, fileName: row.file_name };
}

/** Reports what a template export would fill, without producing the file. */
minutesRouter.get(
  '/minutes/:id/template-check',
  asyncHandler(async (req, res) => {
    const db = getDb();
    const model = buildMinutesExportModel(db, param(req, 'id'));
    let template: ReturnType<typeof officialTemplate>;
    try {
      template = officialTemplate(model.scope);
    } catch (error) {
      res.json({ available: false, reason: (error as HttpError).message });
      return;
    }
    try {
      const { report } = await fillMinutesTemplate(
        fs.readFileSync(resolveStoredPath(template.storedName)),
        model,
      );
      res.json({ available: true, templateTitle: template.title, fileName: template.fileName, report });
    } catch (error) {
      res.json({ available: false, reason: (error as Error).message, templateTitle: template.title });
    }
  }),
);

/**
 * Exports onto the institution's own template file: every part except
 * word/document.xml is carried over untouched.
 */
minutesRouter.get(
  '/minutes/:id/export-template.docx',
  asyncHandler(async (req, res) => {
    const db = getDb();
    const model = buildMinutesExportModel(db, param(req, 'id'));
    const template = officialTemplate(model.scope);
    const { buffer, report } = await fillMinutesTemplate(
      fs.readFileSync(resolveStoredPath(template.storedName)),
      model,
    );
    audit('minutes.export_template', 'minutes', param(req, 'id'), {
      sourceId: template.id,
      deviations: report.deviations.length,
      warnings: report.warnings.length,
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(`محضر-${model.sessionNo || 'بدون-رقم'}-على-النموذج.docx`)}`,
    );
    res.send(buffer);
  }),
);

minutesRouter.get(
  '/minutes/:id/export.docx',
  asyncHandler(async (req, res) => {
    const model = buildMinutesExportModel(getDb(), param(req, 'id'));
    const buffer = await renderMinutesDocx(model);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(`مسودة-محضر-${model.title}.docx`)}`);
    res.send(buffer);
  }),
);
