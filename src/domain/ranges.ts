import type { ExerciseCatalogueEntry, SliderRange } from '../data/exercise-catalogue';
import type { PerExerciseOverride } from '../db/schema';

/** Slider bounds in kg (catalogue default or per-exercise override). */
export function getExerciseSliderRange(
  exercise: ExerciseCatalogueEntry,
  override?: PerExerciseOverride | null,
): SliderRange {
  if (override?.sliderRange) {
    return override.sliderRange;
  }

  return exercise.sliderRange;
}

/** Increment in kg (catalogue default or per-exercise override). */
export function getExerciseIncrement(
  exercise: ExerciseCatalogueEntry,
  override?: PerExerciseOverride | null,
): number {
  return override?.increment ?? exercise.increment;
}
