import fs from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import type { Database } from 'better-sqlite3';
import { config, ensureDirs } from '../config.js';
import { getDb } from '../db.js';
import { asyncHandler } from '../lib/http.js';
import { audit, newId, nowIso, sha256 } from '../lib/util.js';
import { extractDocument } from '../services/extract.js';
import {
  DEMO_ATTACHMENT_COURSE,
  DEMO_BANNER,
  DEMO_REGULATION_A,
  DEMO_REGULATION_B,
  DEMO_REQUIREMENTS,
  DEMO_TEMPLATE,
} from '../demo/data.js';

export const demoRouter = Router();

async function storeSyntheticFile(fileName: string, body: string) {
  ensureDirs();
  const buffer = Buffer.from(body, 'utf8');
  const storedName = `${newId('demo')}${path.extname(fileName)}`;
  fs.writeFileSync(path.join(config.uploadsDir, storedName), buffer, { mode: 0o600 });
  const extraction = await extractDocument(fileName, buffer);
  return { fileName, storedName, buffer, extraction, sha256: sha256(buffer) };
}

async function insertDemoSource(
  db: Database,
  args: {
    title: string;
    issuer: string;
    version: string;
    effectiveDate: string;
    fileName: string;
    body: string;
    isTemplate?: boolean;
    track?: string;
  },
) {
  const stored = await storeSyntheticFile(args.fileName, args.body);
  const id = newId('src');
  const at = nowIso();
  db.prepare(
    `INSERT INTO sources (id, kind, title, issuer, version, effective_date, reference_no, notes, scope,
                          is_official_template, file_name, stored_name, mime, size, sha256,
                          extraction_status, extraction_note, segment_count, needs_ocr_segments,
                          needs_review_segments, track, page_count, expected_sha256, intake_status,
                          intake_note, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, '', ?, 'demo', ?, ?, ?, 'text/plain', ?, ?, ?, ?, ?, ?, ?, ?, ?, '', 'received', ?, ?, ?)`,
  ).run(
    id,
    args.isTemplate ? 'form_template' : 'regulation',
    args.title,
    args.issuer,
    args.version,
    args.effectiveDate,
    `${DEMO_BANNER}. محتوى اصطناعي أُنشئ داخل التطبيق لأغراض العرض فقط.`,
    args.isTemplate ? 1 : 0,
    stored.fileName,
    stored.storedName,
    stored.buffer.length,
    stored.sha256,
    stored.extraction.status,
    stored.extraction.note,
    stored.extraction.segments.length,
    stored.extraction.segments.filter((segment) => segment.quality === 'none').length,
    stored.extraction.segments.filter((segment) => segment.quality === 'suspect').length,
    args.track ?? '',
    stored.extraction.pageCount,
    'ملف اصطناعي أنشأه التطبيق، لا أصل مستلم.',
    at,
    at,
  );
  const insertSegment = db.prepare(
    `INSERT INTO source_segments (id, source_id, ordinal, locator, page, text, needs_ocr, quality, quality_note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const segment of stored.extraction.segments) {
    insertSegment.run(
      newId('seg'),
      id,
      segment.ordinal,
      segment.locator,
      segment.page,
      segment.text,
      segment.quality === 'none' ? 1 : 0,
      segment.quality,
      segment.qualityNote,
    );
  }
  return id;
}

demoRouter.post(
  '/demo/seed',
  asyncHandler(async (_req, res) => {
    const db = getDb();
    clearDemoData(db);
    const at = nowIso();

    const sourceA = await insertDemoSource(db, {
      title: `لائحة اصطناعية للتجربة (${DEMO_BANNER})`,
      issuer: 'جهة افتراضية غير حقيقية',
      version: '1.0',
      effectiveDate: '1447-01-01 (تاريخ اصطناعي)',
      fileName: 'لائحة-تجريبية-أ.txt',
      body: DEMO_REGULATION_A,
      track: 'conference',
    });
    const sourceB = await insertDemoSource(db, {
      title: `دليل إجراءات اصطناعي للتجربة (${DEMO_BANNER})`,
      issuer: 'جهة افتراضية أخرى غير حقيقية',
      version: '2.0',
      effectiveDate: '1447-06-01 (تاريخ اصطناعي)',
      fileName: 'دليل-تجريبي-ب.txt',
      body: DEMO_REGULATION_B,
      track: 'conference',
    });
    await insertDemoSource(db, {
      title: `نموذج داخلي اصطناعي (${DEMO_BANNER}) — ليس النموذج الرسمي`,
      issuer: 'داخلي',
      version: 'مسودة',
      effectiveDate: '',
      fileName: 'نموذج-تجريبي.txt',
      body: DEMO_TEMPLATE,
      isTemplate: true,
    });

    const sourceIds: Record<'A' | 'B', string> = { A: sourceA, B: sourceB };
    const insertRequirement = db.prepare(
      `INSERT INTO requirements (id, source_id, segment_id, scope, text, quote, locator, category,
                                 conflict_key, conflict_value, applies_to, tracks, status, origin, review_note,
                                 reviewed_by, reviewed_at, created_at, updated_at)
       VALUES (?, ?, ?, 'demo', ?, ?, ?, ?, ?, ?, '[]', '["conference"]', ?, 'manual', ?, ?, ?, ?, ?)`,
    );
    let approvedCount = 0;
    for (const seed of DEMO_REQUIREMENTS) {
      const sourceId = sourceIds[seed.sourceKey];
      const segment = db
        .prepare<[string, string], { id: string; locator: string }>(
          `SELECT id, locator FROM source_segments WHERE source_id = ? AND text LIKE '%' || ? || '%' ORDER BY ordinal LIMIT 1`,
        )
        .get(sourceId, seed.segmentMatch);
      if (!segment) continue;
      insertRequirement.run(
        newId('req'),
        sourceId,
        segment.id,
        seed.text,
        seed.quote,
        segment.locator,
        seed.category,
        seed.conflictKey,
        seed.conflictValue,
        seed.status,
        seed.status === 'approved' ? 'معتمد ضمن بيانات العرض التجريبي فقط.' : '',
        seed.status === 'approved' ? 'بيانات تجريبية' : '',
        seed.status === 'approved' ? at : '',
        at,
        at,
      );
      if (seed.status === 'approved') approvedCount += 1;
    }

    const typeId = newId('rt');
    db.prepare(
      `INSERT INTO request_types (id, track, name, description, checklist, active, scope, created_at, updated_at)
       VALUES (?, 'conference', ?, ?, ?, 1, 'demo', ?, ?)`,
    ).run(
      typeId,
      `مشاركة في مؤتمر (${DEMO_BANNER})`,
      'نوع طلب اصطناعي لعرض آلية العمل فقط.',
      JSON.stringify(['توصيف المقرر', 'محضر القسم']),
      at,
      at,
    );

    const requestId = newId('rq');
    db.prepare(
      `INSERT INTO requests (id, ref_no, type_id, title, applicant_name, applicant_unit, submitted_date,
                             submitted_calendar, academic_year, track, summary, status, scope, created_at, updated_at)
       VALUES (?, 'تجريبي-001', ?, ?, 'مقدم طلب افتراضي', 'قسم افتراضي', '2026-09-01', 'gregorian',
               '1447/1448 (تجريبي)', 'conference', ?, 'new', 'demo', ?, ?)`,
    ).run(
      requestId,
      typeId,
      `طلب اعتماد مقرر «أساسيات المختبرات الإكلينيكية» (${DEMO_BANNER})`,
      'طلب اصطناعي لعرض مسار الدراسة داخل التطبيق.',
      at,
      at,
    );

    // One checklist item is deliberately left unattached to demonstrate the "missing attachment" state.
    const stored = await storeSyntheticFile('توصيف-المقرر-تجريبي.txt', DEMO_ATTACHMENT_COURSE);
    const attachmentId = newId('att');
    db.prepare(
      `INSERT INTO attachments (id, request_id, label, file_name, stored_name, mime, size, sha256,
                                extraction_status, extraction_note, segment_count, created_at)
       VALUES (?, ?, 'توصيف المقرر', ?, ?, 'text/plain', ?, ?, ?, ?, ?, ?)`,
    ).run(
      attachmentId,
      requestId,
      stored.fileName,
      stored.storedName,
      stored.buffer.length,
      stored.sha256,
      stored.extraction.status,
      stored.extraction.note,
      stored.extraction.segments.length,
      at,
    );
    const insertAttSegment = db.prepare(
      `INSERT INTO attachment_segments (id, attachment_id, ordinal, locator, page, text, needs_ocr) VALUES (?, ?, ?, ?, ?, ?, 0)`,
    );
    for (const segment of stored.extraction.segments) {
      insertAttSegment.run(newId('aseg'), attachmentId, segment.ordinal, segment.locator, segment.page, segment.text);
    }

    // A synthetic committee so the minutes screens have a composition to project from.
    const insertMember = db.prepare(
      `INSERT INTO committee_members (id, scope, ordinal, name, role, active, note, created_at, updated_at)
       VALUES (?, 'demo', ?, ?, ?, 1, ?, ?, ?)`,
    );
    const demoMembers = [
      ['عضو تجريبي أول', 'رئيس اللجنة'],
      ['عضو تجريبي ثانٍ', 'عضو'],
      ['عضو تجريبي ثالث', 'عضو ومقرر'],
    ];
    demoMembers.forEach(([name, role], index) => {
      insertMember.run(newId('mem'), index + 1, `${name} (${DEMO_BANNER})`, role, 'اسم اصطناعي للعرض فقط.', at, at);
    });

    // A synthetic amend relation, to show that an unresolved relation blocks a conclusive result.
    db.prepare(
      `INSERT INTO source_relations (id, scope, track, from_source_id, to_source_id, kind, subject, note, status, created_at)
       VALUES (?, 'demo', 'conference', ?, ?, 'amends', ?, ?, 'unresolved', ?)`,
    ).run(
      newId('rel'),
      sourceB,
      sourceA,
      'مدة التقديم قبل الجلسة',
      `${DEMO_BANNER}. علاقة اصطناعية لعرض أثر التعديل غير المحسوم.`,
      at,
    );

    audit('demo.seed', 'demo', '', { requestId, approvedCount });
    res.json({
      ok: true,
      notice: `${DEMO_BANNER}. بيانات العرض منفصلة تمامًا عن البيانات الفعلية.`,
      created: {
        sources: 3,
        approvedRequirements: approvedCount,
        candidateRequirements: DEMO_REQUIREMENTS.filter((r) => r.status === 'candidate').length,
        requests: 1,
        missingChecklistItem: 'محضر القسم',
        conflict: 'مدة التقديم قبل الجلسة (15 يومًا مقابل 30 يومًا)',
        committeeMembers: 3,
        unresolvedRelations: 1,
      },
    });
  }),
);

demoRouter.delete(
  '/demo',
  asyncHandler(async (_req, res) => {
    const db = getDb();
    const removed = clearDemoData(db);
    audit('demo.clear', 'demo', '', removed);
    res.json({ ok: true, removed });
  }),
);

/** Removes demo-scoped rows and their files only. Real data is never touched. */
function clearDemoData(db: Database) {
  const storedNames = [
    ...db.prepare<[], { stored_name: string }>(`SELECT stored_name FROM sources WHERE scope = 'demo'`).all(),
    ...db
      .prepare<[], { stored_name: string }>(
        `SELECT a.stored_name FROM attachments a JOIN requests r ON r.id = a.request_id WHERE r.scope = 'demo'`,
      )
      .all(),
  ].map((row) => row.stored_name);

  const counts = db.transaction(() => {
    const minutes = db.prepare(`DELETE FROM minutes WHERE scope = 'demo'`).run().changes;
    const requests = db.prepare(`DELETE FROM requests WHERE scope = 'demo'`).run().changes;
    const sources = db.prepare(`DELETE FROM sources WHERE scope = 'demo'`).run().changes;
    const types = db.prepare(`DELETE FROM request_types WHERE scope = 'demo'`).run().changes;
    const members = db.prepare(`DELETE FROM committee_members WHERE scope = 'demo'`).run().changes;
    db.prepare(`DELETE FROM source_relations WHERE scope = 'demo'`).run();
    return { minutes, requests, sources, requestTypes: types, committeeMembers: members };
  })();

  for (const storedName of storedNames) {
    const base = path.basename(storedName);
    const full = path.resolve(config.uploadsDir, base);
    if (full.startsWith(path.resolve(config.uploadsDir) + path.sep)) {
      try {
        fs.rmSync(full, { force: true });
      } catch {
        /* a leftover file is harmless; the rows are gone */
      }
    }
  }
  return counts;
}
