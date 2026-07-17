import { getLastSetToday } from '../../src/domain/defaults';

describe('defaults domain', () => {
  it('returns last set today for an exercise (BR21)', () => {
    const workout = {
      loggedExercises: [
        {
          exerciseId: 'bench-press',
          sets: [
            { weight: 60, reps: 8, order: 1 },
            { weight: 80, reps: 5, order: 2 },
            { weight: 100, reps: 6, order: 3 },
          ],
        },
      ],
    };

    expect(getLastSetToday(workout, 'bench-press')).toEqual({
      weight: 100,
      reps: 6,
    });
  });

  it('returns null when no sets logged today for exercise', () => {
    expect(getLastSetToday(null, 'bench-press')).toBeNull();
    expect(
      getLastSetToday(
        { loggedExercises: [{ exerciseId: 'bench-press', sets: [] }] },
        'bench-press',
      ),
    ).toBeNull();
  });
});
