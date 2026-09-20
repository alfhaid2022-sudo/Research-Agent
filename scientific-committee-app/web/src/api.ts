export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

async function handle<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `تعذّر تنفيذ الطلب (${response.status}).`;
    let details: unknown;
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
      details = body?.details;
    } catch {
      /* the body was not JSON; keep the generic message */
    }
    throw new ApiError(response.status, message, details);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

function withScope(path: string, scope?: string): string {
  if (!scope) return path;
  return path.includes('?') ? `${path}&scope=${scope}` : `${path}?scope=${scope}`;
}

export const api = {
  get<T>(path: string, scope?: string): Promise<T> {
    return fetch(withScope(`/api${path}`, scope)).then(handle<T>);
  },
  post<T>(path: string, body?: unknown): Promise<T> {
    return fetch(`/api${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    }).then(handle<T>);
  },
  put<T>(path: string, body: unknown): Promise<T> {
    return fetch(`/api${path}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }).then(handle<T>);
  },
  del<T>(path: string): Promise<T> {
    return fetch(`/api${path}`, { method: 'DELETE' }).then(handle<T>);
  },
  upload<T>(path: string, form: FormData): Promise<T> {
    return fetch(`/api${path}`, { method: 'POST', body: form }).then(handle<T>);
  },
};

// ---- shared types -------------------------------------------------------

export type Scope = 'real' | 'demo';

export interface AiStatus {
  enabled: boolean;
  provider: string;
  model: string;
  baseUrl: string;
  reason: string;
  dataNotice: string;
}

export interface SetupItem { key: string; label: string; ok: boolean; detail: string }

export interface Dashboard {
  scope: Scope;
  requestsByStatus: Record<string, number>;
  requirementsByStatus: Record<string, number>;
  sources: { total: number; templates: number; needsOcr: number };
  minutesCount: number;
  setup: SetupItem[];
  ai: AiStatus;
  draftStudies: Array<{ id: string; version: number; ready: boolean; updatedAt: string; refNo: string; title: string }>;
  awaitingCompletion: Array<{ id: string; refNo: string; title: string; attachmentCount: number }>;
}

export interface TrackRecord {
  slug: string;
  name: string;
  description: string;
  builtin: boolean;
}

export interface RelationRecord {
  id: string;
  track: string;
  kind: string;
  kindLabel: string;
  fromSourceId: string;
  fromTitle: string;
  fromVersion: string;
  toSourceId: string;
  toTitle: string;
  toVersion: string;
  subject: string;
  note: string;
  status: string;
  resolutionNote: string;
  resolvedBy: string;
  resolvedAt: string;
}

export interface CommitteeMember {
  id: string;
  ordinal: number;
  name: string;
  role: string;
  active: boolean;
  note: string;
}

export interface PublicationRecord {
  id: string;
  title: string;
  venue: string;
  authorOrder: number | null;
  isFirstAuthor: boolean;
  affiliation: string;
  soleAffiliation: boolean;
  status: string;
  statusDate: string;
  statusCalendar: string;
  gregorianYear: string;
  academicYear: string;
  classificationSource: string;
  classificationType: string;
  classificationTypeLabel: string;
  classificationValue: string;
  classificationYear: string;
  note: string;
}

export interface ParticipationRecord {
  id: string;
  eventName: string;
  eventPlace: string;
  organizer: string;
  participationKind: string;
  startDate: string;
  endDate: string;
  dateCalendar: string;
  academicYear: string;
  approvalState: string;
  approvalNote: string;
  note: string;
}

export interface AwardClaimRecord {
  id: string;
  achievementKind: string;
  achievementTitle: string;
  achievementDate: string;
  dateCalendar: string;
  sharePercent: string;
  shareBasis: string;
  departmentApproval: string;
  collegeApproval: string;
  councilApproval: string;
  financialReference: string;
  note: string;
}

export const CALENDAR_LABELS: Record<string, string> = {
  '': 'غير محدد',
  gregorian: 'ميلادي',
  hijri: 'هجري',
  academic_year: 'عام دراسي',
};

export const APPROVAL_LABELS: Record<string, string> = {
  unrecorded: 'لم يُسجَّل',
  pending: 'قيد الإجراء',
  approved: 'موافَق',
  rejected: 'غير موافَق',
};

export const ATTENDANCE_LABELS: Record<string, string> = {
  unrecorded: 'لم يُسجَّل',
  present: 'حاضر',
  absent: 'غائب',
};

export const RELATION_KIND_LABELS: Record<string, string> = {
  amends: 'يعدّل',
  supersedes: 'يحلّ محل',
  interprets: 'يفسّر',
  conflicts: 'يتعارض مع',
};

export interface SourceRecord {
  id: string;
  kind: string;
  title: string;
  issuer: string;
  version: string;
  effectiveDate: string;
  referenceNo: string;
  notes: string;
  scope: Scope;
  isOfficialTemplate: boolean;
  fileName: string;
  size: number;
  sha256: string;
  extractionStatus: string;
  extractionNote: string;
  segmentCount: number;
  needsOcrSegments: number;
  needsReviewSegments: number;
  track: string;
  pageCount: number;
  expectedSha256: string;
  intakeStatus: string;
  intakeNote: string;
  createdAt: string;
}

export interface SegmentRecord {
  id: string;
  ordinal: number;
  locator: string;
  page: number | null;
  text: string;
  needsOcr: boolean;
  quality: string;
  qualityNote: string;
  effectiveText: string;
  textOrigin: string;
  usableAsBasis: boolean;
  basisReason: string;
  correctionStatus: string;
}

