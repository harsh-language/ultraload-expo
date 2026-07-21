import type { ExerciseCatalogueEntry, SliderRange } from '../data/exercise-catalogue';
import type { PerExerciseOverride } from '../db/schema';

/** BR18 — bodyweight-exercise slider bounds recompute with profile bodyweight. */
export function getBodyweightExerciseRange(bodyweight: number): SliderRange {
  return {
    min: bodyweight * 0.5,
    max: bodyweight * 2,
  };
}

/**
 * Slider bounds in kg. Bodyweight (◊) exercises ignore overrides (BR18/BR29).
 */
export function getExerciseSliderRange(
  exercise: ExerciseCatalogueEntry,
  bodyweight: number | null,
  override?: PerExerciseOverride | null,
): SliderRange {
  if (exercise.isBodyweight) {
    if (bodyweight == null) {
      return { min: 0, max: 100 };
    }
    return getBodyweightExerciseRange(bodyweight);
  }

  if (override?.sliderRange) {
    return override.sliderRange;
  }

  return exercise.sliderRange ?? { min: 0, max: 100 };
}

/**
 * Increment in kg. Bodyweight (◊) exercises ignore overrides (BR18/BR29).
 */
export function getExerciseIncrement(
  exercise: ExerciseCatalogueEntry,
  override?: PerExerciseOverride | null,
): number {
  if (exercise.isBodyweight) {
    return exercise.increment;
  }

  return override?.increment ?? exercise.increment;
}
