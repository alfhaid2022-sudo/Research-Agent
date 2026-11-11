import { useEffect, useMemo, useRef, useState } from 'react';
import type { SourceRef } from '../content/types';
import { coatingLabel, defaultSetup, evaluateTube, reagentLabel, type Coating, type Reagent, type TubeSetup } from '../lib/datLogic';
import { useStore } from '../lib/store';
import { Tube } from './anim/primitives';
import { SourceRefs } from './SourceRef';

// Guided tube DAT built from the five steps in the source. Specimens are
// illustrative. Quantities (volumes, speeds, times) are deliberately absent
// because the source does not give them.

interface Specimen { id: string; name: string; coating: Coating }
const SPECIMENS: Specimen[] = [
  { id: 'S1', name: 'Specimen 1', coating: 'IgG' },
  { id: 'S2', name: 'Specimen 2', coating: 'C3d' },
  { id: 'S3', name: 'Specimen 3', coating: 'both' },
  { id: 'S4', name: 'Specimen 4', coating: 'none' },
];

interface Choice<T> { label: string; value: T; ok: boolean; note: string; refs: SourceRef[] }
interface LogEntry { step: string; choice: string; ok: boolean; note: string; refs: SourceRef[] }

const WASH: Choice<TubeSetup['washed']>[] = [
  { label: 'Wash the red cells to remove lingering, unbound antibodies', value: 'adequate', ok: true, note: 'Step 1 of the source procedure.', refs: [{ panel: 'steps', detail: 'Step 1' }] },
  { label: 'Skip washing — the sample looks clean', value: 'inadequate', ok: false, note: 'Improper or under-washing is a listed cause of a false-negative DAT.', refs: [{ panel: 'results', detail: 'False negative' }] },
  { label: 'Wash briefly and incompletely to save time', value: 'inadequate', ok: false, note: 'Under-washing is a listed cause of a false-negative DAT.', refs: [{ panel: 'results', detail: 'False negative' }] },
];

const VIAL: Choice<boolean>[] = [
  { label: 'Use AHG that has been stored and handled properly', value: true, ok: true, note: 'Active reagent.', refs: [{ panel: 'results', detail: 'False negative' }] },
  { label: 'Use a vial that was left out and handled improperly', value: false, ok: false, note: 'Inactive AHG due to improper storage and handling is a listed false-negative cause.', refs: [{ panel: 'results', detail: 'False negative' }] },
];

const ADD: Choice<'now' | 'delay' | 'skip'>[] = [
  { label: 'Suspend the washed cells and add AHG without delay', value: 'now', ok: true, note: 'Step 2 of the source procedure.', refs: [{ panel: 'steps', detail: 'Step 2' }] },
  { label: 'Set the washed cells aside and add AHG later', value: 'delay', ok: false, note: 'Delay in the addition of AHG after washing is listed by the source (under both false negative and false positive). The result is not interpretable.', refs: [{ panel: 'results' }] },
  { label: 'Go straight to the centrifuge', value: 'skip', ok: false, note: 'Failure to add AHG reagents is a listed false-negative cause.', refs: [{ panel: 'results', detail: 'False negative' }] },
];

const SPIN: Choice<TubeSetup['centrifuge']>[] = [
  { label: 'Centrifuge as per the laboratory procedure', value: 'correct', ok: true, note: 'Step 3. (The source does not give speed or time.)', refs: [{ panel: 'steps', detail: 'Step 3' }] },
  { label: 'Spin briefly — under-centrifuge', value: 'under', ok: false, note: 'Under-centrifuging is a listed false-negative cause.', refs: [{ panel: 'results', detail: 'False negative' }] },
  { label: 'Spin extra hard — over-centrifuge', value: 'over', ok: false, note: 'Over-centrifugation is a listed false-positive cause.', refs: [{ panel: 'results', detail: 'False positive' }] },
];

type Stage = 'specimen' | 'wash' | 'reagent' | 'add' | 'spin' | 'read' | 'validate' | 'check-read' | 'mono' | 'debrief';
const STAGE_ORDER: Stage[] = ['specimen', 'wash', 'reagent', 'add', 'spin', 'read', 'validate', 'check-read', 'mono', 'debrief'];
const STAGE_TITLE: Record<Stage, string> = {
  specimen: 'Choose a specimen',
  wash: 'Step 1 · Wash',
  reagent: 'Step 2 · Choose the AHG reagent',
  add: 'Step 2 · Suspend and add AHG',
  spin: 'Step 3 · Centrifuge',
  read: 'Step 4 · Read',
  validate: 'Step 5 · Validate the negative',
  'check-read': 'Step 5 · Read the check cells',
  mono: 'Follow-up · Monospecific DAT',
  debrief: 'Debrief',
};

