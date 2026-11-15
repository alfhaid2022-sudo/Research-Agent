import { useEffect, useRef, useState, type ReactNode } from 'react';
import { currentChapter as ch } from '../content/registry';
import type { InteractiveKey, Section } from '../content/types';
import { useStore } from '../lib/store';
import { go } from '../lib/router';
import { speakSequence, speechSupported, splitSentences } from '../lib/speech';
import { ReactionScene } from './anim/ReactionScene';
import { CoatingGallery, DetectionLimits, ReactionExplorer, Troubleshooter } from './Explorers';
import { AhgProduction, Attributions, CheckCellScene, FactoidCards, HistoryTimeline, PatternFlowchart, ResultsMap, VirtualLabLink } from './Panels';
import { QuizQuestion } from './Learning';
import { SourceRefs } from './SourceRef';

function Interactive({ k }: { k: InteractiveKey }) {
  switch (k) {
    case 'coating-gallery': return <CoatingGallery />;
    case 'procedure-animation': return <ReactionScene mode="procedure" />;
    case 'crosslink-animation': return <ReactionScene mode="crosslink" />;
    case 'reaction-explorer': return <ReactionExplorer />;
    case 'virtual-lab-link': return <VirtualLabLink />;
    case 'factoid-cards': return <FactoidCards />;
    case 'ahg-production': return <AhgProduction />;
    case 'troubleshooter': return <Troubleshooter />;
    case 'results-map': return <ResultsMap />;
    case 'pattern-flowchart': return <PatternFlowchart />;
    case 'detection-limits': return <DetectionLimits />;
    case 'check-cell-animation': return <CheckCellScene />;
    case 'history-timeline': return <HistoryTimeline />;
    case 'attributions': return <Attributions />;
  }
}

type StageKey = 'explain' | 'mechanism' | 'interact' | 'interpret' | 'check';
const STAGE_LABEL: Record<StageKey, string> = {
  explain: 'Explain',
  mechanism: 'See it',
  interact: 'Try it',
  interpret: 'Interpret',
  check: 'Check',
};

function Narrator({ s }: { s: Section }) {
  const [on, setOn] = useState(false);
  const [line, setLine] = useState(-1);
  const stop = useRef<() => void>(() => {});
  const lines = s.explain.flatMap((p) => splitSentences(p.text));
  useEffect(() => () => stop.current(), []);
  useEffect(() => { stop.current(); setOn(false); setLine(-1); }, [s.id]);
  if (!speechSupported())
    return <p className="small muted">Narration is not available in this browser (no Web Speech API). All text is shown on screen.</p>;
  return (
    <div className="narrator">
      <button
        type="button"
        onClick={() => {
          if (on) { stop.current(); setOn(false); setLine(-1); return; }
          setOn(true);
          stop.current = speakSequence(lines, setLine, () => { setOn(false); setLine(-1); });
        }}
        aria-pressed={on}
      >
        {on ? '■ Stop narration' : '🔊 Listen to this section'}
      </button>
      {on && line >= 0 && (
        <p className="caption-live" aria-live="polite"><span className="small muted">Now reading:</span> {lines[line]}</p>
      )}
    </div>
  );
}

