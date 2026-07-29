import {
  formatSessionTotalWeightLabel,
  getSessionTotalWeightMoved,
  hasStandardSets,
} from './session-totals';

export type PercentDirection = 'up' | 'down' | 'flat';

export interface ProgressSet {
  weight: number;
  reps: number;
  warmUp: boolean;
}

export interface ProgressLoggedExercise {
  exerciseId: string;
  sets: ProgressSet[];
}

export interface ProgressWorkout {
  date: string;
  loggedExercises: ProgressLoggedExercise[];
}

export interface HistoryListRow {
  date: string;
  totalKg: number;
  /** Null when there is no valid day comparison (BR10 / BR11). */
  dayPercent: number | null;
}

export interface SessionExerciseStat {
  exerciseId: string;
  totalKg: number;
  /** Null when there is no valid prior session (BR8 / BR10 / BR11). */
  percentChange: number | null;
}

/** BR6 — Σ(weight × reps) for one exercise’s standard sets. */
export function getExerciseTotalWeightMoved(
  sets: ProgressSet[],
): number {
  let total = 0;
  for (const set of sets) {
    if (!set.warmUp) {
      total += set.weight * set.reps;
    }
  }
  return total;
}

function hasStandardSetsForExercise(sets: ProgressSet[]): boolean {
  return sets.some((set) => !set.warmUp);
}

/**
 * BR8 — percent change vs a prior total. Returns null when either total is
 * non-positive (no valid comparison).
 */
export function getExercisePercentChange(
  currentTotalKg: number,
  priorTotalKg: number,
): number | null {
  if (currentTotalKg <= 0 || priorTotalKg <= 0) {
    return null;
  }
  return ((currentTotalKg - priorTotalKg) / priorTotalKg) * 100;
}

/**
 * BR9 — simple average of per-exercise % changes that have a valid comparison.
 * Returns null when nothing is valid to average (BR10).
 */
export function getDayPercentChange(
  exercisePercents: Array<number | null>,
): number | null {
  const valid = exercisePercents.filter(
    (value): value is number => value != null,
  );
  if (valid.length === 0) {
    return null;
  }
  const sum = valid.reduce((acc, value) => acc + value, 0);
  return sum / valid.length;
}

export function formatPercentChange(percent: number): string {
  const rounded = Math.round(percent * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `${text}%`;
}

export function getPercentDirection(percent: number): PercentDirection {
  if (percent > 0) {
    return 'up';
  }
  if (percent < 0) {
    return 'down';
  }
  return 'flat';
}

export function filterWorkoutByPlan<T extends ProgressWorkout>(
  workout: T,
  activeExerciseIds: ReadonlySet<string> | readonly string[],
): T {
  const active =
    activeExerciseIds instanceof Set
      ? activeExerciseIds
      : new Set(activeExerciseIds);

  return {
    ...workout,
    loggedExercises: workout.loggedExercises.filter((logged) =>
      active.has(logged.exerciseId),
    ),
  };
}

/**
 * Find the most recent older session that has standard sets for `exerciseId`
 * (BR8, BR11). `workoutsOldestFirst` must be sorted ascending by date.
 */
export function findPriorExerciseTotal(
  workoutsOldestFirst: ProgressWorkout[],
  exerciseId: string,
  beforeDate: string,
): number | null {
  let prior: number | null = null;

  for (const workout of workoutsOldestFirst) {
    if (workout.date >= beforeDate) {
      break;
    }

    const logged = workout.loggedExercises.find(
      (entry) => entry.exerciseId === exerciseId,
    );
    if (!logged || !hasStandardSetsForExercise(logged.sets)) {
      continue;
    }

    prior = getExerciseTotalWeightMoved(logged.sets);
  }

  return prior;
}

function sortOldestFirst(
  workouts: ProgressWorkout[],
): ProgressWorkout[] {
  return [...workouts].sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Per-exercise totals and % for one session (plan-filtered caller-side).
 * BR6, BR8, BR10, BR11.
 */
export function buildSessionExerciseStats(
  workouts: ProgressWorkout[],
  sessionDate: string,
  activeExerciseIds: ReadonlySet<string> | readonly string[],
): SessionExerciseStat[] {
  const oldestFirst = sortOldestFirst(
    workouts.map((workout) => filterWorkoutByPlan(workout, activeExerciseIds)),
  );
  const session = oldestFirst.find((workout) => workout.date === sessionDate);
  if (!session) {
    return [];
  }

  return session.loggedExercises.map((logged) => {
    const totalKg = getExerciseTotalWeightMoved(logged.sets);
    if (!hasStandardSetsForExercise(logged.sets)) {
      return {
        exerciseId: logged.exerciseId,
        totalKg: 0,
        percentChange: null,
      };
    }

    const prior = findPriorExerciseTotal(
      oldestFirst,
      logged.exerciseId,
      sessionDate,
    );
    const percentChange =
      prior == null ? null : getExercisePercentChange(totalKg, prior);

    return {
      exerciseId: logged.exerciseId,
      totalKg,
      percentChange,
    };
  });
}

/**
 * History list rows newest-first: day total + day % (or null → "—").
 * BR7, BR9, BR10, BR11. Plan filter applied (BR3).
 */
export function buildHistoryListRows(
  workouts: ProgressWorkout[],
  activeExerciseIds: ReadonlySet<string> | readonly string[],
): HistoryListRow[] {
  const oldestFirst = sortOldestFirst(
    workouts.map((workout) => filterWorkoutByPlan(workout, activeExerciseIds)),
  );

  const rows: HistoryListRow[] = [];

  for (const workout of oldestFirst) {
    if (!hasStandardSets(workout) && workout.loggedExercises.length === 0) {
      continue;
    }

    const exercisePercents: Array<number | null> = [];

    for (const logged of workout.loggedExercises) {
      if (!hasStandardSetsForExercise(logged.sets)) {
        continue;
      }

      const current = getExerciseTotalWeightMoved(logged.sets);
      const prior = findPriorExerciseTotal(
        oldestFirst,
        logged.exerciseId,
        workout.date,
      );
      exercisePercents.push(
        prior == null ? null : getExercisePercentChange(current, prior),
      );
    }

    rows.push({
      date: workout.date,
      totalKg: getSessionTotalWeightMoved(workout),
      dayPercent: getDayPercentChange(exercisePercents),
    });
  }

  return rows.reverse();
}

export { formatSessionTotalWeightLabel, getSessionTotalWeightMoved, hasStandardSets };
