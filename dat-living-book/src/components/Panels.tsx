import { useState } from 'react';
import { currentChapter as ch } from '../content/registry';
import type { SourceRef } from '../content/types';
import { AhgShape, IgGShape, Legend, OnMembrane, RedCell, moveStyle } from './anim/primitives';
import { Player, usePlayer, type PlayerStep } from './anim/Player';
import { SourceRefs, SourceLink } from './SourceRef';
import { go } from '../lib/router';

/* ---------- Check cells ---------- */
const CC_STEPS: Record<'valid' | 'invalid', PlayerStep[]> = {
  valid: [
    { caption: 'A non-reactive tube: the patient’s cells did not agglutinate. Free AHG is still in the solution.', refs: [{ panel: 'proximate' }] },
    { caption: 'Antibody-coated reagent cells (check cells) are added to the non-reactive solution.', refs: [{ panel: 'proximate' }] },
    { caption: 'The AHG in the tube bridges the check cells: agglutination. The negative result is validated.', refs: [{ panel: 'proximate' }, { panel: 'steps', detail: 'Step 5' }] },
  ],
  invalid: [
    { caption: 'A non-reactive tube — but here no usable AHG is present (e.g., failure to add AHG, or inactive AHG).', refs: [{ panel: 'results', detail: 'False negative' }] },
    { caption: 'Check cells are added to the non-reactive solution.', refs: [{ panel: 'proximate' }] },
    { caption: 'Nothing bridges the check cells: no agglutination. This should trigger concern for possible technical error — the negative cannot be trusted.', refs: [{ panel: 'proximate' }] },
  ],
};

export function CheckCellScene() {
  const [mode, setMode] = useState<'valid' | 'invalid'>('valid');
  const steps = CC_STEPS[mode];
  const api = usePlayer(steps.length);
  const i = Math.min(api.i, steps.length - 1);
  const ms = api.transitionMs;
  const patient: [number, number][] = [[90, 210], [200, 250], [120, 110]];
  const ccStart: [number, number][] = [[400, -60], [500, -60]];
  const ccLand: [number, number][] = [[420, 140], [500, 220]];
  const ccJoined: [number, number][] = [[430, 170], [530, 170]];
  const cc = i === 0 ? ccStart : i === 1 ? ccLand : mode === 'valid' ? ccJoined : ccLand;
  const ahgFree: [number, number, number][] = [[300, 80, 20], [330, 270, -30]];
  return (
    <Player
      title="Check cells"
      steps={steps}
      api={api}
      legend={<Legend items={['rbc', 'check', 'igg', 'ahg']} />}
      controlsExtra={
        <fieldset className="seg" aria-label="Tube condition">
          <legend className="sr-only">Tube condition</legend>
          {(['valid', 'invalid'] as const).map((m) => (
            <label key={m} className={mode === m ? 'on' : ''}>
              <input type="radio" name="ccmode" checked={mode === m} onChange={() => { setMode(m); api.setI(0); api.setPlaying(false); }} />
              {m === 'valid' ? 'Active AHG present' : 'No usable AHG'}
            </label>
          ))}
        </fieldset>
      }
    >
      <svg viewBox="0 0 640 330" className="scene" role="img" aria-label={steps[i].caption}>
        <rect width="640" height="330" className="bg-vitro" />
        <text x="16" y="24" className="svg-label">IN VITRO · non-reactive DAT tube</text>
        {patient.map(([x, y], k) => <g key={k} style={moveStyle(x, y, 0, ms)}><RedCell /></g>)}
        {cc.map(([x, y], k) => (
          <g key={`c${k}`} style={moveStyle(x, y, 0, ms, i === 0 ? 0 : 1)}>
            <RedCell check />
            <OnMembrane angle={k === 0 ? 90 : 270}><IgGShape /></OnMembrane>
            <OnMembrane angle={k === 0 ? 210 : 30}><IgGShape /></OnMembrane>
          </g>
        ))}
        {mode === 'valid' &&
          ahgFree.map(([x, y, r], k) =>
            k === 0 && i === 2 ? (
              <g key={k} style={moveStyle(480, 170, 0, ms)}><AhgShape /></g>
            ) : (
              <g key={k} style={moveStyle(x, y, r, ms)}><AhgShape /></g>
            ),
          )}
        {i === 2 && (
          <text x="624" y="318" textAnchor="end" className={`svg-result ${mode === 'valid' ? 'pos' : 'neg'}`}>
            {mode === 'valid' ? 'Check cells agglutinate — negative valid' : 'No agglutination — suspect technical error'}
          </text>
        )}
      </svg>
    </Player>
  );
}

