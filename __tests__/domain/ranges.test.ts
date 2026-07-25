import { getExerciseById } from '../../src/domain/catalogue';
import {
  getExerciseIncrement,
  getExerciseSliderRange,
} from '../../src/domain/ranges';

describe('ranges domain', () => {
  it('returns catalogue range and increment', () => {
    const bench = getExerciseById('bench-press');
    expect(bench).toBeDefined();
    if (!bench) {
      return;
    }

    expect(getExerciseSliderRange(bench)).toEqual(bench.sliderRange);
    expect(getExerciseIncrement(bench)).toBe(bench.increment);
  });
});
