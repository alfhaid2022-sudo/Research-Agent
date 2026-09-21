import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../db.js';
import { asyncHandler, param, parseBody } from '../lib/http.js';
import { HttpError, audit, newId, nowIso } from '../lib/util.js';

export const dossierRouter = Router();

/**
 * Journal/venue classification is stored as (source, type, value, year).
 *
 * The type matters: a quartile (Q1/Q2) and a reward category (أ/ب/ج) are different
 * scales from different documents. The app never converts one into the other.
 */
export const CLASSIFICATION_TYPES = ['quartile', 'reward_category', 'other'] as const;
export const CLASSIFICATION_TYPE_LABELS: Record<string, string> = {
  quartile: 'ربع تصنيفي (Q1/Q2/Q3/Q4)',
  reward_category: 'فئة مكافأة (أ/ب/ج)',
  other: 'تصنيف آخر',
};

const CALENDARS = ['', 'gregorian', 'hijri', 'academic_year'] as const;
const APPROVAL_STATES = ['unrecorded', 'pending', 'approved', 'rejected'] as const;

export const APPROVAL_LABELS: Record<string, string> = {
  unrecorded: 'لم يُسجَّل',
  pending: 'قيد الإجراء',
  approved: 'موافَق',
  rejected: 'غير موافَق',
};

function ensureRequest(requestId: string): void {
  const exists = getDb().prepare<[string], { id: string }>(`SELECT id FROM requests WHERE id = ?`).get(requestId);
  if (!exists) throw new HttpError(404, 'الطلب غير موجود.');
}

// --------------------------------------------------------- publications ---

const publicationSchema = z.object({
  title: z.string().min(2, 'عنوان البحث مطلوب').max(400),
  venue: z.string().max(300).default(''),
  authorOrder: z.number().int().positive().optional(),
  isFirstAuthor: z.boolean().default(false),
  affiliation: z.string().max(300).default(''),
  soleAffiliation: z.boolean().default(false),
  status: z.string().max(60).default(''),
  statusDate: z.string().max(60).default(''),
  statusCalendar: z.enum(CALENDARS).default(''),
  gregorianYear: z.string().max(10).default(''),
  academicYear: z.string().max(40).default(''),
  classificationSource: z.string().max(120).default(''),
  classificationType: z.enum(CLASSIFICATION_TYPES).default('other'),
  classificationValue: z.string().max(60).default(''),
  classificationYear: z.string().max(10).default(''),
  evidenceAttachmentId: z.string().optional(),
  note: z.string().max(2000).default(''),
});

dossierRouter.get(
  '/requests/:id/publications',
  asyncHandler(async (req, res) => {
    const rows = getDb()
      .prepare<[string], Record<string, unknown>>(
        `SELECT * FROM publications WHERE request_id = ? ORDER BY created_at`,
      )
      .all(param(req, 'id'));
    res.json({ publications: rows.map(mapPublication), classificationTypes: CLASSIFICATION_TYPE_LABELS });
  }),
);

