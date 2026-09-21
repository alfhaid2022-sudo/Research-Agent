import Database from 'better-sqlite3';
import { config, ensureDirs } from './config.js';

let instance: Database.Database | null = null;

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS request_types (
  id            TEXT PRIMARY KEY,
  track         TEXT NOT NULL DEFAULT '',
  name          TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  checklist     TEXT NOT NULL DEFAULT '[]',
  active        INTEGER NOT NULL DEFAULT 1,
  scope         TEXT NOT NULL DEFAULT 'real',
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sources (
  id                   TEXT PRIMARY KEY,
  kind                 TEXT NOT NULL DEFAULT 'regulation',
  title                TEXT NOT NULL,
  issuer               TEXT NOT NULL DEFAULT '',
  version              TEXT NOT NULL DEFAULT '',
  effective_date       TEXT NOT NULL DEFAULT '',
  reference_no         TEXT NOT NULL DEFAULT '',
  notes                TEXT NOT NULL DEFAULT '',
  scope                TEXT NOT NULL DEFAULT 'real',
  is_official_template INTEGER NOT NULL DEFAULT 0,
  file_name            TEXT NOT NULL DEFAULT '',
  stored_name          TEXT NOT NULL DEFAULT '',
  mime                 TEXT NOT NULL DEFAULT '',
  size                 INTEGER NOT NULL DEFAULT 0,
  sha256               TEXT NOT NULL DEFAULT '',
  extraction_status    TEXT NOT NULL DEFAULT 'pending',
  extraction_note      TEXT NOT NULL DEFAULT '',
  segment_count        INTEGER NOT NULL DEFAULT 0,
  needs_ocr_segments   INTEGER NOT NULL DEFAULT 0,
  needs_review_segments INTEGER NOT NULL DEFAULT 0,
  track                TEXT NOT NULL DEFAULT '',
  page_count           INTEGER NOT NULL DEFAULT 0,
  expected_sha256      TEXT NOT NULL DEFAULT '',
  intake_status        TEXT NOT NULL DEFAULT 'received',
  intake_note          TEXT NOT NULL DEFAULT '',
  created_at           TEXT NOT NULL,
  updated_at           TEXT NOT NULL
);

-- How one source changes another (amends / supersedes / interprets / conflicts).
-- An unresolved relation blocks a conclusive result in the affected track.
CREATE TABLE IF NOT EXISTS source_relations (
  id             TEXT PRIMARY KEY,
  scope          TEXT NOT NULL DEFAULT 'real',
  track          TEXT NOT NULL DEFAULT '',
  from_source_id TEXT NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  to_source_id   TEXT NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  kind           TEXT NOT NULL,
  subject        TEXT NOT NULL DEFAULT '',
  note           TEXT NOT NULL DEFAULT '',
  status         TEXT NOT NULL DEFAULT 'unresolved',
  resolution_note TEXT NOT NULL DEFAULT '',
  resolved_by    TEXT NOT NULL DEFAULT '',
  resolved_at    TEXT NOT NULL DEFAULT '',
  created_at     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_relations_track ON source_relations(scope, track, status);

-- Configurable tracks. Rules of one track are never applied to another.
CREATE TABLE IF NOT EXISTS tracks (
  slug        TEXT NOT NULL,
  scope       TEXT NOT NULL DEFAULT 'real',
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  builtin     INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL,
  PRIMARY KEY (scope, slug)
);

CREATE TABLE IF NOT EXISTS source_segments (
  id            TEXT PRIMARY KEY,
  source_id     TEXT NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  ordinal       INTEGER NOT NULL,
  locator       TEXT NOT NULL,
  page          INTEGER,
  text          TEXT NOT NULL,
  needs_ocr     INTEGER NOT NULL DEFAULT 0,
  quality       TEXT NOT NULL DEFAULT 'good',
  quality_note  TEXT NOT NULL DEFAULT ''
);

-- Manually typed or corrected page text. Bound to the page AND the file digest,
-- so a corrected text can never silently follow a different file.
CREATE TABLE IF NOT EXISTS segment_corrections (
  id            TEXT PRIMARY KEY,
  segment_id    TEXT NOT NULL REFERENCES source_segments(id) ON DELETE CASCADE,
  source_id     TEXT NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  source_sha256 TEXT NOT NULL,
  page          INTEGER,
  text          TEXT NOT NULL,
  entered_by    TEXT NOT NULL DEFAULT '',
  entered_at    TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'entered',
  reviewed_by   TEXT NOT NULL DEFAULT '',
  reviewed_at   TEXT NOT NULL DEFAULT '',
  review_note   TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_corrections_segment ON segment_corrections(segment_id, entered_at);
CREATE INDEX IF NOT EXISTS idx_segments_source ON source_segments(source_id, ordinal);

CREATE TABLE IF NOT EXISTS requirements (
  id             TEXT PRIMARY KEY,
  source_id      TEXT NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  segment_id     TEXT REFERENCES source_segments(id) ON DELETE SET NULL,
  scope          TEXT NOT NULL DEFAULT 'real',
  text           TEXT NOT NULL,
  quote          TEXT NOT NULL DEFAULT '',
  locator        TEXT NOT NULL DEFAULT '',
  category       TEXT NOT NULL DEFAULT '',
  conflict_key   TEXT NOT NULL DEFAULT '',
  conflict_value TEXT NOT NULL DEFAULT '',
  applies_to     TEXT NOT NULL DEFAULT '[]',
  tracks         TEXT NOT NULL DEFAULT '[]',
  page           INTEGER,
  clause         TEXT NOT NULL DEFAULT '',
  application_date TEXT NOT NULL DEFAULT '',
  date_calendar  TEXT NOT NULL DEFAULT '',
  basis_state    TEXT NOT NULL DEFAULT 'unverified',
  status         TEXT NOT NULL DEFAULT 'candidate',
  origin         TEXT NOT NULL DEFAULT 'ai',
  review_note    TEXT NOT NULL DEFAULT '',
  reviewed_by    TEXT NOT NULL DEFAULT '',
  reviewed_at    TEXT NOT NULL DEFAULT '',
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_requirements_status ON requirements(scope, status);

CREATE TABLE IF NOT EXISTS requests (
  id              TEXT PRIMARY KEY,
  ref_no          TEXT NOT NULL,
  type_id         TEXT REFERENCES request_types(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  applicant_name  TEXT NOT NULL DEFAULT '',
  applicant_unit  TEXT NOT NULL DEFAULT '',
  submitted_date  TEXT NOT NULL DEFAULT '',
  submitted_calendar TEXT NOT NULL DEFAULT '',
  academic_year   TEXT NOT NULL DEFAULT '',
  track           TEXT NOT NULL DEFAULT '',
  summary         TEXT NOT NULL DEFAULT '',
  status          TEXT NOT NULL DEFAULT 'new',
  scope           TEXT NOT NULL DEFAULT 'real',
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_requests_ref ON requests(scope, ref_no);

CREATE TABLE IF NOT EXISTS attachments (
  id                TEXT PRIMARY KEY,
  request_id        TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  label             TEXT NOT NULL DEFAULT '',
  -- Which checklist item of the request type the uploader says this file covers.
  -- It is the uploader's claim, not a verification of the file's contents.
  checklist_item    TEXT NOT NULL DEFAULT '',
  file_name         TEXT NOT NULL,
  stored_name       TEXT NOT NULL,
  mime              TEXT NOT NULL DEFAULT '',
  size              INTEGER NOT NULL DEFAULT 0,
  sha256            TEXT NOT NULL DEFAULT '',
  extraction_status TEXT NOT NULL DEFAULT 'pending',
  extraction_note   TEXT NOT NULL DEFAULT '',
  segment_count     INTEGER NOT NULL DEFAULT 0,
  created_at        TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_attachments_request ON attachments(request_id);

CREATE TABLE IF NOT EXISTS attachment_segments (
  id            TEXT PRIMARY KEY,
  attachment_id TEXT NOT NULL REFERENCES attachments(id) ON DELETE CASCADE,
  ordinal       INTEGER NOT NULL,
  locator       TEXT NOT NULL,
  page          INTEGER,
  text          TEXT NOT NULL,
  needs_ocr     INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_att_segments ON attachment_segments(attachment_id, ordinal);

CREATE TABLE IF NOT EXISTS studies (
  id               TEXT PRIMARY KEY,
  request_id       TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  version          INTEGER NOT NULL DEFAULT 1,
  status           TEXT NOT NULL DEFAULT 'draft',
  mode             TEXT NOT NULL DEFAULT 'manual',
  ready            INTEGER NOT NULL DEFAULT 0,
  readiness        TEXT NOT NULL DEFAULT '[]',
  conflicts        TEXT NOT NULL DEFAULT '[]',
  summary          TEXT NOT NULL DEFAULT '',
  memo             TEXT NOT NULL DEFAULT '',
  recommendation   TEXT NOT NULL DEFAULT '',
  completion_items TEXT NOT NULL DEFAULT '[]',
  minute_draft     TEXT NOT NULL DEFAULT '',
  ai_meta          TEXT NOT NULL DEFAULT '{}',
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL,
  finalized_at     TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_studies_request ON studies(request_id, version);

CREATE TABLE IF NOT EXISTS findings (
  id                    TEXT PRIMARY KEY,
  study_id              TEXT NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  ordinal               INTEGER NOT NULL DEFAULT 0,
  requirement_id        TEXT,
  requirement_text      TEXT NOT NULL DEFAULT '',
  basis_source_id       TEXT,
  basis_segment_id      TEXT,
  basis_locator         TEXT NOT NULL DEFAULT '',
  basis_quote           TEXT NOT NULL DEFAULT '',
  evidence_attachment_id TEXT,
  evidence_locator      TEXT NOT NULL DEFAULT '',
  evidence_quote        TEXT NOT NULL DEFAULT '',
  verdict               TEXT NOT NULL DEFAULT 'unverifiable',
  verdict_reason        TEXT NOT NULL DEFAULT '',
  facts                 TEXT NOT NULL DEFAULT '',
  inference             TEXT NOT NULL DEFAULT '',
  calculation           TEXT NOT NULL DEFAULT '',
  notes                 TEXT NOT NULL DEFAULT '',
  gap                   TEXT NOT NULL DEFAULT '',
  validation            TEXT NOT NULL DEFAULT '{}',
  origin                TEXT NOT NULL DEFAULT 'ai',
  edited                INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_findings_study ON findings(study_id, ordinal);

CREATE TABLE IF NOT EXISTS study_revisions (
  id         TEXT PRIMARY KEY,
  study_id   TEXT NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  finding_id TEXT,
  field      TEXT NOT NULL,
  old_value  TEXT NOT NULL DEFAULT '',
  new_value  TEXT NOT NULL DEFAULT '',
  reason     TEXT NOT NULL DEFAULT '',
  actor      TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_revisions_study ON study_revisions(study_id, created_at);

CREATE TABLE IF NOT EXISTS minutes (
  id               TEXT PRIMARY KEY,
  scope            TEXT NOT NULL DEFAULT 'real',
  title            TEXT NOT NULL,
  committee_name   TEXT NOT NULL DEFAULT '',
  meeting_date     TEXT NOT NULL DEFAULT '',
  meeting_calendar TEXT NOT NULL DEFAULT '',
  meeting_time     TEXT NOT NULL DEFAULT '',
  session_no       TEXT NOT NULL DEFAULT '',
  addressee_name   TEXT NOT NULL DEFAULT '',
  addressee_title  TEXT NOT NULL DEFAULT '',
  addressee_state  TEXT NOT NULL DEFAULT 'pending_review',
  status           TEXT NOT NULL DEFAULT 'draft',
  notes            TEXT NOT NULL DEFAULT '',
  additions        TEXT NOT NULL DEFAULT '',
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS minute_items (
  id             TEXT PRIMARY KEY,
  minutes_id     TEXT NOT NULL REFERENCES minutes(id) ON DELETE CASCADE,
  request_id     TEXT REFERENCES requests(id) ON DELETE SET NULL,
  study_id       TEXT REFERENCES studies(id) ON DELETE SET NULL,
  ordinal        INTEGER NOT NULL DEFAULT 0,
  subject        TEXT NOT NULL DEFAULT '',
  body           TEXT NOT NULL DEFAULT '',
  decision       TEXT NOT NULL DEFAULT '',
  related_entity TEXT NOT NULL DEFAULT '',
  created_at     TEXT NOT NULL
);

-- Committee composition: the SINGLE source for both the attendance table and the
-- signature table. Attendance is recorded per meeting and is never pre-filled.
CREATE TABLE IF NOT EXISTS committee_members (
  id          TEXT PRIMARY KEY,
  scope       TEXT NOT NULL DEFAULT 'real',
  ordinal     INTEGER NOT NULL DEFAULT 0,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT '',
  active      INTEGER NOT NULL DEFAULT 1,
  note        TEXT NOT NULL DEFAULT '',
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_members_scope ON committee_members(scope, ordinal);

CREATE TABLE IF NOT EXISTS minute_attendance (
  id          TEXT PRIMARY KEY,
  minutes_id  TEXT NOT NULL REFERENCES minutes(id) ON DELETE CASCADE,
  member_id   TEXT NOT NULL REFERENCES committee_members(id) ON DELETE CASCADE,
  state       TEXT NOT NULL DEFAULT 'unrecorded',
  absence_reason TEXT NOT NULL DEFAULT '',
  recorded_by TEXT NOT NULL DEFAULT '',
  recorded_at TEXT NOT NULL DEFAULT ''
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_unique ON minute_attendance(minutes_id, member_id);

-- Publications attached to a request. classification_type keeps quartiles and
-- reward categories apart: Q1 is not category A.
CREATE TABLE IF NOT EXISTS publications (
  id                    TEXT PRIMARY KEY,
  request_id            TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  title                 TEXT NOT NULL,
  venue                 TEXT NOT NULL DEFAULT '',
  author_order          INTEGER,
  is_first_author       INTEGER NOT NULL DEFAULT 0,
  affiliation           TEXT NOT NULL DEFAULT '',
  sole_affiliation      INTEGER NOT NULL DEFAULT 0,
  status                TEXT NOT NULL DEFAULT '',
  status_date           TEXT NOT NULL DEFAULT '',
  status_calendar       TEXT NOT NULL DEFAULT '',
  gregorian_year        TEXT NOT NULL DEFAULT '',
  academic_year         TEXT NOT NULL DEFAULT '',
  classification_source TEXT NOT NULL DEFAULT '',
  classification_type   TEXT NOT NULL DEFAULT '',
  classification_value  TEXT NOT NULL DEFAULT '',
  classification_year   TEXT NOT NULL DEFAULT '',
  evidence_attachment_id TEXT REFERENCES attachments(id) ON DELETE SET NULL,
  note                  TEXT NOT NULL DEFAULT '',
  created_at            TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_publications_request ON publications(request_id);

-- Event participations and their approvals (conference track).
CREATE TABLE IF NOT EXISTS participations (
  id             TEXT PRIMARY KEY,
  request_id     TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  event_name     TEXT NOT NULL,
  event_place    TEXT NOT NULL DEFAULT '',
  organizer      TEXT NOT NULL DEFAULT '',
  participation_kind TEXT NOT NULL DEFAULT '',
  start_date     TEXT NOT NULL DEFAULT '',
  end_date       TEXT NOT NULL DEFAULT '',
  date_calendar  TEXT NOT NULL DEFAULT '',
  academic_year  TEXT NOT NULL DEFAULT '',
  approval_state TEXT NOT NULL DEFAULT 'unrecorded',
  approval_note  TEXT NOT NULL DEFAULT '',
  note           TEXT NOT NULL DEFAULT '',
  created_at     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_participations_request ON participations(request_id);

-- Excellence-award claims: achievement, share, approvals, financial reference.
-- The app never computes a payment.
CREATE TABLE IF NOT EXISTS award_claims (
  id                   TEXT PRIMARY KEY,
  request_id           TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  achievement_kind     TEXT NOT NULL DEFAULT '',
  achievement_title    TEXT NOT NULL DEFAULT '',
  achievement_date     TEXT NOT NULL DEFAULT '',
  date_calendar        TEXT NOT NULL DEFAULT '',
  share_percent        TEXT NOT NULL DEFAULT '',
  share_basis          TEXT NOT NULL DEFAULT '',
  department_approval  TEXT NOT NULL DEFAULT 'unrecorded',
  college_approval     TEXT NOT NULL DEFAULT 'unrecorded',
  council_approval     TEXT NOT NULL DEFAULT 'unrecorded',
  financial_reference  TEXT NOT NULL DEFAULT '',
  note                 TEXT NOT NULL DEFAULT '',
  created_at           TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_award_request ON award_claims(request_id);
CREATE INDEX IF NOT EXISTS idx_minute_items ON minute_items(minutes_id, ordinal);

CREATE TABLE IF NOT EXISTS audit_log (
  id         TEXT PRIMARY KEY,
  at         TEXT NOT NULL,
  actor      TEXT NOT NULL DEFAULT 'local',
  action     TEXT NOT NULL,
  entity     TEXT NOT NULL DEFAULT '',
  entity_id  TEXT NOT NULL DEFAULT '',
  detail     TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_audit_at ON audit_log(at);
`;

/** Columns added after the first release, applied to databases created earlier. */
const ADDED_COLUMNS: Array<[table: string, column: string, definition: string]> = [
  ['attachments', 'checklist_item', "TEXT NOT NULL DEFAULT ''"],
  ['sources', 'needs_review_segments', "INTEGER NOT NULL DEFAULT 0"],
  ['sources', 'track', "TEXT NOT NULL DEFAULT ''"],
  ['sources', 'page_count', 'INTEGER NOT NULL DEFAULT 0'],
  ['sources', 'expected_sha256', "TEXT NOT NULL DEFAULT ''"],
  ['sources', 'intake_status', "TEXT NOT NULL DEFAULT 'received'"],
  ['sources', 'intake_note', "TEXT NOT NULL DEFAULT ''"],
  ['source_segments', 'quality', "TEXT NOT NULL DEFAULT 'good'"],
  ['source_segments', 'quality_note', "TEXT NOT NULL DEFAULT ''"],
  ['requirements', 'tracks', "TEXT NOT NULL DEFAULT '[]'"],
  ['requirements', 'page', 'INTEGER'],
  ['requirements', 'clause', "TEXT NOT NULL DEFAULT ''"],
  ['requirements', 'application_date', "TEXT NOT NULL DEFAULT ''"],
  ['requirements', 'date_calendar', "TEXT NOT NULL DEFAULT ''"],
  ['requirements', 'basis_state', "TEXT NOT NULL DEFAULT 'unverified'"],
  ['request_types', 'track', "TEXT NOT NULL DEFAULT ''"],
  ['requests', 'submitted_calendar', "TEXT NOT NULL DEFAULT ''"],
  ['requests', 'academic_year', "TEXT NOT NULL DEFAULT ''"],
  ['requests', 'track', "TEXT NOT NULL DEFAULT ''"],
  ['minutes', 'committee_name', "TEXT NOT NULL DEFAULT ''"],
  ['minutes', 'meeting_calendar', "TEXT NOT NULL DEFAULT ''"],
  ['minutes', 'meeting_time', "TEXT NOT NULL DEFAULT ''"],
  ['minutes', 'addressee_name', "TEXT NOT NULL DEFAULT ''"],
  ['minutes', 'addressee_title', "TEXT NOT NULL DEFAULT ''"],
  ['minutes', 'addressee_state', "TEXT NOT NULL DEFAULT 'pending_review'"],
  ['minutes', 'additions', "TEXT NOT NULL DEFAULT ''"],
  ['minute_items', 'subject', "TEXT NOT NULL DEFAULT ''"],
  ['minute_items', 'decision', "TEXT NOT NULL DEFAULT ''"],
  ['minute_items', 'related_entity', "TEXT NOT NULL DEFAULT ''"],
];

/** Tracks shipped by default. Rules are never shared across tracks. */
export const BUILTIN_TRACKS: Array<{ slug: string; name: string; description: string }> = [
  {
    slug: 'conference',
    name: 'حضور/مشاركة في مؤتمر أو ندوة',
    description: 'مسار ضوابط حضور المؤتمرات والندوات وأنواع المشاركة.',
  },
  {
    slug: 'excellence_award',
    name: 'مكافأة التميز',
    description: 'مسار ضوابط صرف بدل مكافأة التميز والنشر العلمي والجوائز والبراءات.',
  },
];

function migrate(db: Database.Database): void {
  for (const [table, column, definition] of ADDED_COLUMNS) {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
    if (columns.length === 0) continue;
    if (columns.some((c) => c.name === column)) continue;
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
  const insertTrack = db.prepare(
    `INSERT OR IGNORE INTO tracks (slug, scope, name, description, builtin, created_at)
     VALUES (?, ?, ?, ?, 1, ?)`,
  );
  const at = new Date().toISOString();
  for (const scope of ['real', 'demo']) {
    for (const track of BUILTIN_TRACKS) {
      insertTrack.run(track.slug, scope, track.name, track.description, at);
    }
  }
}

export function getDb(): Database.Database {
  if (instance) return instance;
  ensureDirs();
  const db = new Database(config.dbFile);
  db.exec(SCHEMA);
  migrate(db);
  instance = db;
  return db;
}

/** Used by tests to run against an isolated in-memory database. */
export function setDbForTests(db: Database.Database): void {
  db.exec(SCHEMA);
  migrate(db);
  instance = db;
}

export function closeDb(): void {
  instance?.close();
  instance = null;
}
