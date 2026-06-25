import { getExerciseById } from '../../src/domain/catalogue';
import {
  getLastStandardSetWeightToday,
  getWarmUpThreshold,
  shouldAutoTagWarmUp,
  type TodayWorkoutForWarmUp,
} from '../../src/domain/warmup';

describe('warmup domain', () => {
  const dip = getExerciseById('dip-weighted');
  const bench = getExerciseById('bench-press');

  const todayWorkoutWithBenchStandard: TodayWorkoutForWarmUp = {
    loggedExercises: [
      {
        exerciseId: 'bench-press',
        sets: [
          { weight: 80, warmUp: true, order: 1 },
          { weight: 100, warmUp: false, order: 2 },
        ],
      },
    ],
  };

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

  it('does not auto-tag when global warm-up tagging is off', () => {
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

  it('uses today last standard set weight and ignores warm-up sets', () => {
    expect(
      getLastStandardSetWeightToday(todayWorkoutWithBenchStandard, 'bench-press'),
    ).toBe(100);
    expect(getLastStandardSetWeightToday(null, 'bench-press')).toBeNull();
    expect(
      getLastStandardSetWeightToday(todayWorkoutWithBenchStandard, 'overhead-press'),
    ).toBeNull();
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
});
