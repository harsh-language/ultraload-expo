import { and, asc, desc, eq, inArray, max } from 'drizzle-orm';
import type { AppDatabase } from './client';
import { loggedExercises, sets, workouts } from './schema';
import type {
  TodayLoggedExercise,
  TodaySet,
  TodayWorkout,
} from '../stores/todaySlice';

export interface RecordSetInput {
  calendarDate: string;
  exerciseId: string;
  weight: number;
  reps: number;
  warmUp: boolean;
  timestamp?: string;
}

function mapSetRow(row: typeof sets.$inferSelect): TodaySet {
  return {
    id: row.id,
    weight: row.weight,
    reps: row.reps,
    warmUp: row.warmUp,
    order: row.order,
    timestamp: row.timestamp,
  };
}

function buildWorkoutTree(
  workout: typeof workouts.$inferSelect,
  loggedExerciseRows: (typeof loggedExercises.$inferSelect)[],
  setRows: (typeof sets.$inferSelect)[],
): TodayWorkout {
  const setsByLoggedExerciseId = new Map<number, TodaySet[]>();
  for (const row of setRows) {
    const mapped = mapSetRow(row);
    const existing = setsByLoggedExerciseId.get(row.loggedExerciseId) ?? [];
    existing.push(mapped);
    setsByLoggedExerciseId.set(row.loggedExerciseId, existing);
  }

  const loggedExercisesWithSets: TodayLoggedExercise[] = loggedExerciseRows.map(
    (loggedExercise) => ({
      id: loggedExercise.id,
      exerciseId: loggedExercise.exerciseId,
      order: loggedExercise.order,
      sets: setsByLoggedExerciseId.get(loggedExercise.id) ?? [],
    }),
  );

  return {
    id: workout.id,
    date: workout.date,
    loggedExercises: loggedExercisesWithSets,
  };
}

export async function loadWorkoutTree(
  db: AppDatabase,
  calendarDate: string,
): Promise<TodayWorkout | null> {
  const workoutRows = await db
    .select()
    .from(workouts)
    .where(eq(workouts.date, calendarDate))
    .limit(1);

  const workout = workoutRows[0];
  if (!workout) {
    return null;
  }

  const loggedExerciseRows = await db
    .select()
    .from(loggedExercises)
    .where(eq(loggedExercises.workoutId, workout.id))
    .orderBy(asc(loggedExercises.order));

  const loggedExerciseIds = loggedExerciseRows.map((row) => row.id);
  const setRows =
    loggedExerciseIds.length > 0
      ? await db
          .select()
          .from(sets)
          .where(inArray(sets.loggedExerciseId, loggedExerciseIds))
          .orderBy(asc(sets.loggedExerciseId), asc(sets.order))
      : [];

  return buildWorkoutTree(workout, loggedExerciseRows, setRows);
}

/** All workout trees, newest date first. */
export async function listWorkoutTrees(
  db: AppDatabase,
): Promise<TodayWorkout[]> {
  const workoutRows = await db
    .select()
    .from(workouts)
    .orderBy(desc(workouts.date));

  if (workoutRows.length === 0) {
    return [];
  }

  const workoutIds = workoutRows.map((row) => row.id);
  const loggedExerciseRows = await db
    .select()
    .from(loggedExercises)
    .where(inArray(loggedExercises.workoutId, workoutIds))
    .orderBy(asc(loggedExercises.workoutId), asc(loggedExercises.order));

  const loggedExerciseIds = loggedExerciseRows.map((row) => row.id);
  const setRows =
    loggedExerciseIds.length > 0
      ? await db
          .select()
          .from(sets)
          .where(inArray(sets.loggedExerciseId, loggedExerciseIds))
          .orderBy(asc(sets.loggedExerciseId), asc(sets.order))
      : [];

  const loggedByWorkoutId = new Map<
    number,
    (typeof loggedExercises.$inferSelect)[]
  >();
  for (const row of loggedExerciseRows) {
    const existing = loggedByWorkoutId.get(row.workoutId) ?? [];
    existing.push(row);
    loggedByWorkoutId.set(row.workoutId, existing);
  }

  const setsByLoggedExerciseId = new Map<number, (typeof sets.$inferSelect)[]>();
  for (const row of setRows) {
    const existing = setsByLoggedExerciseId.get(row.loggedExerciseId) ?? [];
    existing.push(row);
    setsByLoggedExerciseId.set(row.loggedExerciseId, existing);
  }

  return workoutRows.map((workout) => {
    const loggedForWorkout = loggedByWorkoutId.get(workout.id) ?? [];
    const setsForWorkout = loggedForWorkout.flatMap(
      (logged) => setsByLoggedExerciseId.get(logged.id) ?? [],
    );
    return buildWorkoutTree(workout, loggedForWorkout, setsForWorkout);
  });
}

async function ensureWorkout(
  db: AppDatabase,
  calendarDate: string,
): Promise<typeof workouts.$inferSelect> {
  const existing = await db
    .select()
    .from(workouts)
    .where(eq(workouts.date, calendarDate))
    .limit(1);

  if (existing[0]) {
    return existing[0];
  }

  const [created] = await db
    .insert(workouts)
    .values({ date: calendarDate })
    .returning();

  if (!created) {
    throw new Error('Failed to create workout record');
  }

  return created;
}

