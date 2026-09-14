import type { ProfileState } from '../db/repositories';
import type { TodayWorkout } from '../stores/todaySlice';
import {
  EXPORT_SCHEMA_VERSION,
  type ExportLoggedExercise,
  type ExportProfile,
  type ExportSnapshot,
  type ExportWorkout,
} from './exportSchema';

export interface ExportSource {
  profile: ProfileState;
  workoutPlan: string[];
  workouts: TodayWorkout[];
  appVersion: string;
  exportedAt?: string;
}

function toExportProfile(profile: ProfileState): ExportProfile {
  return {
    bodyweight: profile.bodyweight,
    name: profile.name,
    height: profile.height,
    age: profile.age,
    units: profile.units,
    warmUpPercent: profile.warmUpPercent,
    warmUpAutoTagEnabled: profile.warmUpAutoTagEnabled,
    restTimerSeconds: profile.restTimerSeconds,
  };
}

function toExportWorkout(workout: TodayWorkout): ExportWorkout {
  const loggedExercises: ExportLoggedExercise[] = [...workout.loggedExercises]
    .sort((a, b) => a.order - b.order)
    .map((logged) => ({
      exerciseId: logged.exerciseId,
      order: logged.order,
      sets: [...logged.sets]
        .sort((a, b) => a.order - b.order)
        .map((set) => ({
          weight: set.weight,
          reps: set.reps,
          warmUp: set.warmUp,
          timestamp: set.timestamp,
          order: set.order,
        })),
    }));

  return {
    date: workout.date,
    loggedExercises,
  };
}

/** Build the blueprint §18 snapshot from hydrated SQLite-backed state. */
export function buildExportSnapshot(source: ExportSource): ExportSnapshot {
  const workouts = [...source.workouts]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(toExportWorkout);

  return {
    schemaVersion: EXPORT_SCHEMA_VERSION,
    appVersion: source.appVersion,
    exportedAt: source.exportedAt ?? new Date().toISOString(),
    profile: toExportProfile(source.profile),
    workoutPlan: [...source.workoutPlan],
    workouts,
  };
}

export function serializeExportSnapshot(snapshot: ExportSnapshot): string {
  return `${JSON.stringify(snapshot, null, 2)}\n`;
}