/* ---------- AHG production ---------- */
const AHG_STEPS: PlayerStep[] = [
  { caption: 'Animals (commonly rabbits) are immunized with human gamma globulin.', refs: [{ panel: 'ahg' }] },
  { caption: 'The animals respond by making anti-human globulin: antibodies against human gamma globulin and complement.', refs: [{ panel: 'ahg' }] },
  { caption: 'The AHG is purified before use — this is the Coombs reagent added in step 2.', refs: [{ panel: 'ahg' }, { panel: 'steps', detail: 'Step 2' }] },
];
export function AhgProduction() {
  const api = usePlayer(AHG_STEPS.length);
  const i = Math.min(api.i, AHG_STEPS.length - 1);
  const boxes = ['Human gamma globulin', 'Immunized animal (commonly rabbit)', 'Anti-human globulin made', 'Purified AHG reagent'];
  return (
    <Player title="How AHG is made" steps={AHG_STEPS} api={api}>
      <svg viewBox="0 0 640 150" className="scene" role="img" aria-label={AHG_STEPS[i].caption}>
        <rect width="640" height="150" className="bg-vitro" />
        {boxes.map((b, k) => {
          const active = k <= i + 1;
          const x = 12 + k * 157;
          return (
            <g key={k} style={{ opacity: active ? 1 : 0.28, transition: api.transitionMs ? `opacity ${api.transitionMs}ms` : 'none' }}>
              <rect x={x} y={40} width={140} height={70} rx={10} className={`flow-box ${k === i + 1 ? 'current' : ''}`} />
              <foreignObject x={x + 6} y={44} width={128} height={62}>
                <div className="flow-text">{b}</div>
              </foreignObject>
              {k < boxes.length - 1 && <text x={x + 145} y={80} className="svg-arrow">→</text>}
            </g>
          );
        })}
        <text x="12" y="140" className="svg-mini">Schematic flow; the source gives no further production details.</text>
      </svg>
    </Player>
  );
}

