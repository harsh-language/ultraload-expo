import type { DisplayUnit } from '../data/exercise-catalogue';
import { isKnownExercise } from './catalogue';
import {
  EXPORT_SCHEMA_VERSION,
  type ExportLoggedExercise,
  type ExportProfile,
  type ExportSet,
  type ExportSnapshot,
  type ExportWorkout,
} from './exportSchema';

export type ImportFailureReason =
  | 'malformed_json'
  | 'invalid_shape'
  | 'unsupported_schema'
  | 'unknown_exercise'
  | 'duplicate_workout_date';

export type ImportValidationResult =
  | { ok: true; snapshot: ExportSnapshot }
  | { ok: false; reason: ImportFailureReason; detail?: string };

const DISPLAY_UNITS = new Set<DisplayUnit>(['kg', 'lbs', 'stone']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || typeof value === 'number';
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function parseProfile(value: unknown): ExportProfile | null {
  if (!isRecord(value)) {
    return null;
  }

  const {
    bodyweight,
    name,
    height,
    age,
    units,
    warmUpPercent,
    warmUpAutoTagEnabled,
    restTimerSeconds,
  } = value;

  if (
    !isNullableNumber(bodyweight) ||
    !isNullableString(name) ||
    !isNullableNumber(height) ||
    !isNullableNumber(age) ||
    typeof units !== 'string' ||
    !DISPLAY_UNITS.has(units as DisplayUnit) ||
    typeof warmUpPercent !== 'number' ||
    typeof warmUpAutoTagEnabled !== 'boolean' ||
    typeof restTimerSeconds !== 'number'
  ) {
    return null;
  }

  return {
    bodyweight,
    name,
    height,
    age,
    units: units as DisplayUnit,
    warmUpPercent,
    warmUpAutoTagEnabled,
    restTimerSeconds,
  };
}

function parseSet(value: unknown): ExportSet | null {
  if (!isRecord(value)) {
    return null;
  }

  const { weight, reps, warmUp, timestamp, order } = value;
  if (
    typeof weight !== 'number' ||
    typeof reps !== 'number' ||
    typeof warmUp !== 'boolean' ||
    typeof timestamp !== 'string' ||
    typeof order !== 'number'
  ) {
    return null;
  }

  return { weight, reps, warmUp, timestamp, order };
}

function parseLoggedExercise(value: unknown): ExportLoggedExercise | null {
  if (!isRecord(value)) {
    return null;
  }

  const { exerciseId, order, sets } = value;
  if (
    typeof exerciseId !== 'string' ||
    typeof order !== 'number' ||
    !Array.isArray(sets)
  ) {
    return null;
  }

  const parsedSets: ExportSet[] = [];
  for (const set of sets) {
    const parsed = parseSet(set);
    if (parsed == null) {
      return null;
    }
    parsedSets.push(parsed);
  }

  return { exerciseId, order, sets: parsedSets };
}

function parseWorkout(value: unknown): ExportWorkout | null {
  if (!isRecord(value)) {
    return null;
  }

  const { date, loggedExercises } = value;
  if (typeof date !== 'string' || !Array.isArray(loggedExercises)) {
    return null;
  }

  const parsedLogged: ExportLoggedExercise[] = [];
  for (const logged of loggedExercises) {
    const parsed = parseLoggedExercise(logged);
    if (parsed == null) {
      return null;
    }
    parsedLogged.push(parsed);
  }

  return { date, loggedExercises: parsedLogged };
}

function collectExerciseIds(snapshot: {
  workoutPlan: string[];
  workouts: ExportWorkout[];
}): string[] {
  const ids = new Set<string>(snapshot.workoutPlan);
  for (const workout of snapshot.workouts) {
    for (const logged of workout.loggedExercises) {
      ids.add(logged.exerciseId);
    }
  }
  return [...ids];
}

/** Validate a parsed JSON value against blueprint §18 / FL10. */
export function validateExportSnapshot(
  value: unknown,
): ImportValidationResult {
  if (!isRecord(value)) {
    return { ok: false, reason: 'invalid_shape' };
  }

  const {
    schemaVersion,
    appVersion,
    exportedAt,
    profile,
    workoutPlan,
    workouts,
  } = value;

  if (schemaVersion !== EXPORT_SCHEMA_VERSION) {
    return {
      ok: false,
      reason:
        typeof schemaVersion === 'number'
          ? 'unsupported_schema'
          : 'invalid_shape',
      detail:
        typeof schemaVersion === 'number'
          ? `schemaVersion ${schemaVersion}`
          : undefined,
    };
  }

  if (typeof appVersion !== 'string' || typeof exportedAt !== 'string') {
    return { ok: false, reason: 'invalid_shape' };
  }

  const parsedProfile = parseProfile(profile);
  if (parsedProfile == null) {
    return { ok: false, reason: 'invalid_shape', detail: 'profile' };
  }

  if (
    !Array.isArray(workoutPlan) ||
    !workoutPlan.every((id) => typeof id === 'string')
  ) {
    return { ok: false, reason: 'invalid_shape', detail: 'workoutPlan' };
  }

  if (!Array.isArray(workouts)) {
    return { ok: false, reason: 'invalid_shape', detail: 'workouts' };
  }

  const parsedWorkouts: ExportWorkout[] = [];
  const seenDates = new Set<string>();
  for (const workout of workouts) {
    const parsed = parseWorkout(workout);
    if (parsed == null) {
      return { ok: false, reason: 'invalid_shape', detail: 'workout' };
    }
    if (seenDates.has(parsed.date)) {
      return {
        ok: false,
        reason: 'duplicate_workout_date',
        detail: parsed.date,
      };
    }
    seenDates.add(parsed.date);
    parsedWorkouts.push(parsed);
  }

  const snapshot: ExportSnapshot = {
    schemaVersion: EXPORT_SCHEMA_VERSION,
    appVersion,
    exportedAt,
    profile: parsedProfile,
    workoutPlan: [...workoutPlan],
    workouts: parsedWorkouts,
  };

  for (const exerciseId of collectExerciseIds(snapshot)) {
    if (!isKnownExercise(exerciseId)) {
      return {
        ok: false,
        reason: 'unknown_exercise',
        detail: exerciseId,
      };
    }
  }

  return { ok: true, snapshot };
}

/** Parse raw file text then validate. Leaves caller data untouched on failure. */
export function parseAndValidateExportJson(
  text: string,
): ImportValidationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    return { ok: false, reason: 'malformed_json' };
  }

  return validateExportSnapshot(parsed);
}

export function importFailureMessage(
  reason: ImportFailureReason,
  detail?: string,
): string {
  switch (reason) {
    case 'malformed_json':
      return 'file is not valid json.';
    case 'invalid_shape':
      return 'file is missing required fields.';
    case 'unsupported_schema':
      return detail
        ? `unsupported schema version (${detail}).`
        : 'unsupported schema version.';
    case 'unknown_exercise':
      return detail
        ? `unknown exercise id: ${detail}.`
        : 'file references an unknown exercise.';
    case 'duplicate_workout_date':
      return detail
        ? `duplicate workout date: ${detail}.`
        : 'file has duplicate workout dates.';
    default: {
      const _exhaustive: never = reason;
      return _exhaustive;
    }
  }
}
