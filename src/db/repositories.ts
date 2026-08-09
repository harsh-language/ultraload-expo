import { eq } from 'drizzle-orm';
import type { AppDatabase, DbOrTransaction } from './client';
import {
  loggedExercises,
  profile,
  sets,
  workoutPlan,
  workouts,
  type Profile,
} from './schema';
import type { DisplayUnit } from '../data/exercise-catalogue';

export interface ProfileState {
  bodyweight: number | null;
  name: string | null;
  height: number | null;
  age: number | null;
  units: DisplayUnit;
  warmUpPercent: number;
  warmUpAutoTagEnabled: boolean;
  restTimerSeconds: number;
  onboardingComplete: boolean;
}

export interface PlanState {
  exerciseIds: string[];
}

export const DEFAULT_PROFILE: ProfileState = {
  bodyweight: null,
  name: null,
  height: null,
  age: null,
  units: 'kg',
  warmUpPercent: 50,
  warmUpAutoTagEnabled: true,
  restTimerSeconds: 180,
  onboardingComplete: false,
};

export const DEFAULT_PLAN: PlanState = {
  exerciseIds: [],
};

export async function loadProfile(db: AppDatabase): Promise<ProfileState> {
  const rows = await db.select().from(profile).where(eq(profile.id, 1)).limit(1);
  const row = rows[0];
  if (!row) {
    return DEFAULT_PROFILE;
  }
  return mapProfileRow(row);
}

export async function saveProfile(
  db: DbOrTransaction,
  next: ProfileState,
): Promise<void> {
  await db
    .insert(profile)
    .values({
      id: 1,
      bodyweight: next.bodyweight,
      name: next.name,
      height: next.height,
      age: next.age,
      units: next.units,
      warmUpPercent: next.warmUpPercent,
      warmUpAutoTagEnabled: next.warmUpAutoTagEnabled,
      restTimerSeconds: next.restTimerSeconds,
      onboardingComplete: next.onboardingComplete,
    })
    .onConflictDoUpdate({
      target: profile.id,
      set: {
        bodyweight: next.bodyweight,
        name: next.name,
        height: next.height,
        age: next.age,
        units: next.units,
        warmUpPercent: next.warmUpPercent,
        warmUpAutoTagEnabled: next.warmUpAutoTagEnabled,
        restTimerSeconds: next.restTimerSeconds,
        onboardingComplete: next.onboardingComplete,
      },
    });
}

export async function loadPlan(db: AppDatabase): Promise<PlanState> {
  const rows = await db.select().from(workoutPlan).where(eq(workoutPlan.id, 1)).limit(1);
  const row = rows[0];
  if (!row) {
    return DEFAULT_PLAN;
  }
  return { exerciseIds: row.exerciseIds ?? [] };
}

export async function savePlan(db: DbOrTransaction, next: PlanState): Promise<void> {
  await db
    .insert(workoutPlan)
    .values({ id: 1, exerciseIds: next.exerciseIds })
    .onConflictDoUpdate({
      target: workoutPlan.id,
      set: { exerciseIds: next.exerciseIds },
    });
}

function mapProfileRow(row: Profile): ProfileState {
  return {
    bodyweight: row.bodyweight,
    name: row.name,
    height: row.height,
    age: row.age,
    units: row.units,
    warmUpPercent: row.warmUpPercent,
    warmUpAutoTagEnabled: row.warmUpAutoTagEnabled,
    restTimerSeconds: row.restTimerSeconds,
    onboardingComplete: row.onboardingComplete,
  };
}

export async function ensurePersistedRows(db: AppDatabase): Promise<void> {
  const existingProfile = await db
    .select({ id: profile.id })
    .from(profile)
    .where(eq(profile.id, 1))
    .limit(1);

  if (existingProfile.length === 0) {
    await saveProfile(db, DEFAULT_PROFILE);
  }

  const existingPlan = await db
    .select({ id: workoutPlan.id })
    .from(workoutPlan)
    .where(eq(workoutPlan.id, 1))
    .limit(1);

  if (existingPlan.length === 0) {
    await savePlan(db, DEFAULT_PLAN);
  }
}

/** Dev-only — wipe all user data. Callers re-seed demo workouts after. */
export async function resetAllUserData(db: AppDatabase): Promise<void> {
  await db.transaction(async (tx) => {
    // Delete children first so a connection without FK still wipes fully.
    await tx.delete(sets);
    await tx.delete(loggedExercises);
    await tx.delete(workouts);
    await saveProfile(tx, DEFAULT_PROFILE);
    await savePlan(tx, DEFAULT_PLAN);
  });
}
