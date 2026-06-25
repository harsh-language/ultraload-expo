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

export function formatSessionTotalWeightLabel(totalKg: number): string {
  const rounded = Math.round(totalKg);
  return `${rounded.toLocaleString('en-GB')} kg`;
}
