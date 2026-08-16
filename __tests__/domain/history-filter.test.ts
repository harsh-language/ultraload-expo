import {
  FILTERABLE_MUSCLE_GROUPS,
  getFilterableMuscleGroups,
} from '../../src/domain/catalogue';
import {
  applyHistoryExerciseFilter,
  applyHistoryMuscleFilter,
  buildChartSeries,
  buildHistoryListRows,
  DEFAULT_HISTORY_FILTER,
  filterWorkoutsByRange,
  formatMonthAppliedLabel,
  getActiveHistoryMuscle,
  getDirectExerciseIdsForMuscle,
  getFilteredSessionValue,
  getMuscleGroupWeightedTotal,
  historyRangesEqual,
  listHistoryPeriods,
  type HistoryFilter,
} from '../../src/domain/history-filter';
import { type ProgressWorkout } from '../../src/domain/progress';

function workout(
  date: string,
  exercises: ProgressWorkout['loggedExercises'],
): ProgressWorkout {
  return { date, loggedExercises: exercises };
}

function setsForTotal(totalKg: number): ProgressWorkout['loggedExercises'][0]['sets'] {
  // weight × reps = totalKg — use weight=totalKg, reps=1 for simple fixtures.
  return [{ weight: totalKg, reps: 1, warmUp: false }];
}

