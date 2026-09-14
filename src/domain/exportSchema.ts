import type { DisplayUnit } from '../data/exercise-catalogue';

/** Blueprint §18 — only schemaVersion 1 is accepted on import. */
export const EXPORT_SCHEMA_VERSION = 1 as const;

export type ExportSchemaVersion = typeof EXPORT_SCHEMA_VERSION;

export interface ExportSet {
  weight: number;
  reps: number;
  warmUp: boolean;
  timestamp: string;
  order: number;
}

export interface ExportLoggedExercise {
  exerciseId: string;
  order: number;
  sets: ExportSet[];
}

export interface ExportWorkout {
  date: string;
  loggedExercises: ExportLoggedExercise[];
}

export interface ExportProfile {
  bodyweight: number | null;
  name: string | null;
  height: number | null;
  age: number | null;
  units: DisplayUnit;
  warmUpPercent: number;
  warmUpAutoTagEnabled: boolean;
  restTimerSeconds: number;
}

/**
 * Plain JSON snapshot for manual transport (FL9 / §18).
 * Weights always kg. Does not include onboardingComplete — import sets it true.
 */
export interface ExportSnapshot {
  schemaVersion: ExportSchemaVersion;
  appVersion: string;
  exportedAt: string;
  profile: ExportProfile;
  workoutPlan: string[];
  workouts: ExportWorkout[];
}
