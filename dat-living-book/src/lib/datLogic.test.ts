import { describe, expect, it } from 'vitest';
import { defaultSetup, evaluateTube, limitZone, targetPresent } from './datLogic';

describe('reagent specificity (Principle of the Test)', () => {
  it('polyspecific detects IgG, C3d and both', () => {
    expect(targetPresent('IgG', 'poly')).toBe(true);
    expect(targetPresent('C3d', 'poly')).toBe(true);
    expect(targetPresent('both', 'poly')).toBe(true);
    expect(targetPresent('none', 'poly')).toBe(false);
  });
  it('monospecific reagents detect only their target', () => {
    expect(targetPresent('C3d', 'antiIgG')).toBe(false);
    expect(targetPresent('IgG', 'antiC3d')).toBe(false);
    expect(targetPresent('both', 'antiIgG')).toBe(true);
  });
});

describe('evaluateTube', () => {
  it('correct technique on coated cells -> true positive', () => {
    const o = evaluateTube(defaultSetup);
    expect(o.agglutination).toBe(true);
    expect(o.classification).toBe('true-positive');
    expect(o.checkCellsAgglutinate).toBeNull();
  });
  it('uncoated cells, correct technique -> true negative, check cells react', () => {
    const o = evaluateTube({ ...defaultSetup, coating: 'none' });
    expect(o.classification).toBe('true-negative');
    expect(o.checkCellsAgglutinate).toBe(true);
  });
  it('each listed false-negative cause turns a coated tube negative', () => {
    for (const patch of [
      { washed: 'inadequate' as const },
      { ahgAdded: false },
      { ahgActive: false },
      { centrifuge: 'under' as const },
    ]) {
      const o = evaluateTube({ ...defaultSetup, ...patch });
      expect(o.agglutination).toBe(false);
      expect(o.classification).toBe('false-negative');
    }
  });
  it('missing or inactive AHG is exposed by check cells', () => {
    expect(evaluateTube({ ...defaultSetup, coating: 'none', ahgAdded: false }).checkCellsAgglutinate).toBe(false);
    expect(evaluateTube({ ...defaultSetup, coating: 'none', ahgActive: false }).checkCellsAgglutinate).toBe(false);
  });
  it('listed false-positive causes make an uncoated tube positive', () => {
    expect(evaluateTube({ ...defaultSetup, coating: 'none', centrifuge: 'over' }).classification).toBe('false-positive');
    expect(evaluateTube({ ...defaultSetup, coating: 'none', nonspecificBinding: true }).classification).toBe('false-positive');
  });
  it('delay before AHG is never classified in one direction (source lists both)', () => {
    expect(evaluateTube({ ...defaultSetup, delayBeforeAhg: true }).classification).toBe('invalid');
    expect(evaluateTube({ ...defaultSetup, coating: 'none', delayBeforeAhg: true }).classification).toBe('invalid');
  });
  it('monospecific negative for absent target is a true negative, not a false one', () => {
    expect(evaluateTube({ ...defaultSetup, coating: 'C3d', reagent: 'antiIgG' }).classification).toBe('true-negative');
  });
});

describe('detection limits (Proximate Mechanisms)', () => {
  it('zones follow 100-500 IgG and 400-1,100 C3', () => {
    expect(limitZone('IgG', 50)).toBe('below');
    expect(limitZone('IgG', 300)).toBe('within');
    expect(limitZone('IgG', 600)).toBe('above');
    expect(limitZone('C3', 399)).toBe('below');
    expect(limitZone('C3', 1100)).toBe('within');
  });
});
