/** BR21 — last logged set for an exercise today (warm-up or standard). */
export function getLastSetToday(
  workout: {
    loggedExercises: {
      exerciseId: string;
      sets: { weight: number; reps: number; order: number }[];
    }[];
  } | null,
  exerciseId: string,
): { weight: number; reps: number } | null {
  const loggedExercise = workout?.loggedExercises.find(
    (entry) => entry.exerciseId === exerciseId,
  );

  if (!loggedExercise || loggedExercise.sets.length === 0) {
    return null;
  }

  const lastSet = [...loggedExercise.sets].sort((a, b) => a.order - b.order).at(-1);
  if (!lastSet) {
    return null;
  }

  return { weight: lastSet.weight, reps: lastSet.reps };
}
