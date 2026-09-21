import type { Express } from 'express';
import request from 'supertest';
import { createApp } from '../app.js';
import { getDb } from '../db.js';

export function testApp(): Express {
  return createApp();
}

/** Wipes every table between tests while keeping the schema. */
export function resetDb(): void {
  const db = getDb();
  db.pragma('foreign_keys = OFF');
  for (const table of [
    'audit_log', 'minute_attendance', 'minute_items', 'minutes', 'committee_members',
    'study_revisions', 'findings', 'studies', 'attachment_segments', 'attachments',
    'requests', 'publications', 'participations', 'award_claims', 'requirements',
    'segment_corrections', 'source_segments', 'source_relations', 'sources',
    'request_types', 'settings',
  ]) {
    db.prepare(`DELETE FROM ${table}`).run();
  }
  db.pragma('foreign_keys = ON');
}

export async function createRequestType(
  app: Express,
  overrides: Partial<{ name: string; checklist: string[]; scope: string; track: string }> = {},
): Promise<string> {
  const response = await request(app)
    .post('/api/request-types')
    .send({ name: 'نوع اختبار', checklist: [], scope: 'real', track: 'conference', ...overrides })
    .expect(201);
  return response.body.id as string;
}

export async function uploadTextSource(
  app: Express,
  args: {
    title: string;
    body: string;
    scope?: string;
    isOfficialTemplate?: boolean;
    version?: string;
    fileName?: string;
    track?: string;
    expectedSha256?: string;
  },
): Promise<string> {
  const response = await request(app)
    .post('/api/sources')
    .field('title', args.title)
    .field('scope', args.scope ?? 'real')
    .field('version', args.version ?? '1.0')
    .field('track', args.track ?? 'conference')
    .field('expectedSha256', args.expectedSha256 ?? '')
    .field('isOfficialTemplate', args.isOfficialTemplate ? 'true' : 'false')
    .attach('file', Buffer.from(args.body, 'utf8'), args.fileName ?? 'source.txt')
    .expect(201);
  return response.body.id as string;
}

export function approveRequirement(
  args: {
    sourceId: string;
    segmentId: string;
    text: string;
    quote: string;
    conflictKey?: string;
    conflictValue?: string;
    scope?: string;
    tracks?: string[];
  },
): string {
  const db = getDb();
  const id = `req_test_${Math.random().toString(16).slice(2, 10)}`;
  const at = new Date().toISOString();
  const locator =
    db.prepare<[string], { locator: string }>(`SELECT locator FROM source_segments WHERE id = ?`).get(args.segmentId)?.locator ?? '';
  db.prepare(
    `INSERT INTO requirements (id, source_id, segment_id, scope, text, quote, locator, category,
                               conflict_key, conflict_value, applies_to, tracks, status, origin, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, '', ?, ?, '[]', ?, 'approved', 'manual', ?, ?)`,
  ).run(
    id,
    args.sourceId,
    args.segmentId,
    args.scope ?? 'real',
    args.text,
    args.quote,
    locator,
    args.conflictKey ?? '',
    args.conflictValue ?? '',
    JSON.stringify(args.tracks ?? ['conference']),
    at,
    at,
  );
  return id;
}

export function firstSegmentId(sourceId: string, contains: string): string {
  const row = getDb()
    .prepare<[string, string], { id: string }>(
      `SELECT id FROM source_segments WHERE source_id = ? AND text LIKE '%' || ? || '%' ORDER BY ordinal LIMIT 1`,
    )
    .get(sourceId, contains);
  if (!row) throw new Error(`no segment containing "${contains}"`);
  return row.id;
}

export const SAMPLE_REGULATION = `لائحة اختبار داخلية

المادة 1
يجب أن يتضمن الطلب توصيفًا كاملًا للمقرر يوضح مخرجات التعلم وآلية التقييم.

المادة 2
تُقدَّم الطلبات إلى اللجنة قبل خمسة عشر يومًا من موعد انعقاد الجلسة.
`;

export const SAMPLE_ATTACHMENT = `توصيف مقرر اختباري

مخرجات التعلم: أن يصف الطالب مراحل العمل داخل المختبر الإكلينيكي.

آلية التقييم: اختبار نصفي ونهائي وأعمال فصلية.
`;