export function SectionPage({ s }: { s: Section }) {
  const { p, update } = useStore();
  const stages: StageKey[] = ['explain', ...(s.mechanism ? ['mechanism' as const] : []), ...(s.interact ? ['interact' as const] : []), ...(s.interpret.length ? ['interpret' as const] : []), ...(s.check.length ? ['check' as const] : [])];
  const [revealed, setRevealed] = useState(1);
  useEffect(() => { setRevealed(p.completed[s.id] ? stages.length : 1); }, [s.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const idx = ch.sections.findIndex((x) => x.id === s.id);
  const prev = ch.sections[idx - 1];
  const next = ch.sections[idx + 1];
  const checksDone = s.check.every((q) => p.quizAnswers[q] !== undefined);
  const complete = !!p.completed[s.id];

  useEffect(() => {
    if (revealed >= stages.length && (s.check.length === 0 || checksDone) && !complete)
      update((x) => ({ ...x, completed: { ...x.completed, [s.id]: true } }));
  }, [revealed, stages.length, checksDone, complete, s.id, s.check.length, update]);

  const block = (key: StageKey, n: number, body: ReactNode) => {
    const shown = n < revealed;
    return (
      <section key={key} className={`stage stage-${key} ${shown ? '' : 'locked'}`} aria-labelledby={`st-${s.id}-${key}`}>
        <h2 id={`st-${s.id}-${key}`}><span className="stage-num">{n + 1}</span> {STAGE_LABEL[key]}</h2>
        {shown ? body : null}
        {shown && n === revealed - 1 && n < stages.length - 1 && (
          <button type="button" className="continue" onClick={() => setRevealed(revealed + 1)}>
            Continue to “{STAGE_LABEL[stages[n + 1]]}” ↓
          </button>
        )}
      </section>
    );
  };

  const bodies: Record<StageKey, ReactNode> = {
    explain: (
      <>
        {s.explain.map((para, i) =>
          para.quote ? (
            <blockquote key={i} className="src-quote">
              <p>“{para.text}”</p>
              <SourceRefs refs={para.refs} />
            </blockquote>
          ) : (
            <p key={i}>{para.text} <SourceRefs refs={para.refs} /></p>
          ),
        )}
        {s.teachingNotes?.map((t) => (
          <aside key={t.title} className="teaching-note">
            <span className="badge badge-teach">Teaching note — not from the source</span>
            <strong>{t.title}.</strong> {t.text}
          </aside>
        ))}
        <Narrator s={s} />
      </>
    ),
    mechanism: s.mechanism ? (<><p className="intro">{s.mechanism.intro}</p><Interactive k={s.mechanism.key} /></>) : null,
    interact: s.interact ? (<><p className="intro">{s.interact.intro}</p><Interactive k={s.interact.key} /></>) : null,
    interpret: (
      <>
        <ul className="interpret">
          {s.interpret.map((para, i) => <li key={i}>{para.text} <SourceRefs refs={para.refs} /></li>)}
        </ul>
        {s.flags?.map((fid) => {
          const f = ch.flags.find((x) => x.id === fid)!;
          return (
            <aside key={fid} className="flag-note">
              <strong>⚑ Source note: {f.title}.</strong> {f.text} <SourceRefs refs={f.refs} />
            </aside>
          );
        })}
      </>
    ),
    check: (
      <>
        {s.check.map((qid) => <QuizQuestion key={qid} q={ch.quiz.find((q) => q.id === qid)!} />)}
      </>
    ),
  };

  return (
    <article className="page section-page" data-testid={`section-${s.id}`}>
      <p className="eyebrow">Section {s.number} of {ch.sections.length}</p>
      <h1>{s.title}</h1>
      <p className="objective"><strong>Objective:</strong> {s.objective}</p>
      <p className="src-line">Source: <SourceRefs refs={s.refs} /></p>
      <nav className="stage-tabs" aria-label="Learning stages">
        {stages.map((k, n) => (
          <button key={k} type="button" className={n < revealed ? 'on' : ''} onClick={() => { setRevealed(Math.max(revealed, n + 1)); setTimeout(() => document.getElementById(`st-${s.id}-${k}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30); }}>
            {n + 1}. {STAGE_LABEL[k]}
          </button>
        ))}
        <button type="button" className="link" onClick={() => setRevealed(stages.length)}>Show all</button>
      </nav>
      {stages.map((k, n) => block(k, n, bodies[k]))}
      {complete && <p className="done-banner" role="status">✓ Section complete — progress saved on this device.</p>}
      <nav className="pager" aria-label="Section navigation">
        {prev ? <button type="button" onClick={() => go(`section/${prev.id}`)}>← {prev.number}. {prev.title}</button> : <span />}
        {next ? <button type="button" className="primary" onClick={() => go(`section/${next.id}`)}>{next.number}. {next.title} →</button> : <button type="button" className="primary" onClick={() => go('quiz')}>Take the quiz →</button>}
      </nav>
    </article>
  );
}