async function ensureLoggedExercise(
  db: AppDatabase,
  workoutId: number,
  exerciseId: string,
): Promise<typeof loggedExercises.$inferSelect> {
  const existing = await db
    .select()
    .from(loggedExercises)
    .where(
      and(
        eq(loggedExercises.workoutId, workoutId),
        eq(loggedExercises.exerciseId, exerciseId),
      ),
    )
    .limit(1);

  if (existing[0]) {
    return existing[0];
  }

  const orderRows = await db
    .select({ maxOrder: max(loggedExercises.order) })
    .from(loggedExercises)
    .where(eq(loggedExercises.workoutId, workoutId));

  const nextOrder = (orderRows[0]?.maxOrder ?? 0) + 1;

  const [created] = await db
    .insert(loggedExercises)
    .values({
      workoutId,
      exerciseId,
      order: nextOrder,
    })
    .returning();

  if (!created) {
    throw new Error('Failed to create logged exercise');
  }

  return created;
}

export async function recordSet(
  db: AppDatabase,
  input: RecordSetInput,
): Promise<TodayWorkout> {
  const workout = await ensureWorkout(db, input.calendarDate);
  const loggedExercise = await ensureLoggedExercise(
    db,
    workout.id,
    input.exerciseId,
  );

  const setOrderRows = await db
    .select({ maxOrder: max(sets.order) })
    .from(sets)
    .where(eq(sets.loggedExerciseId, loggedExercise.id));

  const nextSetOrder = (setOrderRows[0]?.maxOrder ?? 0) + 1;

  await db.insert(sets).values({
    loggedExerciseId: loggedExercise.id,
    weight: input.weight,
    reps: input.reps,
    warmUp: input.warmUp,
    order: nextSetOrder,
    timestamp: input.timestamp ?? new Date().toISOString(),
  });

  const tree = await loadWorkoutTree(db, input.calendarDate);
  if (!tree) {
    throw new Error('Failed to load workout after recording set');
  }

  return tree;
}

export async function loadStandardSetsForExercise(
  db: AppDatabase,
  exerciseId: string,
): Promise<{ weight: number; reps: number }[]> {
  const rows = await db
    .select({
      weight: sets.weight,
      reps: sets.reps,
    })
    .from(sets)
    .innerJoin(loggedExercises, eq(sets.loggedExerciseId, loggedExercises.id))
    .where(
      and(eq(loggedExercises.exerciseId, exerciseId), eq(sets.warmUp, false)),
    );

  return rows;
}

async function getSetWorkoutContext(
  db: AppDatabase,
  setId: number,
): Promise<{
  setId: number;
  loggedExerciseId: number;
  workoutId: number;
  calendarDate: string;
} | null> {
  const rows = await db
    .select({
      setId: sets.id,
      loggedExerciseId: sets.loggedExerciseId,
      workoutId: loggedExercises.workoutId,
      calendarDate: workouts.date,
    })
    .from(sets)
    .innerJoin(loggedExercises, eq(sets.loggedExerciseId, loggedExercises.id))
    .innerJoin(workouts, eq(loggedExercises.workoutId, workouts.id))
    .where(eq(sets.id, setId))
    .limit(1);

  return rows[0] ?? null;
}

async function getSetWorkoutDate(
  db: AppDatabase,
  setId: number,
): Promise<string | null> {
  const context = await getSetWorkoutContext(db, setId);
  return context?.calendarDate ?? null;
}

export interface UpdateSetInput {
  setId: number;
  weight: number;
  reps: number;
  warmUp: boolean;
}

export async function updateSet(
  db: AppDatabase,
  input: UpdateSetInput,
): Promise<TodayWorkout | null> {
  const calendarDate = await getSetWorkoutDate(db, input.setId);
  if (!calendarDate) {
    return null;
  }

  await db
    .update(sets)
    .set({
      weight: input.weight,
      reps: input.reps,
      warmUp: input.warmUp,
    })
    .where(eq(sets.id, input.setId));

  return loadWorkoutTree(db, calendarDate);
}

export async function deleteSet(
  db: AppDatabase,
  setId: number,
): Promise<TodayWorkout | null> {
  const context = await getSetWorkoutContext(db, setId);
  if (!context) {
    return null;
  }

  await db.delete(sets).where(eq(sets.id, setId));

  const remainingSetRows = await db
    .select({ id: sets.id })
    .from(sets)
    .where(eq(sets.loggedExerciseId, context.loggedExerciseId))
    .limit(1);

  if (!remainingSetRows[0]) {
    await db
      .delete(loggedExercises)
      .where(eq(loggedExercises.id, context.loggedExerciseId));
  }

  const remainingLoggedExerciseRows = await db
    .select({ id: loggedExercises.id })
    .from(loggedExercises)
    .where(eq(loggedExercises.workoutId, context.workoutId))
    .limit(1);

  if (!remainingLoggedExerciseRows[0]) {
    await db.delete(workouts).where(eq(workouts.id, context.workoutId));
    return null;
  }

  return loadWorkoutTree(db, context.calendarDate);
}

export async function clearWorkoutForDate(
  db: AppDatabase,
  calendarDate: string,
): Promise<void> {
  await db.delete(workouts).where(eq(workouts.date, calendarDate));
}
