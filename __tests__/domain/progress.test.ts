import {
  buildHistoryListRows,
  buildSessionExerciseStats,
  filterWorkoutByPlan,
  findPriorExerciseTotal,
  formatPercentChange,
  getDayPercentChange,
  getExercisePercentChange,
  getExerciseTotalWeightMoved,
  getPercentDirection,
  type ProgressWorkout,
} from '../../src/domain/progress';
import { getSessionTotalWeightMoved } from '../../src/domain/session-totals';

function workout(
  date: string,
  exercises: ProgressWorkout['loggedExercises'],
): ProgressWorkout {
  return { date, loggedExercises: exercises };
}

describe('progress domain', () => {
  describe('getExerciseTotalWeightMoved (BR6 / T13 partial)', () => {
    it('sums weight × reps for standard sets only', () => {
      expect(
        getExerciseTotalWeightMoved([
          { weight: 60, reps: 8, warmUp: true },
          { weight: 100, reps: 5, warmUp: false },
          { weight: 110, reps: 3, warmUp: false },
        ]),
      ).toBe(100 * 5 + 110 * 3);
    });
  });

  describe('T1 — warm-up-only days (BR4, BR6, BR11)', () => {
    it('excludes warm-up sets from totals and produces no day comparison', () => {
      const workouts = [
        workout('2026-01-01', [
          {
            exerciseId: 'bench',
            sets: [{ weight: 100, reps: 5, warmUp: false }],
          },
        ]),
        workout('2026-01-02', [
          {
            exerciseId: 'bench',
            sets: [{ weight: 40, reps: 10, warmUp: true }],
          },
        ]),
        workout('2026-01-03', [
          {
            exerciseId: 'bench',
            sets: [{ weight: 110, reps: 5, warmUp: false }],
          },
        ]),
      ];

      const rows = buildHistoryListRows(workouts, ['bench']);
      const warmUpOnly = rows.find((row) => row.date === '2026-01-02');
      const later = rows.find((row) => row.date === '2026-01-03');

      expect(warmUpOnly?.totalKg).toBe(0);
      expect(warmUpOnly?.dayPercent).toBeNull();
      // Later day compares against Jan 1, not the warm-up-only day (BR11).
      expect(later?.dayPercent).toBe(
        getExercisePercentChange(110 * 5, 100 * 5),
      );
    });
  });

  describe('T2 — missing prior session (BR8, BR10)', () => {
    it('shows null ("—") when no valid prior exists', () => {
      const workouts = [
        workout('2026-01-01', [
          {
            exerciseId: 'bench',
            sets: [{ weight: 100, reps: 5, warmUp: false }],
          },
        ]),
      ];

      const rows = buildHistoryListRows(workouts, ['bench']);
      expect(rows).toEqual([
        { date: '2026-01-01', totalKg: 500, dayPercent: null },
      ]);

      expect(getExercisePercentChange(500, 0)).toBeNull();
      expect(findPriorExerciseTotal(workouts, 'bench', '2026-01-01')).toBeNull();
    });
  });

  describe('T3 — day-% averaging (BR9)', () => {
    it('averages only exercises with valid comparisons', () => {
      // Day 1: bench + squat
      // Day 2: bench (up), squat missing prior for deadlift first appearance
      const workouts = [
        workout('2026-01-01', [
          {
            exerciseId: 'bench',
            sets: [{ weight: 100, reps: 5, warmUp: false }],
          },
          {
            exerciseId: 'squat',
            sets: [{ weight: 140, reps: 5, warmUp: false }],
          },
        ]),
        workout('2026-01-02', [
          {
            exerciseId: 'bench',
            sets: [{ weight: 110, reps: 5, warmUp: false }],
          },
          {
            exerciseId: 'squat',
            sets: [{ weight: 140, reps: 5, warmUp: false }],
          },
          {
            exerciseId: 'deadlift',
            sets: [{ weight: 160, reps: 5, warmUp: false }],
          },
        ]),
      ];

      const benchPct = getExercisePercentChange(110 * 5, 100 * 5)!;
      const squatPct = getExercisePercentChange(140 * 5, 140 * 5)!;
      // deadlift has no prior → excluded from average
      expect(getDayPercentChange([benchPct, squatPct, null])).toBe(
        (benchPct + squatPct) / 2,
      );

      const rows = buildHistoryListRows(workouts, [
        'bench',
        'squat',
        'deadlift',
      ]);
      const day2 = rows.find((row) => row.date === '2026-01-02');
      expect(day2?.dayPercent).toBe((benchPct + squatPct) / 2);
    });
  });

  describe('T5 — re-enable after remove (BR3)', () => {
    it('hides removed exercises from totals and restores on re-enable', () => {
      const workouts = [
        workout('2026-01-01', [
          {
            exerciseId: 'bench',
            sets: [{ weight: 100, reps: 5, warmUp: false }],
          },
          {
            exerciseId: 'squat',
            sets: [{ weight: 140, reps: 5, warmUp: false }],
          },
        ]),
        workout('2026-01-02', [
          {
            exerciseId: 'bench',
            sets: [{ weight: 110, reps: 5, warmUp: false }],
          },
          {
            exerciseId: 'squat',
            sets: [{ weight: 150, reps: 5, warmUp: false }],
          },
        ]),
      ];

      const withBoth = buildHistoryListRows(workouts, ['bench', 'squat']);
      const withoutSquat = buildHistoryListRows(workouts, ['bench']);
      const restored = buildHistoryListRows(workouts, ['bench', 'squat']);

      expect(withBoth[0]?.totalKg).toBe(110 * 5 + 150 * 5);
      expect(withoutSquat[0]?.totalKg).toBe(110 * 5);
      expect(restored).toEqual(withBoth);

      const filtered = filterWorkoutByPlan(workouts[1]!, ['bench']);
      expect(filtered.loggedExercises.map((e) => e.exerciseId)).toEqual([
        'bench',
      ]);
    });
  });

  describe('T6 — edit past day recalculation (BR12)', () => {
    it('recomputing from edited trees updates downstream %', () => {
      const before = [
        workout('2026-01-01', [
          {
            exerciseId: 'bench',
            sets: [{ weight: 100, reps: 5, warmUp: false }],
          },
        ]),
        workout('2026-01-02', [
          {
            exerciseId: 'bench',
            sets: [{ weight: 110, reps: 5, warmUp: false }],
          },
        ]),
      ];

      const afterEdit = [
        workout('2026-01-01', [
          {
            exerciseId: 'bench',
            sets: [{ weight: 120, reps: 5, warmUp: false }],
          },
        ]),
        workout('2026-01-02', [
          {
            exerciseId: 'bench',
            sets: [{ weight: 110, reps: 5, warmUp: false }],
          },
        ]),
      ];

      const beforeRows = buildHistoryListRows(before, ['bench']);
      const afterRows = buildHistoryListRows(afterEdit, ['bench']);

      expect(beforeRows.find((r) => r.date === '2026-01-02')?.dayPercent).toBe(
        getExercisePercentChange(550, 500),
      );
      expect(afterRows.find((r) => r.date === '2026-01-02')?.dayPercent).toBe(
        getExercisePercentChange(550, 600),
      );
    });
  });

  describe('T13 — day-total aggregation (BR7)', () => {
    it('sums per-exercise standard-set totals into the day total', () => {
      const day = workout('2026-01-01', [
        {
          exerciseId: 'bench',
          sets: [
            { weight: 60, reps: 8, warmUp: true },
            { weight: 100, reps: 5, warmUp: false },
          ],
        },
        {
          exerciseId: 'squat',
          sets: [{ weight: 140, reps: 5, warmUp: false }],
        },
      ]);

      expect(getSessionTotalWeightMoved(day)).toBe(100 * 5 + 140 * 5);
      expect(
        getExerciseTotalWeightMoved(day.loggedExercises[0]!.sets) +
          getExerciseTotalWeightMoved(day.loggedExercises[1]!.sets),
      ).toBe(getSessionTotalWeightMoved(day));
    });
  });

  describe('format helpers', () => {
    it('formats percent labels and directions', () => {
      expect(formatPercentChange(12.4)).toBe('12.4%');
      expect(formatPercentChange(-3.6)).toBe('-3.6%');
      expect(formatPercentChange(0.5)).toBe('0.5%');
      expect(formatPercentChange(0)).toBe('0%');
      expect(formatPercentChange(12)).toBe('12%');
      expect(getPercentDirection(1)).toBe('up');
      expect(getPercentDirection(-1)).toBe('down');
      expect(getPercentDirection(0)).toBe('flat');
    });
  });

  describe('buildSessionExerciseStats', () => {
    it('returns per-exercise % against prior standard sessions', () => {
      const workouts = [
        workout('2026-01-01', [
          {
            exerciseId: 'bench',
            sets: [{ weight: 100, reps: 5, warmUp: false }],
          },
        ]),
        workout('2026-01-02', [
          {
            exerciseId: 'bench',
            sets: [{ weight: 110, reps: 5, warmUp: false }],
          },
        ]),
      ];

      const stats = buildSessionExerciseStats(workouts, '2026-01-02', [
        'bench',
      ]);
      expect(stats).toEqual([
        {
          exerciseId: 'bench',
          totalKg: 550,
          percentChange: getExercisePercentChange(550, 500),
        },
      ]);
    });
  });
});
