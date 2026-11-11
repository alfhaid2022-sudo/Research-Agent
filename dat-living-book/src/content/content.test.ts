import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { currentChapter as ch } from './registry';
import type { SourceRef } from './types';

const panelIds = new Set(ch.source.panels.map((p) => p.id));
const flagIds = new Set(ch.flags.map((f) => f.id));
const quizIds = new Set(ch.quiz.map((q) => q.id));

// Normalised text of the source. public/source/DAT2.txt is produced locally by
// `npm run source:prepare` (pdftotext) and is not committed (licence unverified).
// Without it, the verbatim-quote checks are skipped and say so.
const fixture = fileURLToPath(new URL('../../public/source/DAT2.txt', import.meta.url));
const haveSource = existsSync(fixture);
const norm = (s: string) =>
  s
    .replace(/[’‘]/g, "'")
    .replace(/[–—-]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^\d\.\s/, '')
    .trim()
    .toLowerCase();
const sourceText = haveSource ? norm(readFileSync(fixture, 'utf8')) : '';
const itSrc = haveSource ? it : it.skip;
if (!haveSource) console.warn('[content.test] public/source/DAT2.txt missing: run npm run source:prepare -- <DAT2.pdf> to enable verbatim checks');

function allRefs(): SourceRef[] {
  const r: SourceRef[] = [];
  for (const s of ch.sections) {
    r.push(...s.refs);
    s.explain.forEach((p) => r.push(...p.refs));
    s.interpret.forEach((p) => r.push(...p.refs));
  }
  ch.glossary.forEach((g) => r.push(...g.refs));
  ch.quiz.forEach((q) => r.push(...q.refs));
  ch.flashcards.forEach((f) => r.push(...f.refs));
  ch.flags.forEach((f) => r.push(...f.refs));
  for (const c of ch.cases) {
    r.push(...c.refs);
    c.nodes.forEach((n) => n.options.forEach((o) => r.push(...o.refs)));
  }
  return r;
}

describe('source mapping', () => {
  it('every reference points to a real panel on a real page', () => {
    for (const ref of allRefs()) expect(panelIds.has(ref.panel), ref.panel).toBe(true);
    for (const p of ch.source.panels) {
      expect(p.page).toBeGreaterThanOrEqual(1);
      expect(p.page).toBeLessThanOrEqual(ch.source.pageCount);
      expect(p.y1).toBeLessThanOrEqual(ch.source.pageSizePt.height);
      expect(p.y0).toBeLessThan(p.y1);
    }
  });
  itSrc('every panel heading is printed in the source', () => {
    for (const h of ['TERM DEFINITION', 'PRINCIPLE OF THE TEST', 'STEPS', 'The Antiglobulin Reaction (Anti-IgG)', 'FACTOIDS', 'FALSE NEGATIVE', 'CLASSIC PATTERNS OF RESPONSE', 'PROXIMATE MECHANISMS', 'HISTORY OF MEDICINE', 'ATTRIBUTIONS'])
      expect(sourceText).toContain(norm(h));
  });
  itSrc('every paragraph marked as a quote appears verbatim in the source', () => {
    for (const s of ch.sections)
      for (const p of s.explain.filter((x) => x.quote)) expect(sourceText, p.text).toContain(norm(p.text));
  });
  itSrc('every numeric claim in the content exists in the source text', () => {
    for (const n of ['1,000', '14,000', '7 to', '8%', '97 to 99%', '100-500', '400-1,100', '1945', '1908', '4+'])
      expect(sourceText).toContain(norm(n));
  });
  it('sections reference existing flags and quiz items', () => {
    for (const s of ch.sections) {
      (s.flags ?? []).forEach((f) => expect(flagIds.has(f), f).toBe(true));
      s.check.forEach((q) => expect(quizIds.has(q), q).toBe(true));
    }
  });
  it('quiz answers are in range and case graphs are connected', () => {
    for (const q of ch.quiz) expect(q.answer).toBeLessThan(q.options.length);
    for (const c of ch.cases) {
      const ids = new Set(c.nodes.map((n) => n.id));
      expect(ids.has(c.start)).toBe(true);
      c.nodes.forEach((n) => {
        expect(n.options.some((o) => o.correct), `${c.id}/${n.id}`).toBe(true);
        n.options.forEach((o) => o.next && expect(ids.has(o.next)).toBe(true));
      });
    }
  });
});
