import type { ExerciseCatalogueEntry } from '../data/exercise-catalogue';

export interface TodayWorkoutForWarmUp {
  loggedExercises: {
    exerciseId: string;
    sets: { weight: number; reps: number; warmUp: boolean; order: number }[];
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

export interface StandardSetForReference {
  weight: number;
  reps: number;
}

const REFERENCE_REP_START = 6;

/** BR15 — heaviest standard-set weight at 6 reps, else 7, 8, 9, … */
export function getReferenceWeightFromHistory(
  standardSets: StandardSetForReference[],
): number | null {
  if (standardSets.length === 0) {
    return null;
  }

  const maxReps = standardSets.reduce(
    (max, set) => Math.max(max, set.reps),
    REFERENCE_REP_START,
  );

  for (let reps = REFERENCE_REP_START; reps <= maxReps; reps += 1) {
    const weightsAtRep = standardSets
      .filter((set) => set.reps === reps)
      .map((set) => set.weight);

    if (weightsAtRep.length > 0) {
      return Math.max(...weightsAtRep);
    }
  }

  return null;
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
