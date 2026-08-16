import {
  FILTERABLE_MUSCLE_GROUPS,
  getExerciseById,
  isKnownExercise,
  type FilterableMuscleGroup,
} from './catalogue';
import {
  fillHistoryCalendarGaps,
  filterWorkoutByPlan,
  findPriorExerciseTotal,
  getExercisePercentChange,
  isSessionBestRecord,
  sortOldestFirst,
  type HistoryListRow,
  type ProgressWorkout,
} from './progress';
import {
  getExerciseTotalWeightMoved,
  getSessionTotalWeightMoved,
  hasStandardSets,
  hasStandardSetsForExercise,
} from './session-totals';

export { FILTERABLE_MUSCLE_GROUPS, type FilterableMuscleGroup };

export type HistoryRange =
  | { kind: 'all' }
  | { kind: 'month'; year: number; month: number }
  | { kind: 'year'; year: number };

export function historyRangesEqual(a: HistoryRange, b: HistoryRange): boolean {
  switch (a.kind) {
    case 'all':
      return b.kind === 'all';
    case 'year':
      return b.kind === 'year' && b.year === a.year;
    case 'month':
      return (
        b.kind === 'month' && b.year === a.year && b.month === a.month
      );
    default: {
      const _exhaustive: never = a;
      return _exhaustive;
    }
  }
}

export type HistoryDimension =
  | { kind: 'session' }
  | { kind: 'exercise'; exerciseId: string }
  | { kind: 'muscle'; muscle: FilterableMuscleGroup };

export interface HistoryFilter {
  range: HistoryRange;
  dimension: HistoryDimension;
}

export const DEFAULT_HISTORY_FILTER: HistoryFilter = {
  range: { kind: 'all' },
  dimension: { kind: 'session' },
};

export function getActiveHistoryMuscle(
  dimension: HistoryDimension,
): FilterableMuscleGroup | null {
  switch (dimension.kind) {
    case 'session':
      return null;
    case 'muscle':
      return dimension.muscle;
    case 'exercise': {
      const primaryMuscle = getExerciseById(dimension.exerciseId)?.primaryMuscle;
      return primaryMuscle != null && isFilterableMuscleGroup(primaryMuscle)
        ? primaryMuscle
        : null;
    }
    default: {
      const _exhaustive: never = dimension;
      return _exhaustive;
    }
  }
}

export function getDirectExerciseIdsForMuscle(
  exerciseIds: readonly string[],
  muscle: FilterableMuscleGroup,
): string[] {
  return exerciseIds.filter(
    (exerciseId) => getExerciseById(exerciseId)?.primaryMuscle === muscle,
  );
}

export function applyHistoryMuscleFilter(
  filter: HistoryFilter,
  muscle: FilterableMuscleGroup | null,
): HistoryFilter {
  if (getActiveHistoryMuscle(filter.dimension) === muscle) {
    return filter;
  }
  return {
    ...filter,
    dimension: muscle == null ? { kind: 'session' } : { kind: 'muscle', muscle },
  };
}

export function applyHistoryExerciseFilter(
  filter: HistoryFilter,
  exerciseId: string | null,
): HistoryFilter {
  const muscle = getActiveHistoryMuscle(filter.dimension);
  if (muscle == null) {
    return filter;
  }
  if (exerciseId == null) {
    return { ...filter, dimension: { kind: 'muscle', muscle } };
  }
  if (getExerciseById(exerciseId)?.primaryMuscle !== muscle) {
    return filter;
  }
  return { ...filter, dimension: { kind: 'exercise', exerciseId } };
}

export interface HistoryPeriodOption {
  range: HistoryRange;
  /** Menu label, e.g. "all time", "2026", "june 2026". */
  label: string;
  /** Applied trigger label, e.g. "all", "2026", "jun '26". */
  appliedLabel: string;
}

export interface ChartPoint {
  date: string;
  value: number;
}

export function isFilterableMuscleGroup(
  muscle: string,
): muscle is FilterableMuscleGroup {
  return (FILTERABLE_MUSCLE_GROUPS as readonly string[]).includes(muscle);
}

/**
 * BR13 — Σ over exercises of (total weight moved × that muscle's multiplier).
 * Exercises with no multiplier for the group are skipped. Orphan ids skipped (BR31).
 */
export function getMuscleGroupWeightedTotal(
  workout: ProgressWorkout,
  muscle: FilterableMuscleGroup,
  activeExerciseIds?: ReadonlySet<string> | readonly string[],
): number {
  const scoped =
    activeExerciseIds == null
      ? workout
      : filterWorkoutByPlan(workout, activeExerciseIds);

  let total = 0;
  for (const logged of scoped.loggedExercises) {
    if (!isKnownExercise(logged.exerciseId)) {
      continue;
    }
    const entry = getExerciseById(logged.exerciseId);
    if (!entry) {
      continue;
    }
    const multiplier = entry.muscleMultipliers.find(
      (item) => item.muscle === muscle,
    )?.multiplier;
    if (multiplier == null) {
      continue;
    }
    total += getExerciseTotalWeightMoved(logged.sets) * multiplier;
  }
  return total;
}

