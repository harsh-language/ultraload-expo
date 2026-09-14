import type { AppDatabase } from './client';
import {
  loadPlan,
  loadProfile,
  resetAllUserData,
  savePlan,
  saveProfile,
} from './repositories';
import { listWorkoutTrees } from './workoutRepository';
import { buildExportSnapshot } from '../domain/export';
import type { ExportSnapshot } from '../domain/exportSchema';
import { loggedExercises, sets, workouts } from './schema';

const DEFAULT_APP_VERSION = '1.0.0';

export async function buildExportSnapshotFromDb(
  db: AppDatabase,
  options?: { appVersion?: string; exportedAt?: string },
): Promise<ExportSnapshot> {
  const [profile, plan, workoutTrees] = await Promise.all([
    loadProfile(db),
    loadPlan(db),
    listWorkoutTrees(db),
  ]);

  return buildExportSnapshot({
    profile,
    workoutPlan: plan.exerciseIds,
    workouts: workoutTrees,
    appVersion: options?.appVersion ?? DEFAULT_APP_VERSION,
    exportedAt: options?.exportedAt,
  });
}

/**
 * Full replace from a validated snapshot (FL10).
 * Runs in one transaction so failures leave existing data unchanged.
 */
export async function replaceAllFromSnapshot(
  db: AppDatabase,
  snapshot: ExportSnapshot,
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(sets);
    await tx.delete(loggedExercises);
    await tx.delete(workouts);

    await saveProfile(tx, {
      ...snapshot.profile,
      onboardingComplete: true,
    });
    await savePlan(tx, { exerciseIds: snapshot.workoutPlan });

    for (const workout of snapshot.workouts) {
      const [createdWorkout] = await tx
        .insert(workouts)
        .values({ date: workout.date })
        .returning();

      if (!createdWorkout) {
        throw new Error('Failed to restore workout');
      }

      for (const logged of [...workout.loggedExercises].sort(
        (a, b) => a.order - b.order,
      )) {
        const [createdLogged] = await tx
          .insert(loggedExercises)
          .values({
            workoutId: createdWorkout.id,
            exerciseId: logged.exerciseId,
            order: logged.order,
          })
          .returning();

        if (!createdLogged) {
          throw new Error('Failed to restore logged exercise');
        }

        for (const set of [...logged.sets].sort((a, b) => a.order - b.order)) {
          await tx.insert(sets).values({
            loggedExerciseId: createdLogged.id,
            weight: set.weight,
            reps: set.reps,
            warmUp: set.warmUp,
            order: set.order,
            timestamp: set.timestamp,
          });
        }
      }
    }
  });
}

/** Shipping Settings reset (SCR17 / BR24) — wipe only; no demo reseed. */
export async function resetUserDataForOnboarding(
  db: AppDatabase,
): Promise<void> {
  await resetAllUserData(db);
}
