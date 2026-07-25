import type { ExerciseCatalogueEntry, SliderRange } from '../data/exercise-catalogue';

/** Slider bounds in kg from the exercise catalogue. */
export function getExerciseSliderRange(
  exercise: ExerciseCatalogueEntry,
): SliderRange {
  return exercise.sliderRange;
}

/** Increment in kg from the exercise catalogue. */
export function getExerciseIncrement(
  exercise: ExerciseCatalogueEntry,
): number {
  return exercise.increment;
}
