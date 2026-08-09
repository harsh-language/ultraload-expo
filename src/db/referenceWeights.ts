import type { AppDatabase } from './client';
import { mapReferenceWeightsByExerciseId } from '../domain/warmup';
import { loadStandardSetsForExercise } from './workoutRepository';

/** Work Out and session detail share this load so warm-up auto-tag stays in sync. */
export async function loadReferenceWeightByExerciseId(
  db: AppDatabase,
  exerciseIds: string[],
): Promise<Record<string, number | null>> {
  const standardSetsByExerciseId: Record<
    string,
    { weight: number; reps: number }[]
  > = {};

  await Promise.all(
    exerciseIds.map(async (exerciseId) => {
      standardSetsByExerciseId[exerciseId] = await loadStandardSetsForExercise(
        db,
        exerciseId,
      );
    }),
  );

  return mapReferenceWeightsByExerciseId(exerciseIds, standardSetsByExerciseId);
}
