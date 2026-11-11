import { useState } from 'react';
import { AhgShape, C3dShape, CELL_R, IGG_LEN, IgGShape, Legend, OnMembrane, RedCell, moveStyle } from './primitives';
import { Player, usePlayer, type PlayerStep } from './Player';

type Phase = 'invivo' | 'sample' | 'wash' | 'add' | 'bind1' | 'spin' | 'read' | 'check';
type Pt = [number, number];
type CellId = 'A' | 'B' | 'C' | 'D';

const DISPERSED: Record<CellId, Pt> = { A: [110, 140], B: [300, 90], C: [285, 265], D: [520, 195] };
const CLUSTER: Record<CellId, Pt> = { A: [250, 190], B: [330, 130], C: [330, 250], D: [410, 190] };
const PELLET: Record<CellId, Pt> = { A: [215, 278], B: [285, 282], C: [355, 278], D: [425, 282] };
const PAIRS: [CellId, CellId][] = [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D']];
const EXTRA_ANGLES: Record<CellId, number[]> = { A: [200, 290], B: [330, 20], C: [150, 210], D: [80, 140] };
const FREE_AHG: [number, number, number][] = [[175, 55, 20], [440, 60, -30], [160, 215, 40], [430, 240, -15]];
const FREE_IGG: [number, number, number][] = [[200, 190], [420, 120], [450, 285], [150, 285], [400, 40]].map(([x, y], i) => [x, y, i * 70]) as [number, number, number][];
const CHECK: { E: Pt; F: Pt } = { E: [480, 110], F: [580, 110] };

const deg = (r: number) => (r * 180) / Math.PI;
function unit(a: Pt, b: Pt): Pt {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const l = Math.hypot(dx, dy);
  return [dx / l, dy / l];
}
/** membrane angle (0 = up, clockwise) pointing from a toward b */
const membraneAngle = (a: Pt, b: Pt) => deg(Math.atan2(b[0] - a[0], -(b[1] - a[1])));

function iggAnglesFor(id: CellId): number[] {
  const facing = PAIRS.filter((p) => p.includes(id)).map(([p, q]) =>
    p === id ? membraneAngle(CLUSTER[p], CLUSTER[q]) : membraneAngle(CLUSTER[q], CLUSTER[p]),
  );
  return [...facing, ...EXTRA_ANGLES[id]];
}

type Coat = 'IgG' | 'C3d' | 'none';

function sceneLabel(phase: Phase) {
  return phase === 'invivo' ? 'IN VIVO · the patient’s circulation' : 'IN VITRO · test tube in the laboratory';
}

const PROC_COATED: { phase: Phase; step: PlayerStep }[] = [
  { phase: 'invivo', step: { caption: 'In the patient, IgG has bound to the red cells (in vivo). The DAT will detect this coating; it does not create it.', refs: [{ panel: 'term' }, { panel: 'reaction' }] } },
  { phase: 'sample', step: { caption: 'Red blood cells are taken from the patient’s sample. Unbound antibody is still present around them.', refs: [{ panel: 'steps', detail: 'Step 1' }] } },
  { phase: 'wash', step: { caption: 'The cells are washed to remove lingering, unbound antibodies. Antibody bound to the cells stays.', refs: [{ panel: 'steps', detail: 'Step 1' }] } },
  { phase: 'add', step: { caption: 'The washed cells are suspended and anti-human globulin (Coombs reagent) is added.', refs: [{ panel: 'steps', detail: 'Step 2' }] } },
  { phase: 'bind1', step: { caption: 'AHG binds to the antibody on one red cell’s surface…', refs: [{ panel: 'proximate' }] } },
  { phase: 'spin', step: { caption: 'The solution is centrifuged. AHG then binds antibody on another cell too, creating linking bridges between cells.', refs: [{ panel: 'steps', detail: 'Step 3' }, { panel: 'proximate' }] } },
  { phase: 'read', step: { caption: 'Aggregates (clumps) are visible: agglutination, a positive DAT. Strength is graded from Negative to 4+.', refs: [{ panel: 'steps', detail: 'Step 4' }, { panel: 'proximate' }] } },
];

const PROC_UNCOATED: { phase: Phase; step: PlayerStep }[] = [
  { phase: 'invivo', step: { caption: 'In this patient, nothing is bound to the red cells in vivo.', refs: [{ panel: 'term' }] } },
  { phase: 'sample', step: { caption: 'Red blood cells are taken from the patient’s sample, with unbound antibody around them.', refs: [{ panel: 'steps', detail: 'Step 1' }] } },
  { phase: 'wash', step: { caption: 'The cells are washed to remove lingering, unbound antibodies.', refs: [{ panel: 'steps', detail: 'Step 1' }] } },
  { phase: 'add', step: { caption: 'The washed cells are suspended and anti-human globulin (Coombs reagent) is added.', refs: [{ panel: 'steps', detail: 'Step 2' }] } },
  { phase: 'bind1', step: { caption: 'There is no antibody or complement on the cells, so the AHG has nothing to bind and stays free.', refs: [{ panel: 'principle' }] } },
  { phase: 'spin', step: { caption: 'The solution is centrifuged. Cells are packed down, but no bridges form between them.', refs: [{ panel: 'steps', detail: 'Step 3' }] } },
  { phase: 'read', step: { caption: 'On reading, the cells disperse: no agglutination. This negative must be validated.', refs: [{ panel: 'steps', detail: 'Steps 4–5' }] } },
  { phase: 'check', step: { caption: 'Antibody-coated reagent cells (check cells) are added. The free AHG bridges them, so they agglutinate — the negative is valid. Had they not agglutinated, technical error would be suspected.', refs: [{ panel: 'steps', detail: 'Step 5' }, { panel: 'proximate' }] } },
];

const XLINK_COATED: { phase: Phase; step: PlayerStep }[] = [
  { phase: 'wash', step: { caption: 'In vivo red cells coated with IgG antibodies: no agglutination.', refs: [{ panel: 'reaction' }] } },
  { phase: 'add', step: { caption: 'Anti-IgG — the AHG (Coombs reagent) — is added.', refs: [{ panel: 'reaction' }] } },
  { phase: 'bind1', step: { caption: 'AHG binds IgG on one red cell’s surface…', refs: [{ panel: 'proximate' }] } },
  { phase: 'read', step: { caption: '…and IgG on another, creating a linking bridge. Crosslinking causes agglutination of the red cells.', refs: [{ panel: 'reaction' }, { panel: 'proximate' }] } },
];
const XLINK_UNCOATED: { phase: Phase; step: PlayerStep }[] = [
  { phase: 'wash', step: { caption: 'Red cells with no IgG bound (comparison, not shown in the source figure).', refs: [{ panel: 'principle' }], teaching: true } },
  { phase: 'add', step: { caption: 'Anti-IgG (AHG) is added.', refs: [{ panel: 'reaction' }] } },
  { phase: 'bind1', step: { caption: 'There is no IgG for the AHG to bind.', refs: [{ panel: 'principle' }] } },
  { phase: 'read', step: { caption: 'No bridges, no agglutination.', refs: [{ panel: 'principle' }] } },
];

export function ReactionScene({ mode }: { mode: 'procedure' | 'crosslink' }) {
  const [coat, setCoat] = useState<Coat>('IgG');
  const coated = coat !== 'none';
  const script =
    mode === 'procedure' ? (coated ? PROC_COATED : PROC_UNCOATED) : coated ? XLINK_COATED : XLINK_UNCOATED;
  const api = usePlayer(script.length);
  const idx = Math.min(api.i, script.length - 1);
  const phase = script[idx].phase;
  const ms = api.transitionMs;
  const order: Phase[] = ['invivo', 'sample', 'wash', 'add', 'bind1', 'spin', 'read', 'check'];
  const at = (p: Phase) => order.indexOf(phase) >= order.indexOf(p);

  const cellPos = (id: CellId): Pt => {
    if (phase === 'spin') return coated ? CLUSTER[id] : PELLET[id];
    if (phase === 'read') return coated ? CLUSTER[id] : DISPERSED[id];
    return DISPERSED[id];
  };

  const ahg = PAIRS.map(([p, q], k) => {
    const free = FREE_AHG[k];
    if (!at('add')) return { x: free[0], y: free[1] - 70, r: free[2], o: 0 };
    if (!coated) {
      if (phase === 'check' && k === 1) return { x: (CHECK.E[0] + CHECK.F[0]) / 2, y: CHECK.E[1], r: 0, o: 1 };
      return { x: free[0], y: free[1], r: free[2], o: 1 };
    }
    if (phase === 'add') return { x: free[0], y: free[1], r: free[2], o: 1 };
    const u = unit(CLUSTER[p], CLUSTER[q]);
    const rot = deg(Math.atan2(u[1], u[0]));
    if (phase === 'bind1') {
      const c = DISPERSED[p];
      const d = CELL_R + IGG_LEN + 6;
      return { x: c[0] + u[0] * d, y: c[1] + u[1] * d, r: rot, o: 1 };
    }
    const a = CLUSTER[p], b = CLUSTER[q];
    return { x: (a[0] + b[0]) / 2, y: (a[1] + b[1]) / 2, r: rot, o: 1 };
  });

  const showFree = phase === 'invivo' || phase === 'sample';
  const washed = at('wash');
  const result =
    phase === 'read' ? (coated ? 'Agglutination — positive' : 'No agglutination — negative') : phase === 'check' ? 'Check cells agglutinate — negative is valid' : null;

  return (
    <Player
      title={mode === 'procedure' ? 'The DAT procedure' : 'The antiglobulin reaction'}
      steps={script.map((s) => s.step)}
      api={api}
      legend={<Legend items={mode === 'procedure' && !coated ? ['rbc', 'igg', 'ahg', 'check'] : coat === 'C3d' ? ['rbc', 'c3d', 'ahg'] : ['rbc', 'igg', 'ahg']} />}
      controlsExtra={
        <fieldset className="seg" aria-label="Patient's red cells">
          <legend className="sr-only">Patient's red cells</legend>
          {(mode === 'procedure' ? (['IgG', 'none'] as Coat[]) : (['IgG', 'none'] as Coat[])).map((c) => (
            <label key={c} className={coat === c ? 'on' : ''}>
              <input type="radio" name={`coat-${mode}`} checked={coat === c} onChange={() => { setCoat(c); api.setI(0); api.setPlaying(false); }} />
              {c === 'IgG' ? 'Cells coated with IgG' : 'Cells not coated'}
            </label>
          ))}
        </fieldset>
      }
    >
      <svg viewBox="0 0 640 330" className="scene" role="img" aria-label={`${sceneLabel(phase)}. ${script[idx].step.caption}`}>
        <rect x="0" y="0" width="640" height="330" className={phase === 'invivo' ? 'bg-vivo' : 'bg-vitro'} style={{ transition: ms ? `fill ${ms}ms` : 'none' }} />
        <text x="16" y="24" className="svg-label">{sceneLabel(phase)}</text>
        {phase === 'wash' && mode === 'procedure' && <text x="470" y="24" className="svg-note">wash → unbound antibody removed</text>}
        {phase === 'spin' && <text x="470" y="24" className="svg-note">↻ centrifuge</text>}
        {result && <text x="624" y="318" textAnchor="end" className={`svg-result ${coated || phase === 'check' ? 'pos' : 'neg'}`}>{result}</text>}

        {FREE_IGG.map(([x, y, r], k) => (
          <g key={`f${k}`} style={moveStyle(washed && mode === 'procedure' ? x + 320 : x, y, r, ms, mode === 'procedure' && showFree ? 1 : 0)} aria-hidden="true">
            <IgGShape />
          </g>
        ))}

        {(Object.keys(DISPERSED) as CellId[]).map((id) => {
          const [x, y] = cellPos(id);
          return (
            <g key={id} style={moveStyle(x, y, 0, ms)}>
              <RedCell />
              {coated &&
                iggAnglesFor(id).map((a, j) => (
                  <OnMembrane key={j} angle={a}>
                    {coat === 'C3d' ? <C3dShape /> : <IgGShape />}
                  </OnMembrane>
                ))}
            </g>
          );
        })}

        {mode === 'procedure' && !coated && (
          <>
            {(['E', 'F'] as const).map((id, k) => {
              const [x, y] = CHECK[id];
              const vis = phase === 'check';
              return (
                <g key={id} style={moveStyle(x, vis ? y : y - 120, 0, ms, vis ? 1 : 0)}>
                  <RedCell check />
                  <OnMembrane angle={k === 0 ? 90 : 270}><IgGShape /></OnMembrane>
                  <OnMembrane angle={k === 0 ? 180 : 0}><IgGShape /></OnMembrane>
                </g>
              );
            })}
          </>
        )}

        {ahg.map((a, k) => (
          <g key={`a${k}`} style={moveStyle(a.x, a.y, a.r, ms, a.o)}>
            <AhgShape />
          </g>
        ))}
      </svg>
    </Player>
  );
}