export function VirtualLab() {
  const { update } = useStore();
  const [stage, setStage] = useState<Stage>('specimen');
  const [spec, setSpec] = useState<Specimen | null>(null);
  const [hidden, setHidden] = useState(false);
  const [setup, setSetup] = useState<TubeSetup>({ ...defaultSetup });
  const [log, setLog] = useState<LogEntry[]>([]);
  const [readAnswer, setReadAnswer] = useState<boolean | null>(null);
  const [monoPick, setMonoPick] = useState<string | null>(null);

  const out = useMemo(() => evaluateTube(setup), [setup]);
  const record = (e: LogEntry) => setLog((l) => [...l, e]);

  const start = (s: Specimen, blind: boolean) => {
    setSpec(s);
    setHidden(blind);
    setSetup({ ...defaultSetup, coating: s.coating });
    setLog([]);
    setReadAnswer(null);
    setMonoPick(null);
    setStage('wash');
  };
  const restart = () => { setStage('specimen'); setSpec(null); setLog([]); };

  const finish = () => setStage('debrief');
  // Count a completed run once, after the final log entry has been recorded.
  const counted = useRef(false);
  useEffect(() => {
    if (stage !== 'debrief') { counted.current = false; return; }
    if (counted.current) return;
    counted.current = true;
    const clean = log.every((e) => e.ok);
    update((p) => ({ ...p, labRuns: p.labRuns + 1, labCleanRuns: p.labCleanRuns + (clean ? 1 : 0) }));
  }, [stage, log, update]);

  const pick = <T,>(label: string, c: Choice<T>, patch: Partial<TubeSetup>, next: Stage) => {
    record({ step: label, choice: c.label, ok: c.ok, note: c.note, refs: c.refs });
    setSetup((s) => ({ ...s, ...patch }));
    setStage(next);
  };

  const monoResults = useMemo(() => {
    if (!spec) return null;
    const r = (reagent: Reagent) => evaluateTube({ ...setup, reagent }).agglutination;
    return { antiIgG: r('antiIgG'), antiC3d: r('antiC3d') };
  }, [setup, spec]);

  const expectedColumn = monoResults
    ? monoResults.antiIgG && monoResults.antiC3d
      ? 'both'
      : monoResults.antiIgG
        ? 'igg'
        : monoResults.antiC3d
          ? 'c3'
          : 'neither'
    : null;

  const stageIdx = STAGE_ORDER.indexOf(stage);

  return (
    <div className="lab" data-testid="virtual-lab">
      <div className="lab-head">
        <ol className="lab-progress" aria-label="Lab progress">
          {['Specimen', 'Wash', 'Add AHG', 'Centrifuge', 'Read', 'Validate', 'Debrief'].map((s, k) => {
            const map = [0, 1, 3, 4, 5, 6, 9];
            const state = stageIdx > map[k] ? 'done' : stageIdx >= map[k] && (k === 6 || stageIdx < map[k + 1]) ? 'on' : '';
            return <li key={s} className={state} aria-current={state === 'on' ? 'step' : undefined}>{s}</li>;
          })}
        </ol>
        {spec && (
          <p className="small muted">
            {spec.name} · coating: {hidden && stage !== 'debrief' ? 'unknown (blind run)' : coatingLabel[spec.coating]} · reagent: {reagentLabel[setup.reagent]}
          </p>
        )}
      </div>

      <div className="lab-bench">
        <div className="lab-main" aria-live="polite">
          <h3>{STAGE_TITLE[stage]}</h3>

          {stage === 'specimen' && (
            <>
              <p>Choose an illustrative specimen. A blind run hides its coating until the debrief.</p>
              <div className="choice-list">
                <button type="button" className="choice" onClick={() => start(SPECIMENS[Math.floor(Math.random() * SPECIMENS.length)], true)}>
                  <strong>Blind run</strong> — random specimen, coating hidden
                </button>
                {SPECIMENS.map((s) => (
                  <button type="button" key={s.id} className="choice" onClick={() => start(s, false)}>
                    {s.name} — cells coated with: {coatingLabel[s.coating]}
                  </button>
                ))}
              </div>
              <p className="muted small">Illustrative specimens, not patient data. The simulator follows the five steps in the source and its lists of false-negative and false-positive causes; it contains no volumes, speeds or times because the source gives none.</p>
            </>
          )}

          {stage === 'wash' && (
            <ChoiceList choices={WASH} onPick={(c) => pick('Wash', c, { washed: c.value }, 'reagent')} />
          )}

          {stage === 'reagent' && (
            <>
              <p>The source’s algorithm starts from a polyspecific DAT; monospecific reagents follow a positive result.</p>
              <div className="choice-list">
                {(['poly', 'antiIgG', 'antiC3d'] as Reagent[]).map((r) => (
                  <button type="button" key={r} className="choice" onClick={() => {
                    record({ step: 'Reagent', choice: reagentLabel[r], ok: r === 'poly', note: r === 'poly' ? 'Polyspecific detects IgG and C3d; matches the start of the source’s algorithm.' : 'Acceptable as a test, but it can only report its own target, and the source’s algorithm starts with polyspecific.', refs: [{ panel: 'principle' }, { panel: 'patterns' }] });
                    setSetup((s) => ({ ...s, reagent: r }));
                    setStage('add');
                  }}>{reagentLabel[r]}</button>
                ))}
              </div>
              <h4 className="sub">Reagent vial</h4>
              <p className="small muted">Choose the vial in the next step.</p>
            </>
          )}

          {stage === 'add' && (
            <>
              <h4 className="sub">Which vial?</h4>
              <ChoiceList choices={VIAL} name="vial" onPick={(c) => { record({ step: 'Vial', choice: c.label, ok: c.ok, note: c.note, refs: c.refs }); setSetup((s) => ({ ...s, ahgActive: c.value })); }} once />
              <h4 className="sub">Then</h4>
              <ChoiceList choices={ADD} onPick={(c) => pick('Add AHG', c, { ahgAdded: c.value !== 'skip', delayBeforeAhg: c.value === 'delay' }, 'spin')} />
            </>
          )}

          {stage === 'spin' && (
            <ChoiceList choices={SPIN} onPick={(c) => pick('Centrifuge', c, { centrifuge: c.value }, 'read')} />
          )}

          {stage === 'read' && (
            <>
              <p>Look at the tube. What do you see?</p>
              <div className="choice-list row">
                {[true, false].map((v) => (
                  <button type="button" key={String(v)} className={`choice ${readAnswer === v ? 'on' : ''}`} onClick={() => {
                    setReadAnswer(v);
                    const ok = v === out.agglutination;
                    record({ step: 'Read', choice: v ? 'Agglutination present' : 'No agglutination', ok, note: ok ? 'Reading matches the tube.' : 'Look again: the reading does not match the tube.', refs: [{ panel: 'steps', detail: 'Step 4' }] });
                    if (!ok) return;
                    setStage(v ? (setup.reagent === 'poly' ? 'mono' : 'debrief') : 'validate');
                  }}>{v ? 'Agglutination present' : 'No agglutination'}</button>
                ))}
              </div>
              <p className="muted small">The source grades agglutination Negative to 4+ but does not describe grade criteria, so this simulator records present/absent only.</p>
            </>
          )}

          {stage === 'validate' && (
            <>
              <p>The tube is non-reactive. What next?</p>
              <div className="choice-list">
                <button type="button" className="choice" onClick={() => { record({ step: 'Validate', choice: 'Add check cells', ok: true, note: 'Negative reactions should be validated using antibody-coated reagent cells.', refs: [{ panel: 'steps', detail: 'Step 5' }] }); setStage('check-read'); }}>
                  Add antibody-coated reagent cells (check cells)
                </button>
                <button type="button" className="choice" onClick={() => { record({ step: 'Validate', choice: 'Report negative without check cells', ok: false, note: 'Negative reactions should always be validated before they are trusted.', refs: [{ panel: 'proximate' }] }); }}>
                  Report the DAT as negative now
                </button>
              </div>
            </>
          )}

          {stage === 'check-read' && (
            <>
              <p>Check cells added and re-read. Interpret:</p>
              <div className="choice-list">
                {[
                  { label: 'Check cells agglutinate → negative is valid', ok: out.checkCellsAgglutinate === true },
                  { label: 'Check cells do not agglutinate → possible technical error; repeat', ok: out.checkCellsAgglutinate === false },
                ].map((c) => (
                  <button type="button" key={c.label} className="choice" onClick={() => {
                    record({ step: 'Interpret check cells', choice: c.label, ok: c.ok, note: c.ok ? 'Interpretation matches the check-cell tube.' : 'Look at the check-cell tube again.', refs: [{ panel: 'proximate' }] });
                    if (c.ok) finish();
                  }}>{c.label}</button>
                ))}
              </div>
            </>
          )}

          {stage === 'mono' && monoResults && (
            <>
              <p>Polyspecific DAT positive. Monospecific DAT (same technique):</p>
              <div className="tubes">
                <Tube agglutinated={monoResults.antiIgG} label={`Anti-IgG: ${monoResults.antiIgG ? '+' : '−'}`} />
                <Tube agglutinated={monoResults.antiC3d} label={`Anti-C3d: ${monoResults.antiC3d ? '+' : '−'}`} />
              </div>
              <p>Which column of the source’s Classic Patterns applies?</p>
              <div className="choice-list row">
                {[['igg', 'Anti-IgG'], ['both', 'Anti-IgG & Anti-C3'], ['c3', 'Anti-C3'], ['neither', 'Neither (not in source)']].map(([k, l]) => (
                  <button type="button" key={k} className={`choice ${monoPick === k ? 'on' : ''}`} onClick={() => {
                    setMonoPick(k);
                    const ok = k === expectedColumn;
                    record({ step: 'Pattern', choice: l, ok, note: ok ? 'Matches the monospecific results.' : 'Compare with the two monospecific tubes.', refs: [{ panel: 'patterns' }] });
                    if (ok) finish();
                  }}>{l}</button>
                ))}
              </div>
            </>
          )}

          {stage === 'debrief' && spec && (
            <Debrief spec={spec} setup={setup} log={log} onRestart={restart} />
          )}
        </div>

        <aside className="lab-side" aria-label="Tube view">
          {['read', 'validate', 'check-read', 'mono', 'debrief'].includes(stage) ? (
            <div className="tubes">
              <Tube agglutinated={out.agglutination} label="Patient tube" />
              {['check-read'].includes(stage) || (stage === 'debrief' && out.checkCellsAgglutinate !== null && !out.agglutination) ? (
                <Tube agglutinated={out.checkCellsAgglutinate} label="After check cells" />
              ) : null}
            </div>
          ) : (
            <Tube agglutinated={stage === 'specimen' ? null : false} label={stage === 'specimen' ? 'Empty tube' : 'Cell suspension'} ms={0} />
          )}
          <p className="small muted">Illustrative tube, not a grading reference.</p>
        </aside>
      </div>

      {log.length > 0 && stage !== 'debrief' && (
        <details className="lab-log">
          <summary>Bench log ({log.length})</summary>
          <LogList log={log} />
        </details>
      )}
    </div>
  );
}