/** Session Y value for the active chart/list dimension. */
export function getFilteredSessionValue(
  workout: ProgressWorkout,
  dimension: HistoryDimension,
  activeExerciseIds: ReadonlySet<string> | readonly string[],
): number {
  const scoped = filterWorkoutByPlan(workout, activeExerciseIds);
  switch (dimension.kind) {
    case 'session':
      return getSessionTotalWeightMoved(scoped);
    case 'exercise': {
      const logged = scoped.loggedExercises.find(
        (entry) => entry.exerciseId === dimension.exerciseId,
      );
      if (!logged) {
        return 0;
      }
      return getExerciseTotalWeightMoved(logged.sets);
    }
    case 'muscle':
      return getMuscleGroupWeightedTotal(scoped, dimension.muscle);
    default: {
      const _exhaustive: never = dimension;
      return _exhaustive;
    }
  }
}

function parseCalendarParts(date: string): {
  year: number;
  month: number;
} | null {
  const [year, month] = date.split('-').map(Number);
  if (year == null || month == null || Number.isNaN(year) || Number.isNaN(month)) {
    return null;
  }
  return { year, month };
}

export function workoutMatchesRange(
  date: string,
  range: HistoryRange,
): boolean {
  switch (range.kind) {
    case 'all':
      return true;
    case 'year': {
      const parts = parseCalendarParts(date);
      return parts != null && parts.year === range.year;
    }
    case 'month': {
      const parts = parseCalendarParts(date);
      return (
        parts != null &&
        parts.year === range.year &&
        parts.month === range.month
      );
    }
    default: {
      const _exhaustive: never = range;
      return _exhaustive;
    }
  }
}

export function filterWorkoutsByRange<T extends ProgressWorkout>(
  workouts: T[],
  range: HistoryRange,
): T[] {
  if (range.kind === 'all') {
    return workouts;
  }
  return workouts.filter((workout) =>
    workoutMatchesRange(workout.date, range),
  );
}

const MONTH_SHORT = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
] as const;

const MONTH_LONG = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
] as const;

/** Applied trigger label — "jun '26". */
export function formatMonthAppliedLabel(year: number, month: number): string {
  const short = MONTH_SHORT[month - 1] ?? String(month);
  const yy = String(year).slice(-2);
  return `${short} '${yy}`;
}

/** Menu label — "june 2026". */
export function formatMonthMenuLabel(year: number, month: number): string {
  const long = MONTH_LONG[month - 1] ?? String(month);
  return `${long} ${year}`;
}

function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Navigable period options from oldest active session through `throughDate`
 * (default: newest workout, else today-like end). Newest-first.
 */
export function listHistoryPeriods(
  workouts: ProgressWorkout[],
  throughDate?: string,
): HistoryPeriodOption[] {
  const activeDates = workouts
    .filter((workout) => hasStandardSets(workout))
    .map((workout) => workout.date)
    .sort();

  if (activeDates.length === 0) {
    return [
      {
        range: { kind: 'all' },
        label: 'all time',
        appliedLabel: 'all',
      },
    ];
  }

  const oldest = activeDates[0]!;
  let newest = activeDates[activeDates.length - 1]!;
  if (throughDate != null && throughDate > newest) {
    newest = throughDate;
  }

  const oldestParts = parseCalendarParts(oldest);
  const newestParts = parseCalendarParts(newest);
  if (oldestParts == null || newestParts == null) {
    return [
      {
        range: { kind: 'all' },
        label: 'all time',
        appliedLabel: 'all',
      },
    ];
  }

  const options: HistoryPeriodOption[] = [
    {
      range: { kind: 'all' },
      label: 'all time',
      appliedLabel: 'all',
    },
  ];

  for (let year = newestParts.year; year >= oldestParts.year; year -= 1) {
    options.push({
      range: { kind: 'year', year },
      label: String(year),
      appliedLabel: String(year),
    });
  }

  let year = newestParts.year;
  let month = newestParts.month;
  const endKey = monthKey(oldestParts.year, oldestParts.month);
  while (monthKey(year, month) >= endKey) {
    options.push({
      range: { kind: 'month', year, month },
      label: formatMonthMenuLabel(year, month),
      appliedLabel: formatMonthAppliedLabel(year, month),
    });
    month -= 1;
    if (month < 1) {
      month = 12;
      year -= 1;
    }
  }

  return options;
}

