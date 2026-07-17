import { getBodyweightExerciseRange } from '../../src/domain/ranges';

describe('ranges domain', () => {
  it('recomputes ◊ exercise bounds when bodyweight changes (T8)', () => {
    expect(getBodyweightExerciseRange(75)).toEqual({ min: 37.5, max: 150 });
    expect(getBodyweightExerciseRange(80)).toEqual({ min: 40, max: 160 });
    expect(getBodyweightExerciseRange(70)).toEqual({ min: 35, max: 140 });
  });
});