function ChoiceList<T>({ choices, onPick, once, name }: { choices: Choice<T>[]; onPick: (c: Choice<T>) => void; once?: boolean; name?: string }) {
  const [sel, setSel] = useState<number | null>(null);
  return (
    <div className="choice-list" role={once ? 'radiogroup' : undefined} aria-label={name}>
      {choices.map((c, i) => (
        <button type="button" key={i} role={once ? 'radio' : undefined} aria-checked={once ? sel === i : undefined} className={`choice ${sel === i ? 'on' : ''}`} onClick={() => { if (once && sel !== null) return; setSel(i); onPick(c); }} disabled={once && sel !== null && sel !== i}>
          {c.label}
        </button>
      ))}
    </div>
  );
}

function LogList({ log }: { log: LogEntry[] }) {
  return (
    <ol className="log">
      {log.map((e, i) => (
        <li key={i} className={e.ok ? 'ok' : 'bad'}>
          <span className="log-mark" aria-label={e.ok ? 'correct' : 'mistake'}>{e.ok ? '✓' : '✗'}</span>
          <strong>{e.step}:</strong> {e.choice}. <span className="muted">{e.note}</span> <SourceRefs refs={e.refs} />
        </li>
      ))}
    </ol>
  );
}

function Debrief({ spec, setup, log, onRestart }: { spec: Specimen; setup: TubeSetup; log: LogEntry[]; onRestart: () => void }) {
  const out = evaluateTube(setup);
  const mistakes = log.filter((e) => !e.ok).length;
  return (
    <div className="debrief" data-testid="lab-debrief">
      <p className="lead">
        {spec.name} was coated with <strong>{coatingLabel[spec.coating]}</strong>. Your patient tube showed{' '}
        <strong>{out.agglutination ? 'agglutination' : 'no agglutination'}</strong> with {reagentLabel[setup.reagent].toLowerCase()}.
      </p>
      <p className={`verdict ${out.classification}`}>Classification: {out.classification.replace('-', ' ')}</p>
      {out.techniqueErrors.length > 0 && (
        <>
          <h4>Technique errors that affected the result</h4>
          <ul className="reasons">{out.techniqueErrors.map((r, i) => <li key={i}>{r.text} <SourceRefs refs={r.refs} /></li>)}</ul>
        </>
      )}
      <h4>Your bench log — {mistakes === 0 ? 'no mistakes' : `${mistakes} mistake${mistakes > 1 ? 's' : ''}`}</h4>
      <LogList log={log} />
      <button type="button" className="primary" onClick={onRestart}>Run another specimen</button>
    </div>
  );
}
