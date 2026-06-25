import { and, asc, eq, inArray, max } from 'drizzle-orm';
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

export async function clearWorkoutForDate(
  db: AppDatabase,
  calendarDate: string,
): Promise<void> {
  await db.delete(workouts).where(eq(workouts.date, calendarDate));
}
