/** Non-warmup sets for one exercise in today's workout (order preserved). */
export function getStandardSetsForExerciseToday<T extends { warmUp: boolean }>(
  workout: {
    loggedExercises: {
      exerciseId: string;
      sets: T[];
    }[];
  } | null,
  exerciseId: string,
): T[] {
  const loggedExercise = workout?.loggedExercises.find(
    (entry) => entry.exerciseId === exerciseId,
  );

  if (!loggedExercise) {
    return [];
  }

  return loggedExercise.sets.filter((set) => !set.warmUp);
}
