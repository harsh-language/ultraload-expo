import { getStandardSetsForExerciseToday } from '../../src/domain/standard-sets';

describe('getStandardSetsForExerciseToday', () => {
  it('returns an empty list when workout or exercise is missing', () => {
    expect(getStandardSetsForExerciseToday(null, 'squat')).toEqual([]);
    expect(
      getStandardSetsForExerciseToday({ loggedExercises: [] }, 'squat'),
    ).toEqual([]);
  });

  it('returns only non-warmup sets for the matching exercise', () => {
    const warmup = { warmUp: true, weight: 40 };
    const standardA = { warmUp: false, weight: 100 };
    const standardB = { warmUp: false, weight: 110 };

    const workout = {
      loggedExercises: [
        {
          exerciseId: 'squat',
          sets: [warmup, standardA, { warmUp: true, weight: 50 }, standardB],
        },
        {
          exerciseId: 'bench',
          sets: [{ warmUp: false, weight: 60 }],
        },
      ],
    };

    expect(getStandardSetsForExerciseToday(workout, 'squat')).toEqual([
      standardA,
      standardB,
    ]);
    expect(getStandardSetsForExerciseToday(workout, 'bench')).toEqual([
      { warmUp: false, weight: 60 },
    ]);
  });
});
