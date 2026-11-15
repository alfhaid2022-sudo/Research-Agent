import { useState } from 'react';
import {
  classificationText,
  coatingHas,
  coatingLabel,
  defaultSetup,
  evaluateTube,
  limitZone,
  reagentLabel,
  type Coating,
  type Reagent,
  type TubeSetup,
} from '../lib/datLogic';
import { usePrefersReducedMotion } from '../lib/store';
import { AhgShape, C3dShape, IgGShape, Legend, OnMembrane, RedCell, Tube, moveStyle } from './anim/primitives';
import { SourceRefs } from './SourceRef';

type Pt = [number, number];
const MS_CLUSTER: Pt[] = [[100, 100], [200, 100], [150, 187]];
const MS_SPREAD: Pt[] = [[55, 60], [265, 75], [160, 205]];
const MS_PAIRS: [number, number][] = [[0, 1], [0, 2], [1, 2]];
const MS_FREE: [number, number, number][] = [[150, 30, 15], [40, 200, -25], [285, 185, 35]];
const deg = (r: number) => (r * 180) / Math.PI;
const angTo = (a: Pt, b: Pt) => deg(Math.atan2(b[0] - a[0], -(b[1] - a[1])));

/** Small schematic of three cells for the explorers. */
export function MiniScene({
  coating,
  bridgeVia,
  agglutinated,
  ahgShown,
  label,
}: {
  coating: Coating;
  /** which molecule the reagent bridges through (drawn on facing sides) */
  bridgeVia: 'IgG' | 'C3d' | null;
  agglutinated: boolean;
  ahgShown: boolean;
  label: string;
}) {
  const reduced = usePrefersReducedMotion();
  const ms = reduced ? 0 : 700;
  const pos = agglutinated ? MS_CLUSTER : MS_SPREAD;
  const facingType: 'IgG' | 'C3d' | null =
    coating === 'none' ? null : coating === 'both' ? bridgeVia ?? 'IgG' : (coating as 'IgG' | 'C3d');
  const otherType: 'IgG' | 'C3d' | null = coating === 'both' ? (facingType === 'IgG' ? 'C3d' : 'IgG') : facingType;
  return (
    <svg viewBox="0 0 320 250" className="scene mini" role="img" aria-label={label}>
      <rect width="320" height="250" className="bg-vitro" />
      {pos.map(([x, y], i) => {
        const facing = MS_PAIRS.filter((p) => p.includes(i)).map(([a, b]) =>
          a === i ? angTo(MS_CLUSTER[a], MS_CLUSTER[b]) : angTo(MS_CLUSTER[b], MS_CLUSTER[a]),
        );
        const extra = [[200, 300], [30, 120], [150, 210]][i];
        return (
          <g key={i} style={moveStyle(x, y, 0, ms)}>
            <RedCell />
            {facingType && facing.map((a, j) => <OnMembrane key={`f${j}`} angle={a}>{facingType === 'IgG' ? <IgGShape /> : <C3dShape />}</OnMembrane>)}
            {otherType && extra.map((a, j) => <OnMembrane key={`e${j}`} angle={a}>{otherType === 'IgG' ? <IgGShape /> : <C3dShape />}</OnMembrane>)}
          </g>
        );
      })}
      {ahgShown &&
        MS_PAIRS.map(([a, b], k) => {
          if (agglutinated) {
            const A = MS_CLUSTER[a], B = MS_CLUSTER[b];
            const rot = deg(Math.atan2(B[1] - A[1], B[0] - A[0]));
            return <g key={k} style={moveStyle((A[0] + B[0]) / 2, (A[1] + B[1]) / 2, rot, ms)}><AhgShape /></g>;
          }
          const f = MS_FREE[k];
          return <g key={k} style={moveStyle(f[0], f[1], f[2], ms)}><AhgShape /></g>;
        })}
    </svg>
  );
}

export function CoatingGallery() {
  const [c, setC] = useState<Coating>('IgG');
  const text: Record<Coating, string> = {
    none: 'Nothing bound. A correctly performed DAT on such cells would be negative.',
    IgG: 'Immunoglobulin (IgG) bound in vivo.',
    C3d: 'Complement (C3d) bound in vivo.',
    both: 'Immunoglobulin and complement both bound in vivo.',
  };
  return (
    <div className="explorer">
      <fieldset className="seg" aria-label="Coating on the red cell">
        <legend className="sr-only">Coating on the red cell</legend>
        {(['none', 'IgG', 'C3d', 'both'] as Coating[]).map((k) => (
          <label key={k} className={c === k ? 'on' : ''}>
            <input type="radio" name="gallery" checked={c === k} onChange={() => setC(k)} />
            {coatingLabel[k]}
          </label>
        ))}
      </fieldset>
      <div className="explorer-body">
        <MiniScene coating={c} bridgeVia="IgG" agglutinated={false} ahgShown={false} label={`Red cells: ${coatingLabel[c]}`} />
        <div>
          <p className="lead">{text[c]}</p>
          <p className="muted">The DAT question: is immunoglobulin, complement, or both on these cells?</p>
          <SourceRefs refs={[{ panel: 'term' }]} />
          <Legend items={['rbc', 'igg', 'c3d']} />
        </div>
      </div>
    </div>
  );
}

