import { eq } from 'drizzle-orm';
import type { AppDatabase } from './client';
import { workouts } from './schema';
import { recordSet } from './workoutRepository';

/** Fixed prior date so warm-up reference history is always available in DEV. */
export const DEV_BASELINE_DATE = '2026-01-01';

const DEV_BASELINE_REPS = [10, 9, 8] as const;

/** Squats left out on purpose — keep those exercises fresh for first-set testing. */
const DEV_BASELINE_EXERCISES = [
  { exerciseId: 'bench-press', weight: 80 },
  { exerciseId: 'overhead-press', weight: 45 },
  { exerciseId: 'lat-pulldown', weight: 100 },
  { exerciseId: 'rows', weight: 75 },
] as const;

/**
 * DEV-only prior-day sets for warm-up auto-tag testing.
 * Idempotent: inserts only when the baseline day is missing.
 * Survives reset — callers must not wipe this day.
 */
export async function seedDevBaselineSets(db: AppDatabase): Promise<void> {
  if (!__DEV__) {
    return;
  }

  const existing = await db
    .select({ id: workouts.id })
    .from(workouts)
    .where(eq(workouts.date, DEV_BASELINE_DATE))
    .limit(1);

  if (existing[0] != null) {
    return;
  }

  let setIndex = 0;
  for (const exercise of DEV_BASELINE_EXERCISES) {
    for (const reps of DEV_BASELINE_REPS) {
      const minute = String(setIndex).padStart(2, '0');
      await recordSet(db, {
        calendarDate: DEV_BASELINE_DATE,
        exerciseId: exercise.exerciseId,
        weight: exercise.weight,
        reps,
        warmUp: false,
        timestamp: `${DEV_BASELINE_DATE}T12:${minute}:00.000Z`,
      });
      setIndex += 1;
    }
  }
}
