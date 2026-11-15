import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import type { SourceRef } from '../../content/types';
import { usePrefersReducedMotion } from '../../lib/store';
import { speakSequence, speechSupported } from '../../lib/speech';
import { SourceRefs } from '../SourceRef';

export interface PlayerStep {
  caption: string;
  refs: SourceRef[];
  /** Marks a caption that is a teaching addition, not from the source. */
  teaching?: boolean;
}

const BASE_MS = 4200;
const SPEEDS = [0.5, 1, 1.5, 2];

export function usePlayer(count: number) {
  const reduced = usePrefersReducedMotion();
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  useEffect(() => {
    if (i >= count) setI(Math.max(0, count - 1));
  }, [count, i]);
  useEffect(() => {
    if (!playing) return;
    if (i >= count - 1) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => setI((x) => Math.min(count - 1, x + 1)), BASE_MS / speed);
    return () => window.clearTimeout(t);
  }, [playing, i, count, speed]);
  const transitionMs = reduced ? 0 : Math.round(900 / speed);
  return { i, setI, playing, setPlaying, speed, setSpeed, transitionMs, reduced };
}

export type PlayerApi = ReturnType<typeof usePlayer>;

export function Player({
  title,
  steps,
  api,
  children,
  controlsExtra,
  legend,
}: {
  title: string;
  steps: PlayerStep[];
  api: PlayerApi;
  children: ReactNode;
  controlsExtra?: ReactNode;
  legend?: ReactNode;
}) {
  const { i, setI, playing, setPlaying, speed, setSpeed, reduced } = api;
  const step = steps[Math.min(i, steps.length - 1)];
  const [narrate, setNarrate] = useState(false);
  const stopRef = useRef<() => void>(() => {});
  const last = steps.length - 1;

  useEffect(() => {
    if (!narrate) return;
    stopRef.current();
    stopRef.current = speakSequence([step.caption], () => {}, () => {}, speed > 1 ? 1.15 : 1);
  }, [narrate, step.caption, speed]);
  useEffect(() => () => stopRef.current(), []);

  const back = useCallback(() => { setPlaying(false); setI((x) => Math.max(0, x - 1)); }, [setI, setPlaying]);
  const fwd = useCallback(() => { setPlaying(false); setI((x) => Math.min(last, x + 1)); }, [setI, setPlaying, last]);
  const replay = useCallback(() => { setI(0); setPlaying(true); }, [setI, setPlaying]);
  const toggle = useCallback(() => {
    if (i >= last) { setI(0); setPlaying(true); } else setPlaying((p) => !p);
  }, [i, last, setI, setPlaying]);

  const onKey = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === 'SELECT') return;
    if (e.key === 'ArrowRight') { e.preventDefault(); fwd(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); back(); }
    else if (e.key === ' ' && (e.target as HTMLElement).tagName !== 'BUTTON') { e.preventDefault(); toggle(); }
    else if (e.key === 'Home') { e.preventDefault(); setPlaying(false); setI(0); }
  };

  return (
    <section className="player" aria-label={`Animation: ${title}`} onKeyDown={onKey} tabIndex={-1}>
      <div className="player-stage">{children}</div>
      {legend}
      <div className="player-caption" aria-live="polite">
        <span className="step-count">Step {i + 1} of {steps.length}</span>
        {step.teaching && <span className="badge badge-teach">Teaching model</span>}
        <p>{step.caption}</p>
        {step.refs.length > 0 && <SourceRefs refs={step.refs} />}
      </div>
      <div className="player-controls" role="group" aria-label="Animation controls">
        <button type="button" onClick={() => { setPlaying(false); setI(0); }} aria-label="Go to first step" title="First step (Home)">⏮</button>
        <button type="button" onClick={back} disabled={i === 0} aria-label="Previous step" title="Previous step (←)">◀</button>
        <button type="button" className="primary" onClick={toggle} aria-label={playing ? 'Pause' : i >= last ? 'Replay from start' : 'Play'} aria-pressed={playing}>
          {playing ? '⏸ Pause' : i >= last ? '↻ Replay' : '▶ Play'}
        </button>
        <button type="button" onClick={fwd} disabled={i === last} aria-label="Next step" title="Next step (→)">▶</button>
        <button type="button" onClick={replay} aria-label="Replay from start">↻</button>
        <label className="speed">
          Speed
          <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} aria-label="Playback speed">
            {SPEEDS.map((s) => <option key={s} value={s}>{s}×</option>)}
          </select>
        </label>
        <label className="narrate">
          <input
            type="checkbox"
            checked={narrate}
            disabled={!speechSupported()}
            onChange={(e) => { setNarrate(e.target.checked); if (!e.target.checked) stopRef.current(); }}
          />
          Read captions aloud{!speechSupported() && ' (not supported in this browser)'}
        </label>
        {controlsExtra}
      </div>
      <ol className="step-dots" aria-label="Jump to step">
        {steps.map((s, k) => (
          <li key={k}>
            <button type="button" aria-label={`Step ${k + 1}: ${s.caption}`} aria-current={k === i ? 'step' : undefined} className={k === i ? 'on' : k < i ? 'done' : ''} onClick={() => { setPlaying(false); setI(k); }} />
          </li>
        ))}
      </ol>
      {reduced && <p className="muted small">Reduced motion is on: steps change without movement.</p>}
    </section>
  );
}