export function ReactionExplorer() {
  const [coating, setCoating] = useState<Coating>('C3d');
  const [reagent, setReagent] = useState<Reagent>('antiIgG');
  const out = evaluateTube({ ...defaultSetup, coating, reagent });
  const via: 'IgG' | 'C3d' | null =
    reagent === 'antiIgG' ? 'IgG' : reagent === 'antiC3d' ? 'C3d' : coatingHas(coating, 'IgG') ? 'IgG' : coatingHas(coating, 'C3d') ? 'C3d' : null;
  return (
    <div className="explorer" data-testid="reaction-explorer">
      <div className="controls-grid">
        <label>
          Coating on patient cells (in vivo)
          <select value={coating} onChange={(e) => setCoating(e.target.value as Coating)}>
            {(['none', 'IgG', 'C3d', 'both'] as Coating[]).map((k) => <option key={k} value={k}>{coatingLabel[k]}</option>)}
          </select>
        </label>
        <label>
          AHG reagent added (in vitro)
          <select value={reagent} onChange={(e) => setReagent(e.target.value as Reagent)}>
            {(['poly', 'antiIgG', 'antiC3d'] as Reagent[]).map((k) => <option key={k} value={k}>{reagentLabel[k]}</option>)}
          </select>
        </label>
      </div>
      <div className="explorer-body">
        <MiniScene coating={coating} bridgeVia={via} agglutinated={out.agglutination} ahgShown label={`${coatingLabel[coating]} with ${reagentLabel[reagent]}: ${out.agglutination ? 'agglutination' : 'no agglutination'}`} />
        <div>
          <p className={`verdict ${out.agglutination ? 'pos' : 'neg'}`} data-testid="explorer-result">
            {out.agglutination ? 'Agglutination' : 'No agglutination'}
          </p>
          <ul className="reasons">
            {out.reasons.map((r, i) => <li key={i}>{r.text} <SourceRefs refs={r.refs} /></li>)}
          </ul>
          {!out.agglutination && coating !== 'none' && (
            <p className="note">This is a correct negative <em>for this reagent</em>: a monospecific reagent reports only its own target.</p>
          )}
          <p className="muted small">Technique assumed correct here. Try errors in the Troubleshooter (section 6).</p>
          <Legend items={['rbc', 'igg', 'c3d', 'ahg']} />
        </div>
      </div>
    </div>
  );
}

const TOGGLES: { key: keyof TubeSetup; label: string; on: Partial<TubeSetup>; off: Partial<TubeSetup> }[] = [
  { key: 'washed', label: 'Improper or under-washing', on: { washed: 'inadequate' }, off: { washed: 'adequate' } },
  { key: 'ahgAdded', label: 'Failure to add AHG', on: { ahgAdded: false }, off: { ahgAdded: true } },
  { key: 'ahgActive', label: 'Inactive AHG (improper storage/handling)', on: { ahgActive: false }, off: { ahgActive: true } },
  { key: 'nonspecificBinding', label: 'Nonspecific binding of reagents', on: { nonspecificBinding: true }, off: { nonspecificBinding: false } },
  { key: 'delayBeforeAhg', label: 'Delay in adding AHG after washing', on: { delayBeforeAhg: true }, off: { delayBeforeAhg: false } },
];