describe('history filter domain', () => {
  describe('historyRangesEqual', () => {
    it('matches all / year / month ranges by value', () => {
      expect(historyRangesEqual({ kind: 'all' }, { kind: 'all' })).toBe(true);
      expect(
        historyRangesEqual({ kind: 'year', year: 2026 }, { kind: 'year', year: 2026 }),
      ).toBe(true);
      expect(
        historyRangesEqual(
          { kind: 'month', year: 2026, month: 7 },
          { kind: 'month', year: 2026, month: 7 },
        ),
      ).toBe(true);
      expect(
        historyRangesEqual({ kind: 'year', year: 2026 }, { kind: 'year', year: 2025 }),
      ).toBe(false);
      expect(
        historyRangesEqual({ kind: 'all' }, { kind: 'year', year: 2026 }),
      ).toBe(false);
    });
  });

  describe('dependent muscle and exercise filters', () => {
    it('shows only plan exercises whose primary muscle matches', () => {
      expect(
        getDirectExerciseIdsForMuscle(
          [
            'bench-press',
            'overhead-press',
            'crossover',
            'unknown-orphan',
          ],
          'Chest',
        ),
      ).toEqual(['bench-press', 'crossover']);
    });

    it('keeps the muscle active while an exercise is selected', () => {
      const muscleFilter = applyHistoryMuscleFilter(
        DEFAULT_HISTORY_FILTER,
        'Chest',
      );
      const exerciseFilter = applyHistoryExerciseFilter(
        muscleFilter,
        'bench-press',
      );

      expect(exerciseFilter.dimension).toEqual({
        kind: 'exercise',
        exerciseId: 'bench-press',
      });
      expect(getActiveHistoryMuscle(exerciseFilter.dimension)).toBe('Chest');
    });

    it('resets exercise to all when the muscle changes', () => {
      const chestExercise = applyHistoryExerciseFilter(
        applyHistoryMuscleFilter(DEFAULT_HISTORY_FILTER, 'Chest'),
        'bench-press',
      );

      expect(
        applyHistoryMuscleFilter(chestExercise, 'Shoulders').dimension,
      ).toEqual({ kind: 'muscle', muscle: 'Shoulders' });
    });

    it('keeps the exercise when the selected muscle does not change', () => {
      const chestExercise = applyHistoryExerciseFilter(
        applyHistoryMuscleFilter(DEFAULT_HISTORY_FILTER, 'Chest'),
        'bench-press',
      );

      expect(applyHistoryMuscleFilter(chestExercise, 'Chest')).toBe(
        chestExercise,
      );
    });

    it('rejects exercise selection outside the active muscle group', () => {
      const chestFilter = applyHistoryMuscleFilter(
        DEFAULT_HISTORY_FILTER,
        'Chest',
      );

      expect(
        applyHistoryExerciseFilter(chestFilter, 'overhead-press'),
      ).toBe(chestFilter);
    });

    it('resets exercise to all without clearing the muscle group', () => {
      const exerciseFilter = applyHistoryExerciseFilter(
        applyHistoryMuscleFilter(DEFAULT_HISTORY_FILTER, 'Glutes'),
        'romanian-deadlifts',
      );

      expect(applyHistoryExerciseFilter(exerciseFilter, null).dimension).toEqual(
        { kind: 'muscle', muscle: 'Glutes' },
      );
    });
  });

  describe('T20 — chart filter set (BR23)', () => {
    it('limits muscle-group filters to Chest/Shoulders/Back/Glutes/Quads', () => {
      expect(FILTERABLE_MUSCLE_GROUPS).toEqual([
        'Chest',
        'Shoulders',
        'Back',
        'Glutes',
        'Quads',
      ]);
      expect(getFilterableMuscleGroups()).toEqual([
        'Chest',
        'Shoulders',
        'Back',
        'Glutes',
        'Quads',
      ]);
      expect(FILTERABLE_MUSCLE_GROUPS).not.toContain('Biceps');
      expect(FILTERABLE_MUSCLE_GROUPS).not.toContain('Triceps');
    });
  });

  describe('T4 — muscle-group weighting (BR13)', () => {
    it('matches the Glutes worked example (7000)', () => {
      // Bench 2000 kg (no Glutes → skip) + RDL 3000 (1×) + Hip thrust 4000 (1×) = 7000.
      const session = workout('2026-01-10', [
        {
          exerciseId: 'bench-press',
          sets: setsForTotal(2000),
        },
        {
          exerciseId: 'romanian-deadlifts',
          sets: setsForTotal(3000),
        },
        {
          exerciseId: 'barbell-hip-thrust',
          sets: setsForTotal(4000),
        },
      ]);

      expect(getMuscleGroupWeightedTotal(session, 'Glutes')).toBe(7000);
    });

    it('skips orphaned exercise ids (BR31)', () => {
      const session = workout('2026-01-10', [
        {
          exerciseId: 'unknown-orphan',
          sets: setsForTotal(5000),
        },
        {
          exerciseId: 'romanian-deadlifts',
          sets: setsForTotal(3000),
        },
      ]);

      expect(getMuscleGroupWeightedTotal(session, 'Glutes')).toBe(3000);
    });

    it('respects plan filter — hidden exercises do not contribute (BR3)', () => {
      const session = workout('2026-01-10', [
        {
          exerciseId: 'romanian-deadlifts',
          sets: setsForTotal(3000),
        },
        {
          exerciseId: 'barbell-hip-thrust',
          sets: setsForTotal(4000),
        },
      ]);

      expect(
        getMuscleGroupWeightedTotal(session, 'Glutes', ['romanian-deadlifts']),
      ).toBe(3000);
    });
  });

  describe('listHistoryPeriods', () => {
    it('includes all-time, years, and months from oldest active session', () => {
      const workouts = [
        workout('2025-11-15', [
          { exerciseId: 'bench-press', sets: setsForTotal(1000) },
        ]),
        workout('2026-01-10', [
          { exerciseId: 'bench-press', sets: setsForTotal(1200) },
        ]),
      ];

      const options = listHistoryPeriods(workouts, '2026-01-31');
      expect(options[0]).toMatchObject({
        range: { kind: 'all' },
        label: 'all time',
      });
      expect(options.some((o) => o.range.kind === 'year' && o.range.year === 2026)).toBe(
        true,
      );
      expect(options.some((o) => o.range.kind === 'year' && o.range.year === 2025)).toBe(
        true,
      );
      expect(
        options.some(
          (o) =>
            o.range.kind === 'month' &&
            o.range.year === 2025 &&
            o.range.month === 11,
        ),
      ).toBe(true);
      expect(formatMonthAppliedLabel(2026, 6)).toBe("jun '26");
    });
  });

  describe('filterWorkoutsByRange', () => {
    const workouts = [
      workout('2026-01-05', [
        { exerciseId: 'bench-press', sets: setsForTotal(1000) },
      ]),
      workout('2026-02-05', [
        { exerciseId: 'bench-press', sets: setsForTotal(1100) },
      ]),
      workout('2025-12-05', [
        { exerciseId: 'bench-press', sets: setsForTotal(900) },
      ]),
    ];

    it('keeps all for all-time', () => {
      expect(filterWorkoutsByRange(workouts, { kind: 'all' })).toHaveLength(3);
    });

    it('filters by year', () => {
      expect(
        filterWorkoutsByRange(workouts, { kind: 'year', year: 2026 }).map(
          (w) => w.date,
        ),
      ).toEqual(['2026-01-05', '2026-02-05']);
    });

    it('filters by month', () => {
      expect(
        filterWorkoutsByRange(workouts, {
          kind: 'month',
          year: 2026,
          month: 1,
        }).map((w) => w.date),
      ).toEqual(['2026-01-05']);
    });
  });

  describe('buildChartSeries', () => {
    const workouts = [
      workout('2026-01-01', [
        {
          exerciseId: 'bench-press',
          sets: setsForTotal(2000),
        },
        {
          exerciseId: 'romanian-deadlifts',
          sets: setsForTotal(3000),
        },
      ]),
      workout('2026-01-08', [
        {
          exerciseId: 'bench-press',
          sets: setsForTotal(2200),
        },
      ]),
      workout('2026-02-01', [
        {
          exerciseId: 'romanian-deadlifts',
          sets: setsForTotal(3100),
        },
      ]),
    ];
    const plan = ['bench-press', 'romanian-deadlifts'];

    it('defaults to session totals', () => {
      const filter: HistoryFilter = {
        range: { kind: 'all' },
        dimension: { kind: 'session' },
      };
      expect(buildChartSeries(workouts, filter, plan)).toEqual([
        { date: '2026-01-01', value: 5000 },
        { date: '2026-01-08', value: 2200 },
        { date: '2026-02-01', value: 3100 },
      ]);
    });

    it('switches Y to one exercise', () => {
      const filter: HistoryFilter = {
        range: { kind: 'all' },
        dimension: { kind: 'exercise', exerciseId: 'bench-press' },
      };
      expect(buildChartSeries(workouts, filter, plan)).toEqual([
        { date: '2026-01-01', value: 2000 },
        { date: '2026-01-08', value: 2200 },
      ]);
    });

    it('switches Y to muscle weighting', () => {
      const filter: HistoryFilter = {
        range: { kind: 'all' },
        dimension: { kind: 'muscle', muscle: 'Glutes' },
      };
      // Only RDL contributes Glutes (1×); bench skipped.
      expect(buildChartSeries(workouts, filter, plan)).toEqual([
        { date: '2026-01-01', value: 3000 },
        { date: '2026-02-01', value: 3100 },
      ]);
    });

    it('applies month range', () => {
      const filter: HistoryFilter = {
        range: { kind: 'month', year: 2026, month: 1 },
        dimension: { kind: 'session' },
      };
      expect(buildChartSeries(workouts, filter, plan).map((p) => p.date)).toEqual([
        '2026-01-01',
        '2026-01-08',
      ]);
    });
  });

  describe('filtered history list rows', () => {
    it('scopes day totals to an exercise dimension', () => {
      const workouts = [
        workout('2026-01-01', [
          { exerciseId: 'bench-press', sets: setsForTotal(2000) },
          { exerciseId: 'romanian-deadlifts', sets: setsForTotal(3000) },
        ]),
        workout('2026-01-08', [
          { exerciseId: 'bench-press', sets: setsForTotal(2200) },
          { exerciseId: 'romanian-deadlifts', sets: setsForTotal(3000) },
        ]),
      ];
      const filter: HistoryFilter = {
        range: { kind: 'all' },
        dimension: { kind: 'exercise', exerciseId: 'bench-press' },
      };
      const rows = buildHistoryListRows(
        workouts,
        ['bench-press', 'romanian-deadlifts'],
        '2026-01-08',
        filter,
      );
      const jan1 = rows.find((row) => row.date === '2026-01-01');
      const jan8 = rows.find((row) => row.date === '2026-01-08');
      expect(jan1?.totalKg).toBe(2000);
      expect(jan8?.totalKg).toBe(2200);
      expect(jan8?.dayPercent).toBe(((2200 - 2000) / 2000) * 100);
    });

    it('scopes day totals to a muscle dimension', () => {
      const workouts = [
        workout('2026-01-01', [
          { exerciseId: 'bench-press', sets: setsForTotal(2000) },
          { exerciseId: 'romanian-deadlifts', sets: setsForTotal(3000) },
          { exerciseId: 'barbell-hip-thrust', sets: setsForTotal(4000) },
        ]),
      ];
      const filter: HistoryFilter = {
        range: { kind: 'all' },
        dimension: { kind: 'muscle', muscle: 'Glutes' },
      };
      const rows = buildHistoryListRows(
        workouts,
        ['bench-press', 'romanian-deadlifts', 'barbell-hip-thrust'],
        '2026-01-01',
        filter,
      );
      expect(rows.find((row) => row.date === '2026-01-01')?.totalKg).toBe(7000);
    });
  });

  describe('getFilteredSessionValue', () => {
    it('returns session / exercise / muscle values', () => {
      const session = workout('2026-01-01', [
        { exerciseId: 'bench-press', sets: setsForTotal(2000) },
        { exerciseId: 'romanian-deadlifts', sets: setsForTotal(3000) },
      ]);
      const plan = ['bench-press', 'romanian-deadlifts'];
      expect(
        getFilteredSessionValue(session, { kind: 'session' }, plan),
      ).toBe(5000);
      expect(
        getFilteredSessionValue(
          session,
          { kind: 'exercise', exerciseId: 'bench-press' },
          plan,
        ),
      ).toBe(2000);
      expect(
        getFilteredSessionValue(
          session,
          { kind: 'muscle', muscle: 'Glutes' },
          plan,
        ),
      ).toBe(3000);
    });
  });
});
