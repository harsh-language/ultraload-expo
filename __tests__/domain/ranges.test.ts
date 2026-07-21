import { getExerciseById } from '../../src/domain/catalogue';
import {
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

  it('applies per-exercise range and increment overrides', () => {
    const bench = getExerciseById('bench-press');
    expect(bench).toBeDefined();
    if (!bench) {
      return;
    }

    expect(getExerciseSliderRange(bench, override)).toEqual({
      min: 20,
      max: 200,
    });
    expect(getExerciseIncrement(bench, override)).toBe(2.5);
  });

  it('falls back to catalogue range and increment without override', () => {
    const bench = getExerciseById('bench-press');
    expect(bench).toBeDefined();
    if (!bench) {
      return;
    }

    expect(getExerciseSliderRange(bench)).toEqual(bench.sliderRange);
    expect(getExerciseIncrement(bench)).toBe(bench.increment);
  });
});