export function Troubleshooter() {
  const [s, setS] = useState<TubeSetup>({ ...defaultSetup });
  const out = evaluateTube(s);
  const isOn = (t: (typeof TOGGLES)[number]) => Object.entries(t.on).every(([k, v]) => s[k as keyof TubeSetup] === v);
  return (
    <div className="explorer" data-testid="troubleshooter">
      <div className="controls-grid">
        <label>
          Patient cells
          <select value={s.coating} onChange={(e) => setS({ ...s, coating: e.target.value as Coating })}>
            <option value="IgG">Coated with IgG</option>
            <option value="none">Not coated</option>
          </select>
        </label>
        <label>
          Centrifugation
          <select value={s.centrifuge} onChange={(e) => setS({ ...s, centrifuge: e.target.value as TubeSetup['centrifuge'] })}>
            <option value="correct">As per procedure</option>
            <option value="under">Under-centrifuged</option>
            <option value="over">Over-centrifuged</option>
          </select>
        </label>
      </div>
      <fieldset className="checks">
        <legend>Technical errors</legend>
        {TOGGLES.map((t) => (
          <label key={t.key}>
            <input type="checkbox" checked={isOn(t)} onChange={(e) => setS({ ...s, ...(e.target.checked ? t.on : t.off) })} />
            {t.label}
            {t.key === 'delayBeforeAhg' && <span className="badge badge-flag" title="Source lists this under both false negative and false positive">⚑ source conflict</span>}
          </label>
        ))}
        <button type="button" className="link" onClick={() => setS({ ...defaultSetup, coating: s.coating })}>Clear errors</button>
      </fieldset>
      <div className="explorer-body">
        <div className="tubes">
          <Tube agglutinated={out.agglutination} label="Patient tube" />
          {out.checkCellsAgglutinate !== null && (
            <Tube agglutinated={out.checkCellsAgglutinate} label="After check cells" />
          )}
        </div>
        <div>
          <p className={`verdict ${out.classification}`} data-testid="trouble-class">{classificationText[out.classification]}</p>
          <p>
            Reading: <strong>{out.agglutination ? 'agglutination' : 'no agglutination'}</strong>
            {' · '}Truth: cells {s.coating === 'none' ? 'not coated' : 'coated with IgG'}
          </p>
          {out.checkCellsAgglutinate !== null && (
            <p data-testid="trouble-check">
              Check cells: <strong>{out.checkCellsAgglutinate ? 'agglutinate' : 'do NOT agglutinate → concern for technical error'}</strong>{' '}
              <SourceRefs refs={[{ panel: 'proximate' }]} />
            </p>
          )}
          {out.techniqueErrors.length > 0 && (
            <ul className="reasons">
              {out.techniqueErrors.map((r, i) => <li key={i}>{r.text} <SourceRefs refs={r.refs} /></li>)}
            </ul>
          )}
          {out.reasons.filter((r) => r.teaching).map((r, i) => (
            <p key={i} className="teach-inline"><span className="badge badge-teach">Teaching model</span> {r.text}</p>
          ))}
          <p className="muted small">
            The source lists these causes but does not explain their mechanisms, so this model shows only the direction the source gives.
            Tubes are illustrative, not grading references. Which errors check cells reveal is modelled (teaching model: they react only when usable AHG is present and spun adequately).
          </p>
        </div>
      </div>
    </div>
  );
}

export function DetectionLimits() {
  const [kind, setKind] = useState<'IgG' | 'C3'>('IgG');
  const [m, setM] = useState(300);
  const zone = limitZone(kind, m);
  const lim = kind === 'IgG' ? [100, 500] : [400, 1100];
  const max = 1500;
  const markers = Math.min(30, Math.round(m / 50));
  const msg = {
    below: 'Below the lowest level the source says the DAT can detect. A negative DAT would not exclude coating at this level.',
    within: 'Inside the source’s stated lower-limit range. The source gives a range, not a single cut-off, so detection here is possible but not certain.',
    above: 'Above the stated range: within what the source says the DAT can detect.',
  }[zone];
  return (
    <div className="explorer" data-testid="detection-limits">
      <fieldset className="seg" aria-label="Molecule">
        <legend className="sr-only">Molecule</legend>
        {(['IgG', 'C3'] as const).map((k) => (
          <label key={k} className={kind === k ? 'on' : ''}>
            <input type="radio" name="dl" checked={kind === k} onChange={() => setKind(k)} /> {k}
          </label>
        ))}
      </fieldset>
      <label className="slider">
        Molecules of {kind} per red cell: <strong>{m.toLocaleString()}</strong>
        <input type="range" min={0} max={max} step={10} value={m} onChange={(e) => setM(Number(e.target.value))} aria-valuetext={`${m} molecules`} />
      </label>
      <div className="limit-bar" aria-hidden="true">
        <div className="zone-below" style={{ width: `${(lim[0] / max) * 100}%` }} />
        <div className="zone-within" style={{ width: `${((lim[1] - lim[0]) / max) * 100}%` }} />
        <div className="zone-above" />
        <div className="limit-marker" style={{ left: `${(m / max) * 100}%` }} />
      </div>
      <div className="limit-scale small muted"><span>0</span><span>{lim[0]}–{lim[1]} (source range)</span><span>{max.toLocaleString()}</span></div>
      <div className="explorer-body">
        <svg viewBox="-50 -50 100 100" width="140" height="140" role="img" aria-label={`Schematic cell with ${markers} markers`}>
          <RedCell />
          {Array.from({ length: markers }, (_, i) => (
            <OnMembrane key={i} angle={(360 / Math.max(markers, 1)) * i}>{kind === 'IgG' ? <IgGShape /> : <C3dShape />}</OnMembrane>
          ))}
        </svg>
        <div>
          <p className={`verdict zone-${zone}`} data-testid="limit-zone">{zone === 'below' ? 'Below stated range' : zone === 'within' ? 'Within stated range' : 'Above stated range'}</p>
          <p>{msg}</p>
          <SourceRefs refs={[{ panel: 'proximate' }]} />
          <p className="muted small">Illustrative scale: one marker ≈ 50 molecules. The source does not link molecule numbers to agglutination grades, so none are shown.</p>
        </div>
      </div>
    </div>
  );
}
