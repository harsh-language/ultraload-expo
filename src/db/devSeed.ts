import { eq, inArray } from 'drizzle-orm';
import { getLocalCalendarDate } from '../domain/day-record';
import type { AppDatabase } from './client';
import {
  DEMO_PLAN,
  DEMO_PROFILE,
  DEMO_SESSIONS,
  LAST_FIXED_DEMO_SESSION,
  buildNextDemoSession,
  getStaleDemoWorkoutDates,
} from './demoData';
import {
  clearTodayDemoDate,
  getTodayDemoDate,
  isDemoDataEnabled,
  setTodayDemoDate,
} from './devPrefs';
import {
  loadPlan,
  loadProfile,
  savePlan,
  saveProfile,
} from './repositories';
import { workouts } from './schema';
import { loadWorkoutTree, recordSet } from './workoutRepository';

/** Retired Jan 1 warm-up baseline — removed on seed so old DBs do not keep it. */
const LEGACY_BASELINE_DATE = '2026-01-01';

const DEMO_DATES = DEMO_SESSIONS.map((session) => session.date);

function formatDemoSetTimestamp(calendarDate: string, setIndex: number): string {
  const minute = String(setIndex % 60).padStart(2, '0');
  const hour = String(12 + Math.floor(setIndex / 60)).padStart(2, '0');
  return `${calendarDate}T${hour}:${minute}:00.000Z`;
}

function countSetsInTree(
  tree: Awaited<ReturnType<typeof loadWorkoutTree>>,
): number {
  if (tree == null) {
    return 0;
  }

  return tree.loggedExercises.reduce(
    (total, exercise) => total + exercise.sets.length,
    0,
  );
}

/**
 * DEV-only: remove demo session days from docs/demo-data.md
 * plus the tagged rolling today-demo day. Leaves non-demo workouts
 * and profile/plan alone.
 */
export async function clearDemoWorkouts(db: AppDatabase): Promise<void> {
  if (!__DEV__) {
    return;
  }

  await db.delete(workouts).where(inArray(workouts.date, [...DEMO_DATES]));
  await db.delete(workouts).where(eq(workouts.date, LEGACY_BASELINE_DATE));

  const todayDemoDate = getTodayDemoDate();
  if (todayDemoDate != null) {
    await db.delete(workouts).where(eq(workouts.date, todayDemoDate));
  }

  clearTodayDemoDate();
}

/**
 * DEV-only: after a full wipe + reseed, drop leftover rolling-today days
 * (e.g. Aug 3 when today is Aug 8). Keeps fixed demo sessions + today only.
 */
export async function pruneStaleDemoWorkouts(db: AppDatabase): Promise<void> {
  if (!__DEV__) {
    return;
  }

  const existing = await db.select({ date: workouts.date }).from(workouts);
  const stale = getStaleDemoWorkoutDates(
    existing.map((row) => row.date),
    getLocalCalendarDate(),
  );
  if (stale.length === 0) {
    return;
  }

  await db.delete(workouts).where(inArray(workouts.date, stale));
}

async function seedRollingToday(db: AppDatabase): Promise<void> {
  const today = getLocalCalendarDate();
  if (getTodayDemoDate() === today) {
    return;
  }

  const tree = await loadWorkoutTree(db, today);
  if (countSetsInTree(tree) > 0) {
    return;
  }

  const sets = buildNextDemoSession(LAST_FIXED_DEMO_SESSION);
  let setIndex = DEMO_SESSIONS.reduce(
    (total, session) => total + session.sets.length,
    0,
  );

  for (const set of sets) {
    await recordSet(db, {
      calendarDate: today,
      exerciseId: set.exerciseId,
      weight: set.weightKg,
      reps: set.reps,
      warmUp: set.warmUp,
      timestamp: formatDemoSetTimestamp(today, setIndex),
    });
    setIndex += 1;
  }

  setTodayDemoDate(today);
}

/**
 * DEV-only: seed workouts + metadata from docs/demo-data.md (via demoData.ts).
 * No-ops when the homepage demo-data toggle is off.
 * Workouts: inserts only missing demo session days.
 * Rolling today: injects next-from-July-24 when today is empty and not yet tagged.
 * Metadata: applies demo profile/plan when onboarding is incomplete or plan is empty.
 * Also deletes the retired Jan 1 baseline day if present.
 */
export async function seedDemoData(db: AppDatabase): Promise<void> {
  if (!__DEV__) {
    return;
  }

  if (!isDemoDataEnabled()) {
    return;
  }

  await db.delete(workouts).where(eq(workouts.date, LEGACY_BASELINE_DATE));

  const existing = await db
    .select({ date: workouts.date })
    .from(workouts)
    .where(inArray(workouts.date, [...DEMO_DATES]));

  const existingDates = new Set(existing.map((row) => row.date));

  let setIndex = 0;
  for (const session of DEMO_SESSIONS) {
    if (existingDates.has(session.date)) {
      setIndex += session.sets.length;
      continue;
    }

    for (const set of session.sets) {
      await recordSet(db, {
        calendarDate: session.date,
        exerciseId: set.exerciseId,
        weight: set.weightKg,
        reps: set.reps,
        warmUp: set.warmUp,
        timestamp: formatDemoSetTimestamp(session.date, setIndex),
      });
      setIndex += 1;
    }
  }

  await seedRollingToday(db);

  const profile = await loadProfile(db);
  if (!profile.onboardingComplete) {
    await saveProfile(db, DEMO_PROFILE);
  }

  const plan = await loadPlan(db);
  if (plan.exerciseIds.length === 0) {
    await savePlan(db, DEMO_PLAN);
  }
}