function findPriorFilteredTotal(
  workoutsOldestFirst: ProgressWorkout[],
  dimension: HistoryDimension,
  beforeDate: string,
  activeExerciseIds: ReadonlySet<string> | readonly string[],
): number | null {
  let prior: number | null = null;

  for (const workout of workoutsOldestFirst) {
    if (workout.date >= beforeDate) {
      break;
    }

    const value = getFilteredSessionValue(
      workout,
      dimension,
      activeExerciseIds,
    );
    if (value <= 0) {
      continue;
    }

    // Exercise dimension: only sessions that include that exercise (BR8/BR11).
    if (dimension.kind === 'exercise') {
      const logged = filterWorkoutByPlan(
        workout,
        activeExerciseIds,
      ).loggedExercises.find((entry) => entry.exerciseId === dimension.exerciseId);
      if (!logged || !hasStandardSetsForExercise(logged.sets)) {
        continue;
      }
    } else if (dimension.kind === 'session') {
      if (!hasStandardSets(filterWorkoutByPlan(workout, activeExerciseIds))) {
        continue;
      }
    } else if (dimension.kind === 'muscle') {
      if (value <= 0) {
        continue;
      }
    }

    prior = value;
  }

  return prior;
}

/**
 * Day % for a filtered dimension. Session mode averages per-exercise % (BR9).
 * Exercise/muscle modes compare the filtered total to the prior matching session.
 */
export function getFilteredDayPercent(
  workoutsOldestFirst: ProgressWorkout[],
  workout: ProgressWorkout,
  dimension: HistoryDimension,
  activeExerciseIds: ReadonlySet<string> | readonly string[],
): number | null {
  switch (dimension.kind) {
    case 'session': {
      // Caller must pass plan-filtered workouts (see buildHistoryListRows).
      const scoped = filterWorkoutByPlan(workout, activeExerciseIds);
      const percents: Array<number | null> = [];
      for (const logged of scoped.loggedExercises) {
        if (!hasStandardSetsForExercise(logged.sets)) {
          continue;
        }
        const current = getExerciseTotalWeightMoved(logged.sets);
        const prior = findPriorExerciseTotal(
          workoutsOldestFirst,
          logged.exerciseId,
          workout.date,
        );
        percents.push(
          prior == null ? null : getExercisePercentChange(current, prior),
        );
      }
      const valid = percents.filter((value): value is number => value != null);
      if (valid.length === 0) {
        return null;
      }
      return valid.reduce((sum, value) => sum + value, 0) / valid.length;
    }
    case 'exercise':
    case 'muscle': {
      const current = getFilteredSessionValue(
        workout,
        dimension,
        activeExerciseIds,
      );
      if (current <= 0) {
        return null;
      }
      const prior = findPriorFilteredTotal(
        workoutsOldestFirst,
        dimension,
        workout.date,
        activeExerciseIds,
      );
      if (prior == null) {
        return null;
      }
      return getExercisePercentChange(current, prior);
    }
    default: {
      const _exhaustive: never = dimension;
      return _exhaustive;
    }
  }
}

/**
 * Chart series: one point per session with positive filtered value, oldest→newest.
 * Plan filter applied (BR2/BR3). Range applied.
 */
export function buildChartSeries(
  workouts: ProgressWorkout[],
  filter: HistoryFilter,
  activeExerciseIds: ReadonlySet<string> | readonly string[],
): ChartPoint[] {
  const inRange = filterWorkoutsByRange(workouts, filter.range);
  const oldestFirst = sortOldestFirst(
    inRange.map((workout) => filterWorkoutByPlan(workout, activeExerciseIds)),
  );

  const points: ChartPoint[] = [];
  for (const workout of oldestFirst) {
    if (!hasStandardSets(workout) && filter.dimension.kind === 'session') {
      continue;
    }
    const value = getFilteredSessionValue(
      workout,
      filter.dimension,
      activeExerciseIds,
    );
    if (value <= 0) {
      continue;
    }
    points.push({ date: workout.date, value });
  }
  return points;
}

/** Best-record check scoped to the filtered dimension totals. */
export function isFilteredSessionBestRecord(
  workouts: ProgressWorkout[],
  sessionDate: string,
  dimension: HistoryDimension,
  activeExerciseIds: ReadonlySet<string> | readonly string[],
): boolean {
  if (dimension.kind === 'session') {
    // Preserve existing all-exercise-set best-record semantics via caller.
    return false;
  }

  const scoped = workouts.map((workout) =>
    filterWorkoutByPlan(workout, activeExerciseIds),
  );
  const session = scoped.find((workout) => workout.date === sessionDate);
  if (!session) {
    return false;
  }

  const current = getFilteredSessionValue(session, dimension, activeExerciseIds);
  if (current <= 0) {
    return false;
  }

  let hasComparable = false;
  let maxOther = 0;
  for (const workout of scoped) {
    if (workout.date === sessionDate) {
      continue;
    }
    const other = getFilteredSessionValue(workout, dimension, activeExerciseIds);
    if (other <= 0) {
      continue;
    }
    hasComparable = true;
    if (other > maxOther) {
      maxOther = other;
    }
  }

  if (!hasComparable) {
    return false;
  }
  return current >= maxOther;
}