/* ---------- Results map ---------- */
const RESULT_CARDS: { title: string; sign: '−' | '+'; kind: string; items: string[]; ref: SourceRef }[] = [
  { title: 'False negative', sign: '−', kind: 'fn', items: ['Improper or under-washing', 'Under-centrifuging the sample', 'Failure to add AHG reagents', 'Addition of inactive AHG reagents due to improper storage and handling', 'Delay in the addition of AHG after washing ⚑'], ref: { panel: 'results', detail: 'False negative' } },
  { title: 'True negative', sign: '−', kind: 'tn', items: ['No antibody or complement detected on the surface of the red cells by the AHG reagents', 'DAT-negative hemolytic anemia (i.e., IgA mediated, drug mediated)'], ref: { panel: 'results', detail: 'True negative' } },
  { title: 'False positive', sign: '+', kind: 'fp', items: ['Nonspecific binding of the DAT reagents', 'Delay in the addition of AHG after washing ⚑', 'Over-centrifugation'], ref: { panel: 'results', detail: 'False positive' } },
  { title: 'True positive', sign: '+', kind: 'tp', items: ['Autoimmune HA: warm, cold, mixed; paroxysmal cold hemoglobinuria', 'Drug-induced hemolytic anemia', 'Alloimmune: transfusion related (acute hemolytic transfusion reaction; delayed hemolytic or serologic transfusion reaction)', 'Alloimmune: maternal alloantibodies crossing the placenta (HDFN)', 'Passive transfer of antibody in immunoglobulin preparations (e.g., IVIG)'], ref: { panel: 'results', detail: 'True positive' } },
];
export function ResultsMap() {
  const [sel, setSel] = useState<string | null>(null);
  return (
    <div className="results-map">
      <div className="rm-axis small muted"><span>− Result (no agglutination)</span><span>+ Result (agglutination)</span></div>
      <div className="rm-grid">
        {[RESULT_CARDS[0], RESULT_CARDS[2], RESULT_CARDS[1], RESULT_CARDS[3]].map((c) => (
          <div key={c.kind} className={`rm-card rm-${c.kind}`}>
            <h4>{c.sign} {c.title}</h4>
            <ul>
              {c.items.map((it) => (
                <li key={it}>
                  <button type="button" className={`chip ${sel === it + c.kind ? 'on' : ''}`} onClick={() => setSel(sel === it + c.kind ? null : it + c.kind)} aria-expanded={sel === it + c.kind}>
                    {it}
                  </button>
                  {sel === it + c.kind && (
                    <p className="small rm-note">
                      Listed by the source as a <strong>{c.title.toLowerCase()}</strong> {c.kind.startsWith('t') ? 'category' : 'cause'}.
                      {it.includes('⚑') && ' ⚑ The same item also appears in the opposite list; see the flagged note below.'}
                    </p>
                  )}
                </li>
              ))}
            </ul>
            <SourceRefs refs={[c.ref]} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Pattern flowchart ---------- */
const COLUMNS = [
  { key: 'igg', label: 'Anti-IgG', items: ['Warm Autoimmune Hemolytic Anemia (WAIHA)', 'Alloimmune hemolytic anemia (i.e., Acute or delayed hemolytic transfusion reaction)', 'Hemolytic disease of the fetus and newborn (HDFN)', 'Drug induced hemolytic anemia', 'Passive acquisition'], detail: 'column: Anti-IgG' },
  { key: 'both', label: 'Anti-IgG & Anti-C3', items: ['Warm Autoimmune Hemolytic Anemia (WAIHA)', 'Mixed Autoimmune hemolytic anemia', 'Drug induced hemolytic anemia'], detail: 'column: Anti-IgG & Anti-C3' },
  { key: 'c3', label: 'Anti-C3', items: ['Cold Agglutinin Disease', 'Paroxysmal cold hemoglobinuria', 'Drug induced hemolytic anemia'], detail: 'column: Anti-C3' },
];
export function PatternFlowchart() {
  const [stage, setStage] = useState(0);
  const [col, setCol] = useState<string | null>(null);
  const reset = () => { setStage(0); setCol(null); };
  return (
    <div className="flowchart" data-testid="pattern-flowchart">
      <ol className="fc-steps">
        <li className={stage >= 0 ? 'on' : ''}>
          <button type="button" className="fc-node" onClick={() => setStage(1)} aria-pressed={stage >= 1}>Positive polyspecific DAT</button>
        </li>
        <li className={stage >= 1 ? 'on' : 'off'} aria-hidden={stage < 1}>
          <span className="fc-arrow">↓</span>
          <button type="button" className="fc-node" disabled={stage < 1} onClick={() => setStage(2)} aria-pressed={stage >= 2}>Perform monospecific DAT</button>
        </li>
        <li className={stage >= 2 ? 'on' : 'off'} aria-hidden={stage < 2}>
          <span className="fc-arrow">↓</span>
          <span className="fc-node fc-q">What is positive?</span>
          <div className="fc-choices" role="group" aria-label="Monospecific result">
            {COLUMNS.map((c) => (
              <button type="button" key={c.key} disabled={stage < 2} className={`fc-choice ${col === c.key ? 'on' : ''}`} onClick={() => setCol(c.key)} aria-pressed={col === c.key}>
                {c.label}
              </button>
            ))}
            <button type="button" disabled={stage < 2} className={`fc-choice ghost ${col === 'neither' ? 'on' : ''}`} onClick={() => setCol('neither')} aria-pressed={col === 'neither'}>
              Neither
            </button>
          </div>
        </li>
      </ol>
      {col && col !== 'neither' && (() => {
        const c = COLUMNS.find((x) => x.key === col)!;
        return (
          <div className="fc-result" aria-live="polite" data-testid="pattern-result">
            <h4>{c.label} positive — the source lists:</h4>
            <ul>{c.items.map((it) => <li key={it}>{it}</li>)}</ul>
            <SourceRefs refs={[{ panel: 'patterns', detail: c.detail }]} />
            <p className="muted small">Drug-induced hemolytic anemia appears in every column: the pattern narrows the list, it does not diagnose.</p>
          </div>
        );
      })()}
      {col === 'neither' && (
        <div className="fc-result gap" aria-live="polite" data-testid="pattern-result">
          <h4>Not covered by the source</h4>
          <p>The source’s flowchart has no branch for a positive polyspecific DAT with both monospecific reagents negative. This book does not fill that gap.</p>
          <SourceRefs refs={[{ panel: 'patterns' }]} />
        </div>
      )}
      {stage > 0 && <button type="button" className="link" onClick={reset}>Start over</button>}
    </div>
  );
}

/* ---------- Factoid cards ---------- */
const FACTS = [
  { fact: 'A positive DAT can be found in 1 in 1,000 to 1 in 14,000 healthy blood donors without hemolysis.', guard: '“A positive DAT means hemolysis.” Not necessarily — these donors are not hemolyzing.' },
  { fact: 'The DAT is positive in ∼7 to 8% of all hospitalized patients; not all of these patients are hemolyzing.', guard: '“Every DAT-positive inpatient has immune hemolysis.” The source says otherwise.' },
  { fact: '97 to 99% of individuals with warm AIHA will have a positive result with anti-IgG, anti-C3d, or both.', guard: 'A negative DAT makes warm AIHA less likely but, by this figure, about 1–3% will not be positive.' },
  { fact: 'A positive DAT does not tell us the antigenic target of a discovered bound antibody, only that one is present.', guard: '“The DAT identifies the antibody.” It shows that one is bound, not what it targets.' },
  { fact: 'The strength of the DAT positivity generally correlates with the severity of hemolysis.', guard: '“Grade = severity.” The source says “generally”; strength is a guide.' },
];
export function FactoidCards() {
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  return (
    <div>
      <p className="muted small"><span className="badge badge-teach">Interpretation</span> Card backs are this book’s reasoning from the source fact, not source text.</p>
      <div className="fact-grid">
        {FACTS.map((f, i) => (
          <button type="button" key={i} className={`fact-card ${flipped[i] ? 'flipped' : ''}`} onClick={() => setFlipped({ ...flipped, [i]: !flipped[i] })} aria-pressed={!!flipped[i]}>
            {flipped[i] ? (
              <span><strong>Misreading it guards against</strong><br />{f.guard}</span>
            ) : (
              <span>{f.fact}<br /><em className="small">Tap to flip</em></span>
            )}
          </button>
        ))}
      </div>
      <SourceRefs refs={[{ panel: 'factoids' }]} />
    </div>
  );
}

/* ---------- History timeline ---------- */
const EVENTS = [
  { year: '1908', title: 'Moreschi', text: 'Interestingly, it seems that this principle was described several decades earlier by Moreschi in 1908.' },
  { year: '1945', title: 'Coombs, Mourant & Race', text: 'Described the use of anti-human globulin serum for the detection of red cell-bound non-agglutinating antibodies. The test was rapidly applied and helped describe blood groups, hemolytic anemia caused by antibodies, and HDFN.' },
  { year: 'Today', title: 'Still in use', text: 'The DAT is still in use and remains one of the most valuable tools in the Blood Bank.' },
];
export function HistoryTimeline() {
  const [sel, setSel] = useState(1);
  return (
    <div className="timeline">
      <ol role="tablist" aria-label="History timeline">
        {EVENTS.map((e, i) => (
          <li key={e.year}>
            <button type="button" role="tab" aria-selected={sel === i} className={sel === i ? 'on' : ''} onClick={() => setSel(i)}>
              <span className="tl-year">{e.year}</span>
              <span className="tl-title">{e.title}</span>
            </button>
          </li>
        ))}
      </ol>
      <div role="tabpanel" className="tl-panel">
        <p>{EVENTS[sel].text}</p>
        <SourceRefs refs={[{ panel: 'history' }]} />
      </div>
      <p className="muted small">Dates and names are as given in the source and have not been checked against the original publications.</p>
    </div>
  );
}

/* ---------- Attributions / source ---------- */
export function Attributions() {
  return (
    <div className="attrib">
      <dl>
        <dt>Source</dt><dd>{ch.source.title} — {ch.source.publisher}</dd>
        <dt>Credits</dt><dd>{ch.source.authors.join('; ')}</dd>
        <dt>Format</dt><dd>{ch.source.pageCount} page ({ch.source.pageSizePt.width} × {ch.source.pageSizePt.height} pt) single-page infographic. Citations in this book use “p. 1” plus the panel name.</dd>
        <dt>Original</dt><dd><SourceLink /></dd>
      </dl>
      <h4>Flagged issues in the source ({ch.flags.length})</h4>
      <ul className="flags">
        {ch.flags.map((f) => (
          <li key={f.id} id={`flag-${f.id}`}><strong>⚑ {f.title}.</strong> {f.text} <SourceRefs refs={f.refs} /></li>
        ))}
      </ul>
      <h4>Not covered by the source</h4>
      <ul>{ch.notCovered.map((n) => <li key={n}>{n}</li>)}</ul>
      <h4>About this edition</h4>
      <p className="small">
        This interactive edition was drafted with AI assistance from the infographic above. Animations are schematic teaching
        models, not microscopy. Illustrative cases are invented and are not clinical advice. Statements are attributed to the
        infographic; they have not been independently verified against primary literature.
      </p>
    </div>
  );
}

export function VirtualLabLink() {
  return (
    <div className="cta">
      <p>Five steps, three reagents, check cells, and the source’s list of mistakes — run the DAT yourself.</p>
      <button type="button" className="primary" onClick={() => go('lab')}>Open the virtual lab</button>
    </div>
  );
}
