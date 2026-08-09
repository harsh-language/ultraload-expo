import { eachCalendarDateDescending } from './history-date';
import {
  formatSessionTotalWeightLabel,
  getExerciseTotalWeightMoved,
  getSessionTotalWeightMoved,
  hasStandardSets,
  hasStandardSetsForExercise,
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
  /**
   * True when this day’s standard-set total for its exercises is the all-time
   * high vs any other session that includes those same exercises. False for the
   * first session with that exercise set (no comparable prior).
   */
  isBestRecord: boolean;
  /**
   * True when this calendar day has no standard sets (gap fill or warm-up-only).
   * Rest rows are tappable and open session detail.
   */
  isRest: boolean;
}

export interface SessionExerciseStat {
  exerciseId: string;
  totalKg: number;
  /** Null when there is no valid prior session (BR8 / BR10 / BR11). */
  percentChange: number | null;
}

/** Exercise ids on a workout that have at least one standard set. */
export function getStandardExerciseIds(
  workout: ProgressWorkout,
): string[] {
  const ids: string[] = [];
  for (const logged of workout.loggedExercises) {
    if (hasStandardSetsForExercise(logged.sets)) {
      ids.push(logged.exerciseId);
    }
  }
  return ids;
}

/**
 * Total weight moved for a specific set of exercises on one workout
 * (standard sets only). Missing exercises contribute 0.
 */
export function getExercisesTotalWeightMoved(
  workout: ProgressWorkout,
  exerciseIds: readonly string[],
): number {
  let total = 0;
  for (const exerciseId of exerciseIds) {
    const logged = workout.loggedExercises.find(
      (entry) => entry.exerciseId === exerciseId,
    );
    if (!logged) {
      continue;
    }
    total += getExerciseTotalWeightMoved(logged.sets);
  }
  return total;
}

/**
 * All-time best for this day’s exercise set: current total beats (or ties the
 * max of) every other session that includes those same exercises. Requires at
 * least one comparable other session — first outing with those exercises is
 * never a best record.
 */
export function isSessionBestRecord(
  workouts: ProgressWorkout[],
  sessionDate: string,
): boolean {
  const session = workouts.find((workout) => workout.date === sessionDate);
  if (!session) {
    return false;
  }

  const exerciseIds = getStandardExerciseIds(session);
  if (exerciseIds.length === 0) {
    return false;
  }

  const current = getExercisesTotalWeightMoved(session, exerciseIds);
  if (current <= 0) {
    return false;
  }

  let hasComparable = false;
  let maxOther = 0;

  for (const workout of workouts) {
    if (workout.date === sessionDate) {
      continue;
    }

    const otherIds = new Set(getStandardExerciseIds(workout));
    const includesAll = exerciseIds.every((id) => otherIds.has(id));
    if (!includesAll) {
      continue;
    }

    hasComparable = true;
    const otherTotal = getExercisesTotalWeightMoved(workout, exerciseIds);
    if (otherTotal > maxOther) {
      maxOther = otherTotal;
    }
  }

  if (!hasComparable) {
    return false;
  }

  return current >= maxOther;
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
 * Fill missing calendar days between the oldest session and `throughDate`
 * (or the newest session when `throughDate` is omitted / earlier). Newest-first.
 */
export function fillHistoryCalendarGaps(
  sessionRowsNewestFirst: HistoryListRow[],
  throughDate?: string,
): HistoryListRow[] {
  if (sessionRowsNewestFirst.length === 0) {
    return [];
  }

  const byDate = new Map(
    sessionRowsNewestFirst.map((row) => [row.date, row]),
  );
  let oldest = sessionRowsNewestFirst[0]!.date;
  let newest = sessionRowsNewestFirst[0]!.date;
  for (const row of sessionRowsNewestFirst) {
    if (row.date < oldest) {
      oldest = row.date;
    }
    if (row.date > newest) {
      newest = row.date;
    }
  }
  const end =
    throughDate != null && throughDate > newest ? throughDate : newest;

  const filled: HistoryListRow[] = [];
  for (const date of eachCalendarDateDescending(oldest, end)) {
    const existing = byDate.get(date);
    if (existing) {
      filled.push(existing);
      continue;
    }
    filled.push({
      date,
      totalKg: 0,
      dayPercent: null,
      isBestRecord: false,
      isRest: true,
    });
  }
  return filled;
}

/**
 * History list rows newest-first: day total + day % (or null/0 → "–"),
 * with rest rows for missing calendar days through `throughDate`.
 * BR7, BR9, BR10, BR11. Plan filter applied (BR3).
 */
export function buildHistoryListRows(
  workouts: ProgressWorkout[],
  activeExerciseIds: ReadonlySet<string> | readonly string[],
  throughDate?: string,
): HistoryListRow[] {
  const oldestFirst = sortOldestFirst(
    workouts.map((workout) => filterWorkoutByPlan(workout, activeExerciseIds)),
  );

  const rows: HistoryListRow[] = [];

  for (const workout of oldestFirst) {
    // Warm-up-only days are not active history sessions — gap fill shows them
    // as rest rows. Session detail still opens and shows the warm-up sets.
    if (!hasStandardSets(workout)) {
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
      isBestRecord: isSessionBestRecord(oldestFirst, workout.date),
      isRest: false,
    });
  }

  return fillHistoryCalendarGaps(rows.reverse(), throughDate);
}

export interface HistoryListGroup {
  /** Newer rest days above this session (newest-first). */
  rests: HistoryListRow[];
  session: HistoryListRow;
}

/**
 * Cluster rests with the chronologically previous session (row below in
 * newest-first order). A session with no rests above is still its own group.
 */
export function groupHistoryListRows(
  rows: HistoryListRow[],
): HistoryListGroup[] {
  const groups: HistoryListGroup[] = [];
  let rests: HistoryListRow[] = [];

  for (const row of rows) {
    if (row.isRest) {
      rests.push(row);
      continue;
    }
    groups.push({ rests, session: row });
    rests = [];
  }

  return groups;
}
