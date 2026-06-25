import type { ExerciseCatalogueEntry } from '../data/exercise-catalogue';

export interface TodayWorkoutForWarmUp {
  loggedExercises: {
    exerciseId: string;
    sets: { weight: number; warmUp: boolean; order: number }[];
  }[];
}

export interface WarmUpTagInput {
  exercise: ExerciseCatalogueEntry;
  weight: number;
  bodyweight: number | null;
  warmUpAutoTagEnabled: boolean;
  warmUpPercent: number;
  referenceWeight: number | null;
}

/** U1 interim — last standard set weight for an exercise logged today. */
export function getLastStandardSetWeightToday(
  workout: TodayWorkoutForWarmUp | null,
  exerciseId: string,
): number | null {
  if (!workout) {
    return null;
  }

  const loggedExercise = workout.loggedExercises.find(
    (entry) => entry.exerciseId === exerciseId,
  );
  if (!loggedExercise) {
    return null;
  }

  const standardSets = loggedExercise.sets
    .filter((set) => !set.warmUp)
    .sort((a, b) => a.order - b.order);

  const lastStandardSet = standardSets.at(-1);
  return lastStandardSet?.weight ?? null;
}

export function getWarmUpThreshold(
  warmUpPercent: number,
  referenceWeight: number | null,
): number | null {
  if (referenceWeight == null) {
    return null;
  }

  return (warmUpPercent / 100) * referenceWeight;
}

/** BR4 / BR26 — auto-tag when global warm-up tagging is enabled. */
export function shouldAutoTagWarmUp({
  exercise,
  weight,
  bodyweight,
  warmUpAutoTagEnabled,
  warmUpPercent,
  referenceWeight,
}: WarmUpTagInput): boolean {
  if (!warmUpAutoTagEnabled) {
    return false;
  }

  if (exercise.isBodyweight) {
    if (bodyweight == null) {
      return false;
    }
    return weight <= bodyweight;
  }

  const threshold = getWarmUpThreshold(warmUpPercent, referenceWeight);
  if (threshold == null) {
    return false;
  }

  return weight <= threshold;
}
