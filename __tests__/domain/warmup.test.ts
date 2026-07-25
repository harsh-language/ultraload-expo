import { getExerciseById } from '../../src/domain/catalogue';
import {
  getReferenceWeightFromHistory,
  getWarmUpThreshold,
  shouldAutoTagWarmUp,
} from '../../src/domain/warmup';

describe('warmup domain', () => {
  const bench = getExerciseById('bench-press');

  it('auto-tags sets at or below warmUpPercent of reference weight', () => {
    expect(bench).toBeDefined();
    if (!bench) {
      return;
    }

    expect(
      shouldAutoTagWarmUp({
        weight: 50,
        warmUpAutoTagEnabled: true,
        warmUpPercent: 50,
        referenceWeight: 100,
      }),
    ).toBe(true);

    expect(
      shouldAutoTagWarmUp({
        weight: 55,
        warmUpAutoTagEnabled: true,
        warmUpPercent: 50,
        referenceWeight: 100,
      }),
    ).toBe(false);
  });

  it('does not auto-tag without a reference weight', () => {
    expect(
      shouldAutoTagWarmUp({
        weight: 30,
        warmUpAutoTagEnabled: true,
        warmUpPercent: 50,
        referenceWeight: null,
      }),
    ).toBe(false);
  });

  it('does not auto-tag when global warm-up tagging is off (T23)', () => {
    expect(
      shouldAutoTagWarmUp({
        weight: 40,
        warmUpAutoTagEnabled: false,
        warmUpPercent: 50,
        referenceWeight: 100,
      }),
    ).toBe(false);
  });

  it('computes warm-up threshold from percent and reference weight', () => {
    expect(getWarmUpThreshold(50, 100)).toBe(50);
    expect(getWarmUpThreshold(50, null)).toBeNull();
  });

  it('prefers heaviest 6-rep standard set over heavier higher-rep sets (T15)', () => {
    expect(
      getReferenceWeightFromHistory([
        { weight: 80, reps: 8 },
        { weight: 90, reps: 6 },
        { weight: 85, reps: 7 },
      ]),
    ).toBe(90);
  });

  it('falls back through rep cascade when no 6-rep set exists (T15)', () => {
    expect(
      getReferenceWeightFromHistory([
        { weight: 80, reps: 8 },
        { weight: 85, reps: 7 },
      ]),
    ).toBe(85);

    expect(getReferenceWeightFromHistory([{ weight: 70, reps: 10 }])).toBe(70);
  });

  it('returns null when no standard-set history exists (T15)', () => {
    expect(getReferenceWeightFromHistory([])).toBeNull();
  });
});
