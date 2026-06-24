import type { ExerciseCatalogueEntry } from '../data/exercise-catalogue';

export interface WarmUpTagInput {
  exercise: ExerciseCatalogueEntry;
  weight: number;
  bodyweight: number | null;
  warmUpAutoTagEnabled: boolean;
}

/** BR4 / BR26 — auto-tag when global warm-up tagging is enabled. */
export function shouldAutoTagWarmUp({
  exercise,
  weight,
  bodyweight,
  warmUpAutoTagEnabled,
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

  const threshold = exercise.warmUpThreshold;
  if (threshold == null) {
    return false;
  }

  return weight <= threshold;
}
