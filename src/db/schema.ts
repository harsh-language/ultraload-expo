import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import type { DisplayUnit } from '../data/exercise-catalogue';

export const profile = sqliteTable('profile', {
  id: integer('id').primaryKey().default(1),
  bodyweight: real('bodyweight'),
  name: text('name'),
  height: real('height'),
  age: integer('age'),
  units: text('units').$type<DisplayUnit>().notNull().default('kg'),
  warmUpPercent: integer('warm_up_percent').notNull().default(50),
  warmUpAutoTagEnabled: integer('warm_up_auto_tag_enabled', { mode: 'boolean' })
    .notNull()
    .default(true),
  restTimerSeconds: integer('rest_timer_seconds').notNull().default(180),
  onboardingComplete: integer('onboarding_complete', { mode: 'boolean' })
    .notNull()
    .default(false),
});

export const workoutPlan = sqliteTable('workout_plan', {
  id: integer('id').primaryKey().default(1),
  exerciseIds: text('exercise_ids', { mode: 'json' })
    .$type<string[]>()
    .notNull()
    .default([]),
});

export interface PerExerciseOverride {
  warmUpPercent: number | null;
  sliderRange: { min: number; max: number } | null;
  increment: number | null;
}

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey().default(1),
  perExerciseOverrides: text('per_exercise_overrides', { mode: 'json' })
    .$type<Record<string, PerExerciseOverride>>()
    .notNull()
    .default({}),
});

export const workouts = sqliteTable('workouts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull().unique(),
});

export const loggedExercises = sqliteTable('logged_exercises', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workoutId: integer('workout_id')
    .notNull()
    .references(() => workouts.id, { onDelete: 'cascade' }),
  exerciseId: text('exercise_id').notNull(),
  order: integer('order').notNull(),
});

export const sets = sqliteTable('sets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  loggedExerciseId: integer('logged_exercise_id')
    .notNull()
    .references(() => loggedExercises.id, { onDelete: 'cascade' }),
  weight: real('weight').notNull(),
  reps: integer('reps').notNull(),
  warmUp: integer('warm_up', { mode: 'boolean' }).notNull().default(false),
  order: integer('order').notNull(),
  timestamp: text('timestamp').notNull(),
});

export type Profile = typeof profile.$inferSelect;
export type WorkoutPlan = typeof workoutPlan.$inferSelect;
export type Settings = typeof settings.$inferSelect;
export type Workout = typeof workouts.$inferSelect;
export type LoggedExercise = typeof loggedExercises.$inferSelect;
export type Set = typeof sets.$inferSelect;
