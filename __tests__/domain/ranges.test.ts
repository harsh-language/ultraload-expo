import { getExerciseById } from '../../src/domain/catalogue';
import {
  getBodyweightExerciseRange,
  getExerciseIncrement,
  getExerciseSliderRange,
} from '../../src/domain/ranges';
import type { PerExerciseOverride } from '../../src/db/schema';

describe('ranges domain', () => {
  const override: PerExerciseOverride = {
    warmUpPercent: 40,
    sliderRange: { min: 20, max: 200 },
    increment: 2.5,
  };

  it('recomputes ◊ exercise bounds when bodyweight changes (T8)', () => {
    expect(getBodyweightExerciseRange(75)).toEqual({ min: 37.5, max: 150 });
    expect(getBodyweightExerciseRange(80)).toEqual({ min: 40, max: 160 });
    expect(getBodyweightExerciseRange(70)).toEqual({ min: 35, max: 140 });
  });

  it('applies per-exercise range and increment overrides for non-bodyweight', () => {
    const bench = getExerciseById('bench-press');
    expect(bench).toBeDefined();
    if (!bench) {
      return;
    }

    expect(getExerciseSliderRange(bench, 75, override)).toEqual({
      min: 20,
      max: 200,
    });
    expect(getExerciseIncrement(bench, override)).toBe(2.5);
  });

  it('ignores overrides for bodyweight exercises (BR18/BR29)', () => {
    const dip = getExerciseById('dip-weighted');
    expect(dip).toBeDefined();
    if (!dip) {
      return;
    }

    expect(getExerciseSliderRange(dip, 80, override)).toEqual({
      min: 40,
      max: 160,
    });
    expect(getExerciseIncrement(dip, override)).toBe(dip.increment);
  });

  it('falls back to catalogue range and increment without override', () => {
    const bench = getExerciseById('bench-press');
    expect(bench).toBeDefined();
    if (!bench) {
      return;
    }

    expect(getExerciseSliderRange(bench, 75)).toEqual(bench.sliderRange);
    expect(getExerciseIncrement(bench)).toBe(bench.increment);
  });
});
