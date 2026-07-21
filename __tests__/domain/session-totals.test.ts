import {
  formatSessionTotalWeightLabel,
  getSessionTotalWeightMoved,
  hasStandardSets,
  type WorkoutForSessionTotal,
} from '../../src/domain/session-totals';

describe('session totals domain', () => {
  const workoutWithWarmUpOnly: WorkoutForSessionTotal = {
    loggedExercises: [
      {
        sets: [{ weight: 80, reps: 10, warmUp: true }],
      },
    ],
  };

  const workoutWithStandardSets: WorkoutForSessionTotal = {
    loggedExercises: [
      {
        sets: [
          { weight: 80, reps: 10, warmUp: true },
          { weight: 100, reps: 5, warmUp: false },
          { weight: 110, reps: 3, warmUp: false },
        ],
      },
      {
        sets: [{ weight: 140, reps: 2, warmUp: false }],
      },
    ],
  };

  it('sums weight × reps for standard sets only (BR7)', () => {
    expect(getSessionTotalWeightMoved(null)).toBe(0);
    expect(getSessionTotalWeightMoved(workoutWithWarmUpOnly)).toBe(0);
    expect(getSessionTotalWeightMoved(workoutWithStandardSets)).toBe(100 * 5 + 110 * 3 + 140 * 2);
  });

  it('detects when only warm-up sets are logged', () => {
    expect(hasStandardSets(null)).toBe(false);
    expect(hasStandardSets(workoutWithWarmUpOnly)).toBe(false);
    expect(hasStandardSets(workoutWithStandardSets)).toBe(true);
  });

  it('formats session total with grouped thousands and unit suffix', () => {
    expect(formatSessionTotalWeightLabel(5355)).toBe('5,355 kg');
    expect(formatSessionTotalWeightLabel(100)).toBe('100 kg');
    expect(formatSessionTotalWeightLabel(100, 'lbs')).toBe('220.5 lbs');
    expect(formatSessionTotalWeightLabel(100, 'stone')).toBe('15.5 st');
  });
});
