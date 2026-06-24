import { getExerciseById } from '../../src/domain/catalogue';
import { shouldAutoTagWarmUp } from '../../src/domain/warmup';

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
      }),
    ).toBe(true);

    expect(
      shouldAutoTagWarmUp({
        exercise: dip,
        weight: 76,
        bodyweight: 75,
        warmUpAutoTagEnabled: true,
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
      }),
    ).toBe(true);

    expect(
      shouldAutoTagWarmUp({
        exercise: dip,
        weight: 83,
        bodyweight: 82.5,
        warmUpAutoTagEnabled: true,
      }),
    ).toBe(false);
  });

  it('tags non-bodyweight sets at catalogue warm-up threshold', () => {
    expect(bench).toBeDefined();
    if (!bench) {
      return;
    }

    expect(
      shouldAutoTagWarmUp({
        exercise: bench,
        weight: bench.warmUpThreshold!,
        bodyweight: 75,
        warmUpAutoTagEnabled: true,
      }),
    ).toBe(true);

    expect(
      shouldAutoTagWarmUp({
        exercise: bench,
        weight: bench.warmUpThreshold! + 1,
        bodyweight: 75,
        warmUpAutoTagEnabled: true,
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
      }),
    ).toBe(false);
  });
});