export interface CorrectionRecord {
  id: string;
  text: string;
  enteredBy: string;
  enteredAt: string;
  status: string;
  reviewedBy: string;
  reviewedAt: string;
  reviewNote: string;
  page: number | null;
}

export interface RequirementRecord {
  id: string;
  sourceId: string;
  sourceTitle: string;
  sourceVersion: string;
  sourceEffectiveDate: string;
  segmentId: string | null;
  text: string;
  quote: string;
  locator: string;
  category: string;
  conflictKey: string;
  conflictValue: string;
  appliesTo: string[];
  tracks: string[];
  page: number | null;
  clause: string;
  applicationDate: string;
  dateCalendar: string;
  status: string;
  origin: string;
  reviewNote: string;
  reviewedBy: string;
  reviewedAt: string;
}

export interface RequestTypeRecord {
  id: string;
  track: string;
  name: string;
  description: string;
  checklist: string[];
  active: boolean;
  scope: Scope;
}

export interface RequestRecord {
  id: string;
  refNo: string;
  typeId: string | null;
  typeName: string;
  title: string;
  applicantName: string;
  applicantUnit: string;
  submittedDate: string;
  submittedCalendar: string;
  academicYear: string;
  track: string;
  summary: string;
  status: string;
  scope: Scope;
  attachmentCount: number;
  studyCount: number;
  latestVersion: number | null;
  createdAt: string;
}

export interface AttachmentRecord {
  id: string;
  label: string;
  fileName: string;
  size: number;
  extractionStatus: string;
  extractionNote: string;
  segmentCount: number;
  createdAt: string;
}

export interface ReadinessItem { key: string; label: string; ok: boolean; blocking: boolean; detail: string }

export const EXTRACTION_EXTRA_LABELS: Record<string, string> = {
  needs_review: 'يحتاج مراجعة بشرية',
};

export interface ConflictSide {
  requirementId: string;
  sourceId: string;
  sourceTitle: string;
  sourceVersion: string;
  effectiveDate: string;
  locator: string;
  value: string;
  text: string;
}

export interface ConflictRecord {
  conflictKey: string;
  sides: ConflictSide[];
  resolutionNote: string;
  resolved: boolean;
}

export interface FindingRecord {
  id: string;
  ordinal: number;
  requirementId: string | null;
  requirementText: string;
  basisSourceTitle: string;
  basisSourceVersion: string;
  basisEffectiveDate: string;
  basisLocator: string;
  basisQuote: string;
  evidenceAttachmentId: string | null;
  evidenceAttachmentName: string;
  evidenceLocator: string;
  evidenceQuote: string;
  verdict: string;
  verdictReason: string;
  facts: string;
  inference: string;
  calculation: string;
  notes: string;
  gap: string;
  validation: { basisVerified?: boolean; evidenceVerified?: boolean; issues?: string[]; downgradedFrom?: string };
  origin: string;
  edited: boolean;
}

export interface StudyRecord {
  id: string;
  requestId: string;
  version: number;
  status: string;
  mode: string;
  ready: boolean;
  readiness: ReadinessItem[];
  conflicts: ConflictRecord[];
  summary: string;
  memo: string;
  recommendation: string;
  completionItems: string[];
  minuteDraft: string;
  aiMeta: {
    acceptedCount?: number;
    rejected?: Array<{ reason: string; requirementId: string | null }>;
    issues?: string[];
    ranAt?: string;
    model?: string;
  };
  createdAt: string;
  updatedAt: string;
  finalizedAt: string;
}

export interface RevisionRecord {
  id: string;
  findingId: string | null;
  field: string;
  oldValue: string;
  newValue: string;
  reason: string;
  actor: string;
  createdAt: string;
}

export interface MinutesRecord {
  id: string;
  title: string;
  committeeName: string;
  meetingDate: string;
  meetingCalendar: string;
  meetingTime: string;
  sessionNo: string;
  addresseeName: string;
  addresseeTitle: string;
  addresseeState: string;
  status: string;
  notes: string;
  additions: string;
  scope: Scope;
  itemCount?: number;
}

export interface AttendanceRow {
  memberId: string;
  ordinal: number;
  name: string;
  role: string;
  state: string;
  absenceReason: string;
  recordedBy: string;
  recordedAt: string;
}

export interface MinuteItemRecord {
  id: string;
  ordinal: number;
  requestId: string | null;
  studyId: string | null;
  refNo: string;
  requestTitle: string;
  studyVersion: number | null;
  studyStatus: string;
  subject: string;
  body: string;
  decision: string;
  relatedEntity: string;
}

export const VERDICT_LABELS: Record<string, string> = {
  met: 'مستوفى',
  not_met: 'غير مستوفى',
  unverifiable: 'غير قابل للتحقق',
  not_applicable: 'لا ينطبق',
};

export const INTAKE_LABELS: Record<string, string> = {
  received: 'مستلم',
  verified: 'مطابق للبصمة المتوقعة',
  hash_mismatch: 'بصمة غير مطابقة',
  awaiting_asset: 'بانتظار استلام الأصل',
};

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  new: 'جديد',
  awaiting_completion: 'بانتظار الاستكمال',
  under_study: 'قيد الدراسة',
  studied: 'مدروس',
  in_minutes: 'مدرج في محضر',
  closed: 'مغلق',
};

export const EXTRACTION_LABELS: Record<string, string> = {
  extracted: 'نص مستخرج',
  partial: 'استخراج جزئي',
  needs_review: 'يحتاج مراجعة بشرية',
  needs_ocr: 'يحتاج OCR/مراجعة',
  unsupported: 'صيغة غير مدعومة',
  failed: 'فشل الاستخراج',
  pending: 'قيد المعالجة',
};
