import type { DisplayUnit } from '../data/exercise-catalogue';
import { getUnitLabel, kgToDisplay } from './units';

export interface WorkoutForSessionTotal {
  loggedExercises: {
    sets: { weight: number; reps: number; warmUp: boolean }[];
  }[];
}

/** BR7 — Σ(weight × reps) across standard sets only. */
export function getSessionTotalWeightMoved(
  workout: WorkoutForSessionTotal | null,
): number {
  if (!workout) {
    return 0;
  }

  let total = 0;

  for (const loggedExercise of workout.loggedExercises) {
    for (const set of loggedExercise.sets) {
      if (!set.warmUp) {
        total += set.weight * set.reps;
      }
    }
  }

  return total;
}

export function hasStandardSets(workout: WorkoutForSessionTotal | null): boolean {
  if (!workout) {
    return false;
  }

  return workout.loggedExercises.some((loggedExercise) =>
    loggedExercise.sets.some((set) => !set.warmUp),
  );
}

/** Session total label in the profile display unit (BR17). */
export function formatSessionTotalWeightLabel(
  totalKg: number,
  unit: DisplayUnit = 'kg',
): string {
  const display = kgToDisplay(totalKg, unit);
  const grouped = display.toLocaleString('en-GB', {
    minimumFractionDigits: Number.isInteger(display) ? 0 : 1,
    maximumFractionDigits: 1,
  });
  return `${grouped} ${getUnitLabel(unit)}`;
}