dossierRouter.post(
  '/requests/:id/publications',
  asyncHandler(async (req, res) => {
    const requestId = param(req, 'id');
    ensureRequest(requestId);
    const body = parseBody(publicationSchema, req.body);
    const db = getDb();
    if (body.evidenceAttachmentId) {
      const attachment = db
        .prepare<[string], { request_id: string }>(`SELECT request_id FROM attachments WHERE id = ?`)
        .get(body.evidenceAttachmentId);
      if (!attachment || attachment.request_id !== requestId) {
        throw new HttpError(400, 'المرفق المحدد لا يعود إلى هذا الطلب.');
      }
    }
    const id = newId('pub');
    db.prepare(
      `INSERT INTO publications (id, request_id, title, venue, author_order, is_first_author, affiliation,
                                 sole_affiliation, status, status_date, status_calendar, gregorian_year,
                                 academic_year, classification_source, classification_type, classification_value,
                                 classification_year, evidence_attachment_id, note, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      requestId,
      body.title,
      body.venue,
      body.authorOrder ?? null,
      body.isFirstAuthor ? 1 : 0,
      body.affiliation,
      body.soleAffiliation ? 1 : 0,
      body.status,
      body.statusDate,
      body.statusCalendar,
      body.gregorianYear,
      body.academicYear,
      body.classificationSource,
      body.classificationType,
      body.classificationValue,
      body.classificationYear,
      body.evidenceAttachmentId ?? null,
      body.note,
      nowIso(),
    );
    audit('publication.create', 'publication', id, { requestId });
    res.status(201).json({ id });
  }),
);

dossierRouter.delete(
  '/publications/:id',
  asyncHandler(async (req, res) => {
    getDb().prepare(`DELETE FROM publications WHERE id = ?`).run(param(req, 'id'));
    res.json({ ok: true });
  }),
);

// -------------------------------------------------------- participations ---

const participationSchema = z.object({
  eventName: z.string().min(2, 'اسم الفعالية مطلوب').max(300),
  eventPlace: z.string().max(200).default(''),
  organizer: z.string().max(200).default(''),
  participationKind: z.string().max(120).default(''),
  startDate: z.string().max(60).default(''),
  endDate: z.string().max(60).default(''),
  dateCalendar: z.enum(CALENDARS).default(''),
  academicYear: z.string().max(40).default(''),
  approvalState: z.enum(APPROVAL_STATES).default('unrecorded'),
  approvalNote: z.string().max(1000).default(''),
  note: z.string().max(2000).default(''),
});

dossierRouter.get(
  '/requests/:id/participations',
  asyncHandler(async (req, res) => {
    const rows = getDb()
      .prepare<[string], Record<string, unknown>>(
        `SELECT * FROM participations WHERE request_id = ? ORDER BY created_at`,
      )
      .all(param(req, 'id'));
    res.json({ participations: rows.map(mapParticipation), approvalLabels: APPROVAL_LABELS });
  }),
);

dossierRouter.post(
  '/requests/:id/participations',
  asyncHandler(async (req, res) => {
    const requestId = param(req, 'id');
    ensureRequest(requestId);
    const body = parseBody(participationSchema, req.body);
    const id = newId('prt');
    getDb()
      .prepare(
        `INSERT INTO participations (id, request_id, event_name, event_place, organizer, participation_kind,
                                     start_date, end_date, date_calendar, academic_year, approval_state,
                                     approval_note, note, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        id,
        requestId,
        body.eventName,
        body.eventPlace,
        body.organizer,
        body.participationKind,
        body.startDate,
        body.endDate,
        body.dateCalendar,
        body.academicYear,
        body.approvalState,
        body.approvalNote,
        body.note,
        nowIso(),
      );
    audit('participation.create', 'participation', id, { requestId });
    res.status(201).json({ id });
  }),
);

dossierRouter.delete(
  '/participations/:id',
  asyncHandler(async (req, res) => {
    getDb().prepare(`DELETE FROM participations WHERE id = ?`).run(param(req, 'id'));
    res.json({ ok: true });
  }),
);

// ---------------------------------------------------------- award claims ---

const awardSchema = z.object({
  achievementKind: z.string().max(120).default(''),
  achievementTitle: z.string().min(2, 'وصف الإنجاز مطلوب').max(400),
  achievementDate: z.string().max(60).default(''),
  dateCalendar: z.enum(CALENDARS).default(''),
  sharePercent: z.string().max(40).default(''),
  shareBasis: z.string().max(400).default(''),
  departmentApproval: z.enum(APPROVAL_STATES).default('unrecorded'),
  collegeApproval: z.enum(APPROVAL_STATES).default('unrecorded'),
  councilApproval: z.enum(APPROVAL_STATES).default('unrecorded'),
  financialReference: z.string().max(400).default(''),
  note: z.string().max(2000).default(''),
});

dossierRouter.get(
  '/requests/:id/award-claims',
  asyncHandler(async (req, res) => {
    const rows = getDb()
      .prepare<[string], Record<string, unknown>>(
        `SELECT * FROM award_claims WHERE request_id = ? ORDER BY created_at`,
      )
      .all(param(req, 'id'));
    res.json({
      awardClaims: rows.map(mapAward),
      approvalLabels: APPROVAL_LABELS,
      notice:
        'التطبيق يسجّل الإنجاز وحصته والموافقات والمرجع المالي فقط. لا يُحتسب أي صرف ولا تُشتق نسبة من تصنيف المجلة.',
    });
  }),
);

dossierRouter.post(
  '/requests/:id/award-claims',
  asyncHandler(async (req, res) => {
    const requestId = param(req, 'id');
    ensureRequest(requestId);
    const body = parseBody(awardSchema, req.body);
    const id = newId('awd');
    getDb()
      .prepare(
        `INSERT INTO award_claims (id, request_id, achievement_kind, achievement_title, achievement_date,
                                   date_calendar, share_percent, share_basis, department_approval,
                                   college_approval, council_approval, financial_reference, note, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        id,
        requestId,
        body.achievementKind,
        body.achievementTitle,
        body.achievementDate,
        body.dateCalendar,
        body.sharePercent,
        body.shareBasis,
        body.departmentApproval,
        body.collegeApproval,
        body.councilApproval,
        body.financialReference,
        body.note,
        nowIso(),
      );
    audit('award_claim.create', 'award_claim', id, { requestId });
    res.status(201).json({ id });
  }),
);

dossierRouter.delete(
  '/award-claims/:id',
  asyncHandler(async (req, res) => {
    getDb().prepare(`DELETE FROM award_claims WHERE id = ?`).run(param(req, 'id'));
    res.json({ ok: true });
  }),
);

function mapPublication(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    title: row.title as string,
    venue: row.venue as string,
    authorOrder: (row.author_order as number | null) ?? null,
    isFirstAuthor: row.is_first_author === 1,
    affiliation: row.affiliation as string,
    soleAffiliation: row.sole_affiliation === 1,
    status: row.status as string,
    statusDate: row.status_date as string,
    statusCalendar: row.status_calendar as string,
    gregorianYear: row.gregorian_year as string,
    academicYear: row.academic_year as string,
    classificationSource: row.classification_source as string,
    classificationType: row.classification_type as string,
    classificationTypeLabel: CLASSIFICATION_TYPE_LABELS[row.classification_type as string] ?? '',
    classificationValue: row.classification_value as string,
    classificationYear: row.classification_year as string,
    evidenceAttachmentId: (row.evidence_attachment_id as string | null) ?? null,
    note: row.note as string,
  };
}

function mapParticipation(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    eventName: row.event_name as string,
    eventPlace: row.event_place as string,
    organizer: row.organizer as string,
    participationKind: row.participation_kind as string,
    startDate: row.start_date as string,
    endDate: row.end_date as string,
    dateCalendar: row.date_calendar as string,
    academicYear: row.academic_year as string,
    approvalState: row.approval_state as string,
    approvalNote: row.approval_note as string,
    note: row.note as string,
  };
}

function mapAward(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    achievementKind: row.achievement_kind as string,
    achievementTitle: row.achievement_title as string,
    achievementDate: row.achievement_date as string,
    dateCalendar: row.date_calendar as string,
    sharePercent: row.share_percent as string,
    shareBasis: row.share_basis as string,
    departmentApproval: row.department_approval as string,
    collegeApproval: row.college_approval as string,
    councilApproval: row.council_approval as string,
    financialReference: row.financial_reference as string,
    note: row.note as string,
  };
}
