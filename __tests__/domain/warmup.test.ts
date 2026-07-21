import { getExerciseById } from '../../src/domain/catalogue';
import {
  getEffectiveWarmUpPercent,
  getReferenceWeightFromHistory,
  getWarmUpThreshold,
  shouldAutoTagWarmUp,
} from '../../src/domain/warmup';

describe('warmup domain', () => {
  const dip = getExerciseById('dip-weighted');
  const bench = getExerciseById('bench-press');

  it('tags ◊ sets warm-up when total weight ≤ bodyweight (T9 partial)', () => {
    expect(dip).toBeDefined();
    if (!dip) {
      return;
    }

    expect(
      shouldAutoTagWarmUp({
        exercise: dip,
        weight: 75,
        bodyweight: 75,
        warmUpAutoTagEnabled: true,
        warmUpPercent: 50,
        referenceWeight: null,
      }),
    ).toBe(true);

    expect(
      shouldAutoTagWarmUp({
        exercise: dip,
        weight: 76,
        bodyweight: 75,
        warmUpAutoTagEnabled: true,
        warmUpPercent: 50,
        referenceWeight: null,
      }),
    ).toBe(false);
  });

  it('scales ◊ warm-up threshold when bodyweight changes (T9 partial)', () => {
    expect(dip).toBeDefined();
    if (!dip) {
      return;
    }

    expect(
      shouldAutoTagWarmUp({
        exercise: dip,
        weight: 82,
        bodyweight: 82.5,
        warmUpAutoTagEnabled: true,
        warmUpPercent: 50,
        referenceWeight: null,
      }),
    ).toBe(true);

    expect(
      shouldAutoTagWarmUp({
        exercise: dip,
        weight: 83,
        bodyweight: 82.5,
        warmUpAutoTagEnabled: true,
        warmUpPercent: 50,
        referenceWeight: null,
      }),
    ).toBe(false);
  });

  it('auto-tags non-bodyweight sets at or below warmUpPercent of reference weight', () => {
    expect(bench).toBeDefined();
    if (!bench) {
      return;
    }

    expect(
      shouldAutoTagWarmUp({
        exercise: bench,
        weight: 50,
        bodyweight: 75,
        warmUpAutoTagEnabled: true,
        warmUpPercent: 50,
        referenceWeight: 100,
      }),
    ).toBe(true);

    expect(
      shouldAutoTagWarmUp({
        exercise: bench,
        weight: 55,
        bodyweight: 75,
        warmUpAutoTagEnabled: true,
        warmUpPercent: 50,
        referenceWeight: 100,
      }),
    ).toBe(false);
  });

  it('does not auto-tag non-bodyweight sets without a reference weight', () => {
    expect(bench).toBeDefined();
    if (!bench) {
      return;
    }

    expect(
      shouldAutoTagWarmUp({
        exercise: bench,
        weight: 30,
        bodyweight: 75,
        warmUpAutoTagEnabled: true,
        warmUpPercent: 50,
        referenceWeight: null,
      }),
    ).toBe(false);
  });

  it('does not auto-tag when global warm-up tagging is off (T23)', () => {
    expect(dip).toBeDefined();
    if (!dip) {
      return;
    }

    expect(
      shouldAutoTagWarmUp({
        exercise: dip,
        weight: 50,
        bodyweight: 75,
        warmUpAutoTagEnabled: false,
        warmUpPercent: 50,
        referenceWeight: null,
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

  it('does not continue warm-up from previous logged warm-up set', () => {
    expect(bench).toBeDefined();
    if (!bench) {
      return;
    }

    expect(
      shouldAutoTagWarmUp({
        exercise: bench,
        weight: 90,
        bodyweight: 75,
        warmUpAutoTagEnabled: true,
        warmUpPercent: 50,
        referenceWeight: 100,
      }),
    ).toBe(false);

    expect(
      shouldAutoTagWarmUp({
        exercise: bench,
        weight: 30,
        bodyweight: 75,
        warmUpAutoTagEnabled: true,
        warmUpPercent: 50,
        referenceWeight: 100,
      }),
    ).toBe(true);
  });

  it('resolves per-exercise warmUpPercent override for non-bodyweight only', () => {
    expect(bench).toBeDefined();
    expect(dip).toBeDefined();
    if (!bench || !dip) {
      return;
    }

    expect(
      getEffectiveWarmUpPercent(bench, 50, {
        warmUpPercent: 40,
        sliderRange: null,
        increment: null,
      }),
    ).toBe(40);

    expect(
      getEffectiveWarmUpPercent(bench, 50, {
        warmUpPercent: null,
        sliderRange: null,
        increment: null,
      }),
    ).toBe(50);

    expect(
      getEffectiveWarmUpPercent(dip, 50, {
        warmUpPercent: 40,
        sliderRange: null,
        increment: null,
      }),
    ).toBe(50);
  });

  it('auto-tags non-bodyweight using per-exercise warmUpPercent override', () => {
    expect(bench).toBeDefined();
    if (!bench) {
      return;
    }

    const warmUpPercent = getEffectiveWarmUpPercent(bench, 50, {
      warmUpPercent: 40,
      sliderRange: null,
      increment: null,
    });

    expect(
      shouldAutoTagWarmUp({
        exercise: bench,
        weight: 40,
        bodyweight: 75,
        warmUpAutoTagEnabled: true,
        warmUpPercent,
        referenceWeight: 100,
      }),
    ).toBe(true);

    expect(
      shouldAutoTagWarmUp({
        exercise: bench,
        weight: 45,
        bodyweight: 75,
        warmUpAutoTagEnabled: true,
        warmUpPercent,
        referenceWeight: 100,
      }),
    ).toBe(false);
  });
});