/** Range end date for calendar gap fill (inclusive). */
export function getRangeThroughDate(
  range: HistoryRange,
  fallbackThroughDate: string,
): string {
  switch (range.kind) {
    case 'all':
      return fallbackThroughDate;
    case 'year': {
      const end = `${range.year}-12-31`;
      return end < fallbackThroughDate ? end : fallbackThroughDate;
    }
    case 'month': {
      const lastDay = new Date(range.year, range.month, 0).getDate();
      const end = `${range.year}-${String(range.month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      return end < fallbackThroughDate ? end : fallbackThroughDate;
    }
    default: {
      const _exhaustive: never = range;
      return _exhaustive;
    }
  }
}

/** Range start date for calendar gap fill, or null for all-time. */
export function getRangeStartDate(range: HistoryRange): string | null {
  switch (range.kind) {
    case 'all':
      return null;
    case 'year':
      return `${range.year}-01-01`;
    case 'month':
      return `${range.year}-${String(range.month).padStart(2, '0')}-01`;
    default: {
      const _exhaustive: never = range;
      return _exhaustive;
    }
  }
}

export function hasFilteredVolume(
  workout: ProgressWorkout,
  dimension: HistoryDimension,
  activeExerciseIds: ReadonlySet<string> | readonly string[],
): boolean {
  return getFilteredSessionValue(workout, dimension, activeExerciseIds) > 0;
}

function getLocalCalendarFallback(workouts: ProgressWorkout[]): string {
  let newest = '';
  for (const workout of workouts) {
    if (workout.date > newest) {
      newest = workout.date;
    }
  }
  return newest || '1970-01-01';
}

/**
 * History list rows newest-first: day total + day % (or null/0 → "–"),
 * with rest rows for missing calendar days through `throughDate`.
 * BR7, BR9, BR10, BR11. Plan filter applied (BR3).
 * Optional `filter` scopes range + dimension (U5 shared filters).
 */
export function buildHistoryListRows(
  workouts: ProgressWorkout[],
  activeExerciseIds: ReadonlySet<string> | readonly string[],
  throughDate?: string,
  filter: HistoryFilter = DEFAULT_HISTORY_FILTER,
): HistoryListRow[] {
  const fallbackThrough = throughDate ?? getLocalCalendarFallback(workouts);
  const rangeThrough = getRangeThroughDate(filter.range, fallbackThrough);
  const rangeStart = getRangeStartDate(filter.range);

  const inRange = filterWorkoutsByRange(workouts, filter.range);
  const oldestFirst = sortOldestFirst(
    inRange.map((workout) => filterWorkoutByPlan(workout, activeExerciseIds)),
  );

  // Priors for % change must look at the full plan-filtered history (not just
  // the selected range), so month/year views still compare correctly.
  const allOldestFirst = sortOldestFirst(
    workouts.map((workout) => filterWorkoutByPlan(workout, activeExerciseIds)),
  );

  const rows: HistoryListRow[] = [];

  for (const workout of oldestFirst) {
    const hasVolume = hasFilteredVolume(
      workout,
      filter.dimension,
      activeExerciseIds,
    );

    // Warm-up-only / zero filtered volume → rest-style (gap fill also covers
    // true empty calendar days).
    if (!hasVolume) {
      continue;
    }

    const totalKg = getFilteredSessionValue(
      workout,
      filter.dimension,
      activeExerciseIds,
    );
    const dayPercent = getFilteredDayPercent(
      allOldestFirst,
      workout,
      filter.dimension,
      activeExerciseIds,
    );

    const isBestRecord =
      filter.dimension.kind === 'session'
        ? isSessionBestRecord(allOldestFirst, workout.date)
        : isFilteredSessionBestRecord(
            allOldestFirst,
            workout.date,
            filter.dimension,
            activeExerciseIds,
          );

    rows.push({
      date: workout.date,
      totalKg,
      dayPercent,
      isBestRecord,
      isRest: false,
    });
  }

  const filled = fillHistoryCalendarGaps(rows.reverse(), rangeThrough);
  if (rangeStart == null) {
    return filled;
  }
  return filled.filter((row) => row.date >= rangeStart);
}
