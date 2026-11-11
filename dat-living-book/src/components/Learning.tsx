import { useMemo, useState } from 'react';
import { currentChapter as ch } from '../content/registry';
import type { CaseStudy, QuizItem } from '../content/types';
import { useStore } from '../lib/store';
import { go, hrefFor } from '../lib/router';
import { SourceRefs } from './SourceRef';

/* ---------- Quiz question (shared by inline checks and the quiz page) ---------- */
export function QuizQuestion({ q, index }: { q: QuizItem; index?: number }) {
  const { p, update } = useStore();
  const chosen = p.quizAnswers[q.id];
  const answered = chosen !== undefined;
  return (
    <fieldset className="quiz-q" data-testid={`quiz-${q.id}`}>
      <legend>
        {index !== undefined && <span className="qnum">Q{index + 1}.</span>} {q.question}
      </legend>
      <div className="quiz-opts">
        {q.options.map((o, i) => {
          const cls = answered ? (i === q.answer ? 'correct' : i === chosen ? 'wrong' : '') : '';
          return (
            <button
              type="button"
              key={i}
              className={`quiz-opt ${cls}`}
              aria-pressed={chosen === i}
              disabled={answered}
              onClick={() => update((s) => ({ ...s, quizAnswers: { ...s.quizAnswers, [q.id]: i } }))}
            >
              <span className="opt-letter">{String.fromCharCode(65 + i)}</span> {o}
              {answered && i === q.answer && <span className="sr-only"> (correct answer)</span>}
              {answered && i === chosen && i !== q.answer && <span className="sr-only"> (your answer, incorrect)</span>}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className={`feedback ${chosen === q.answer ? 'ok' : 'bad'}`} role="status">
          <strong>{chosen === q.answer ? 'Correct.' : 'Not quite.'}</strong> {q.explanation} <SourceRefs refs={q.refs} />
          <button
            type="button"
            className="link"
            onClick={() =>
              update((s) => {
                const a = { ...s.quizAnswers };
                delete a[q.id];
                return { ...s, quizAnswers: a };
              })
            }
          >
            Try again
          </button>
        </div>
      )}
    </fieldset>
  );
}

export function QuizPage() {
  const { p, update } = useStore();
  const answered = ch.quiz.filter((q) => p.quizAnswers[q.id] !== undefined);
  const correct = answered.filter((q) => p.quizAnswers[q.id] === q.answer).length;
  return (
    <article className="page">
      <h1>Quiz</h1>
      <p className="lead">
        {ch.quiz.length} questions, each answerable from the source. Answers are saved on this device.
      </p>
      <p className="score" data-testid="quiz-score" aria-live="polite">
        Score: {correct} / {answered.length} answered ({ch.quiz.length} total)
        {answered.length > 0 && (
          <button
            type="button"
            className="link"
            onClick={() => update((s) => ({ ...s, quizAnswers: Object.fromEntries(Object.entries(s.quizAnswers).filter(([k]) => !ch.quiz.some((q) => q.id === k))) }))}
          >
            Reset quiz
          </button>
        )}
      </p>
      {ch.quiz.map((q, i) => <QuizQuestion key={q.id} q={q} index={i} />)}
    </article>
  );
}

/* ---------- Flashcards ---------- */
export function FlashcardsPage() {
  const { p, update } = useStore();
  const [onlyUnknown, setOnlyUnknown] = useState(false);
  const deck = useMemo(() => ch.flashcards.filter((f) => !onlyUnknown || !p.flashKnown[f.id]), [onlyUnknown, p.flashKnown]);
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const card = deck[Math.min(i, deck.length - 1)];
  const known = Object.values(p.flashKnown).filter(Boolean).length;
  const move = (d: number) => { setFlip(false); setI((x) => (deck.length ? (x + d + deck.length) % deck.length : 0)); };
  return (
    <article className="page">
      <h1>Flashcards</h1>
      <p className="lead">{ch.flashcards.length} cards from the source. Marked known: {known}.</p>
      <label className="inline-check">
        <input type="checkbox" checked={onlyUnknown} onChange={(e) => { setOnlyUnknown(e.target.checked); setI(0); setFlip(false); }} /> Show only cards not yet known
      </label>
      {!card ? (
        <p className="note">All cards marked known. Untick the filter to review them again.</p>
      ) : (
        <div className="flash-wrap" onKeyDown={(e) => { if (e.key === 'ArrowRight') move(1); if (e.key === 'ArrowLeft') move(-1); }}>
          <button type="button" className={`flashcard ${flip ? 'back' : ''}`} onClick={() => setFlip(!flip)} aria-label={flip ? `Answer: ${card.back}. Press to show the question.` : `Question: ${card.front}. Press to show the answer.`} data-testid="flashcard">
            <span className="fc-side">{flip ? 'Answer' : 'Prompt'}</span>
            <span className="fc-text">{flip ? card.back : card.front}</span>
          </button>
          <div className="flash-meta">
            <span className="small muted">Card {Math.min(i, deck.length - 1) + 1} of {deck.length}</span>
            <SourceRefs refs={card.refs} />
          </div>
          <div className="row-btns">
            <button type="button" onClick={() => move(-1)}>◀ Previous</button>
            <button type="button" onClick={() => setFlip(!flip)}>Flip</button>
            <button
              type="button"
              className={p.flashKnown[card.id] ? 'on' : ''}
              aria-pressed={!!p.flashKnown[card.id]}
              onClick={() => update((s) => ({ ...s, flashKnown: { ...s.flashKnown, [card.id]: !s.flashKnown[card.id] } }))}
            >
              {p.flashKnown[card.id] ? '✓ Known' : 'Mark known'}
            </button>
            <button type="button" onClick={() => move(1)}>Next ▶</button>
          </div>
        </div>
      )}
    </article>
  );
}

/* ---------- Cases ---------- */
function CaseRunner({ c }: { c: CaseStudy }) {
  const { p, update } = useStore();
  const [nodeId, setNodeId] = useState(c.start);
  const [picked, setPicked] = useState<number | null>(null);
  const [path, setPath] = useState<{ prompt: string; label: string; correct: boolean }[]>([]);
  const [done, setDone] = useState(false);
  const node = c.nodes.find((n) => n.id === nodeId)!;
  const opt = picked !== null ? node.options[picked] : null;

  const choose = (k: number) => {
    const o = node.options[k];
    setPicked(k);
    setPath((x) => [...x, { prompt: node.prompt, label: o.label, correct: o.correct }]);
  };
  const advance = () => {
    if (!opt) return;
    if (opt.correct && !opt.next) {
      setDone(true);
      update((s) => ({ ...s, casesDone: { ...s.casesDone, [c.id]: true } }));
    } else if (opt.correct && opt.next) {
      setNodeId(opt.next);
    }
    setPicked(null);
  };
  const restart = () => { setNodeId(c.start); setPicked(null); setPath([]); setDone(false); };

  return (
    <section className="case" data-testid={`case-${c.id}`}>
      <header>
        <h2>{c.title}{p.casesDone[c.id] && <span className="badge badge-ok">completed</span>}</h2>
        <span className="badge badge-teach">Illustrative case — not a real patient</span>
      </header>
      <p className="case-setting">{c.setting}</p>
      {!done ? (
        <>
          {node.observation && <p className="observation"><strong>Observation:</strong> {node.observation}</p>}
          <fieldset className="quiz-q">
            <legend>{node.prompt}</legend>
            <div className="quiz-opts">
              {node.options.map((o, k) => (
                <button type="button" key={k} className={`quiz-opt ${picked === k ? (o.correct ? 'correct' : 'wrong') : ''}`} disabled={picked !== null} onClick={() => choose(k)} aria-pressed={picked === k}>
                  {o.label}
                </button>
              ))}
            </div>
          </fieldset>
          {opt && (
            <div className={`feedback ${opt.correct ? 'ok' : 'bad'}`} role="status">
              <strong>{opt.correct ? 'Correct.' : 'Reconsider.'}</strong> {opt.feedback} <SourceRefs refs={opt.refs} />
              <div>
                <button type="button" className="primary" onClick={advance}>{opt.correct ? (opt.next ? 'Continue' : 'Finish case') : 'Try another option'}</button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="feedback ok" role="status">
          <strong>Case complete.</strong> {c.wrapUp} <SourceRefs refs={c.refs} />
          <h4>Your path</h4>
          <ol className="log">{path.map((s, i) => <li key={i} className={s.correct ? 'ok' : 'bad'}><span className="log-mark">{s.correct ? '✓' : '✗'}</span> {s.label}</li>)}</ol>
          <button type="button" onClick={restart}>Replay case</button>
        </div>
      )}
    </section>
  );
}

export function CasesPage() {
  return (
    <article className="page">
      <h1>Simulated cases</h1>
      <p className="lead">Branching decisions with feedback. Every case is an invented teaching scenario; nothing here is patient-specific or clinical advice.</p>
      {ch.cases.map((c) => <CaseRunner key={c.id} c={c} />)}
    </article>
  );
}

/* ---------- Glossary ---------- */
export function GlossaryPage() {
  const [q, setQ] = useState('');
  const list = ch.glossary
    .filter((g) => (g.term + ' ' + (g.aka ?? []).join(' ') + ' ' + g.definition).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.term.localeCompare(b.term));
  return (
    <article className="page">
      <h1>Glossary</h1>
      <p className="lead">Definitions are taken from the source unless marked <span className="badge badge-teach">teaching</span>.</p>
      <label className="search-field">
        <span className="sr-only">Filter glossary</span>
        <input type="search" placeholder="Filter terms…" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      <dl className="glossary">
        {list.map((g) => (
          <div key={g.term} className="gl-item">
            <dt>
              {g.term}
              {g.aka && <span className="muted"> — also: {g.aka.join(', ')}</span>}
              {g.origin === 'teaching' && <span className="badge badge-teach">teaching</span>}
            </dt>
            <dd>{g.definition} <SourceRefs refs={g.refs} /></dd>
          </div>
        ))}
      </dl>
      {list.length === 0 && <p className="note">No terms match “{q}”.</p>}
    </article>
  );
}

/* ---------- Bookmarks ---------- */
export function BookmarksPage() {
  const { p, update } = useStore();
  const title = (key: string) => {
    const [kind, id] = key.split('/');
    if (kind === 'section') { const s = ch.sections.find((x) => x.id === id); return s ? `${s.number}. ${s.title}` : key; }
    return ({ lab: 'Virtual lab', cases: 'Simulated cases', quiz: 'Quiz', flashcards: 'Flashcards', glossary: 'Glossary', source: 'Source & flags' } as Record<string, string>)[kind] ?? key;
  };
  return (
    <article className="page">
      <h1>Bookmarks</h1>
      {p.bookmarks.length === 0 ? (
        <p className="note">No bookmarks yet. Use the ☆ Bookmark button at the top of any page.</p>
      ) : (
        <ul className="bm-list">
          {p.bookmarks.map((b) => (
            <li key={b}>
              <a href={hrefFor(b)} onClick={(e) => { e.preventDefault(); go(b); }}>{title(b)}</a>
              <button type="button" className="link" onClick={() => update((s) => ({ ...s, bookmarks: s.bookmarks.filter((x) => x !== b) }))} aria-label={`Remove bookmark ${title(b)}`}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
