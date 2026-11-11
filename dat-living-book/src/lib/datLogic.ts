// Deterministic teaching model of a tube DAT, built only from rules the source
// states. Where the model needs a rule the source does not state, the rule is
// tagged `teaching` and surfaced to the learner as a labelled teaching note.

import type { SourceRef } from '../content/types';

export type Coating = 'none' | 'IgG' | 'C3d' | 'both';
export type Reagent = 'poly' | 'antiIgG' | 'antiC3d';
export type Centrifuge = 'under' | 'correct' | 'over';

export interface TubeSetup {
  coating: Coating;
  reagent: Reagent;
  washed: 'adequate' | 'inadequate';
  ahgAdded: boolean;
  ahgActive: boolean;
  centrifuge: Centrifuge;
  nonspecificBinding: boolean;
  delayBeforeAhg: boolean;
}

export const defaultSetup: TubeSetup = {
  coating: 'IgG',
  reagent: 'poly',
  washed: 'adequate',
  ahgAdded: true,
  ahgActive: true,
  centrifuge: 'correct',
  nonspecificBinding: false,
  delayBeforeAhg: false,
};

export type Classification = 'true-positive' | 'true-negative' | 'false-positive' | 'false-negative' | 'invalid';

export interface Reason {
  text: string;
  refs: SourceRef[];
  teaching?: boolean;
}

export interface TubeOutcome {
  /** Is the reagent's target actually on the cells? */
  targetPresent: boolean;
  agglutination: boolean;
  classification: Classification;
  techniqueErrors: Reason[];
  reasons: Reason[];
  /** Only meaningful when agglutination is false. */
  checkCellsAgglutinate: boolean | null;
}

export const reagentTargets: Record<Reagent, ('IgG' | 'C3d')[]> = {
  poly: ['IgG', 'C3d'],
  antiIgG: ['IgG'],
  antiC3d: ['C3d'],
};

export const reagentLabel: Record<Reagent, string> = {
  poly: 'Polyspecific AHG (anti-IgG + anti-C3d)',
  antiIgG: 'Monospecific anti-IgG',
  antiC3d: 'Monospecific anti-C3d',
};

export const coatingLabel: Record<Coating, string> = {
  none: 'No coating',
  IgG: 'IgG',
  C3d: 'C3d (complement)',
  both: 'IgG + C3d',
};

export function coatingHas(c: Coating, t: 'IgG' | 'C3d') {
  return c === 'both' || c === t;
}

export function targetPresent(c: Coating, r: Reagent) {
  return reagentTargets[r].some((t) => coatingHas(c, t));
}

const R = {
  principle: [{ panel: 'principle' }] as SourceRef[],
  fn: [{ panel: 'results', detail: 'False negative' }] as SourceRef[],
  fp: [{ panel: 'results', detail: 'False positive' }] as SourceRef[],
  proximate: [{ panel: 'proximate' }] as SourceRef[],
};

/** AHG is usable in the tube (added, active, not neutralised by leftover globulin). */
export function ahgAvailable(s: TubeSetup) {
  return s.ahgAdded && s.ahgActive && s.washed === 'adequate';
}

export function evaluateTube(s: TubeSetup): TubeOutcome {
  const present = targetPresent(s.coating, s.reagent);
  const errors: Reason[] = [];
  const reasons: Reason[] = [];

  if (s.washed === 'inadequate')
    errors.push({ text: 'Improper or under-washing (listed false-negative cause).', refs: R.fn });
  if (!s.ahgAdded) errors.push({ text: 'Failure to add AHG reagents (listed false-negative cause).', refs: R.fn });
  if (s.ahgAdded && !s.ahgActive)
    errors.push({ text: 'Inactive AHG due to improper storage and handling (listed false-negative cause).', refs: R.fn });
  if (s.centrifuge === 'under') errors.push({ text: 'Under-centrifuging the sample (listed false-negative cause).', refs: R.fn });
  if (s.centrifuge === 'over') errors.push({ text: 'Over-centrifugation (listed false-positive cause).', refs: R.fp });
  if (s.nonspecificBinding)
    errors.push({ text: 'Nonspecific binding of the DAT reagents (listed false-positive cause).', refs: R.fp });
  if (s.delayBeforeAhg)
    errors.push({
      text: 'Delay in the addition of AHG after washing — listed under BOTH false negative and false positive in the source.',
      refs: [{ panel: 'results' }],
    });

  // Can the reagent bridge cells at all?
  const bridging = present && ahgAvailable(s);
  if (present) reasons.push({ text: `The reagent recognises the coating (${coatingLabel[s.coating]}).`, refs: R.principle });
  else if (s.coating === 'none') reasons.push({ text: 'Nothing is bound to the cells for AHG to bridge.', refs: R.principle });
  else reasons.push({ text: 'The coating on these cells is not a target of this reagent.', refs: R.principle });

  if (present && s.washed === 'inadequate')
    reasons.push({
      text: 'Teaching model: leftover unbound globulin can neutralise the AHG before it reaches the cells.',
      refs: [{ panel: 'steps', detail: 'Step 1' }],
      teaching: true,
    });

  // Outcome rules (source lists): false-negative causes suppress, false-positive causes create agglutination.
  let agg = bridging && s.centrifuge !== 'under';
  const fpCause = s.centrifuge === 'over' || s.nonspecificBinding;
  if (!agg && fpCause) {
    agg = true;
    reasons.push({ text: 'Agglutination produced by a listed false-positive cause, not by coating.', refs: R.fp });
  }

  let classification: Classification;
  if (s.delayBeforeAhg) classification = 'invalid';
  else if (agg && present && !fpCause) classification = 'true-positive';
  else if (agg && (!present || fpCause)) classification = present ? 'invalid' : 'false-positive';
  else if (!agg && present) classification = 'false-negative';
  else classification = errors.length ? 'invalid' : 'true-negative';

  // Check cells (antibody-coated reagent cells) are added only to non-reactive tubes.
  // Teaching model: they agglutinate when usable AHG remains and the tube is spun adequately.
  let check: boolean | null = null;
  if (!agg) check = ahgAvailable(s) && s.centrifuge !== 'under';

  return { targetPresent: present, agglutination: agg, classification, techniqueErrors: errors, reasons, checkCellsAgglutinate: check };
}

export const classificationText: Record<Classification, string> = {
  'true-positive': 'True positive',
  'true-negative': 'True negative',
  'false-positive': 'False positive',
  'false-negative': 'False negative',
  invalid: 'Result not interpretable (technique error)',
};

/** Source detection limits, as printed. */
export const detectionLimits = {
  IgG: { low: 100, high: 500 },
  C3: { low: 400, high: 1100 },
};

export type LimitZone = 'below' | 'within' | 'above';
export function limitZone(kind: 'IgG' | 'C3', molecules: number): LimitZone {
  const l = detectionLimits[kind];
  if (molecules < l.low) return 'below';
  if (molecules <= l.high) return 'within';
  return 'above';
}
