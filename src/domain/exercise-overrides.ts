import type { ExerciseCatalogueEntry } from '../data/exercise-catalogue';
import type { PerExerciseOverride } from '../db/schema';

/** BR16 — per-exercise increment override limited to 1 / 2.5 / 5 kg. */
export const OVERRIDE_INCREMENT_OPTIONS = [1, 2.5, 5] as const;

export type OverrideIncrementOption =
  (typeof OVERRIDE_INCREMENT_OPTIONS)[number];

export function isOverrideIncrementOption(
  value: number,
): value is OverrideIncrementOption {
  return (OVERRIDE_INCREMENT_OPTIONS as readonly number[]).includes(value);
}

export function emptyOverride(): PerExerciseOverride {
  return {
    warmUpPercent: null,
    sliderRange: null,
    increment: null,
  };
}

export function isOverrideActive(override: PerExerciseOverride | undefined): boolean {
  if (override == null) {
    return false;
  }
  return (
    override.warmUpPercent != null ||
    override.sliderRange != null ||
    override.increment != null
  );
}

/**
 * When every non-bodyweight exercise shares the same non-null increment
 * override, return that value — otherwise null (common increment off).
 */
export function getCommonIncrementOverride(
  overrides: Record<string, PerExerciseOverride>,
  exercises: readonly ExerciseCatalogueEntry[],
): number | null {
  const nonBodyweight = exercises.filter((exercise) => !exercise.isBodyweight);
  if (nonBodyweight.length === 0) {
    return null;
  }

  const increments = nonBodyweight.map(
    (exercise) => overrides[exercise.id]?.increment ?? null,
  );
  if (increments.some((increment) => increment == null)) {
    return null;
  }

  const first = increments[0]!;
  return increments.every((increment) => increment === first) ? first : null;
}

export function applyCommonIncrement(
  overrides: Record<string, PerExerciseOverride>,
  exercises: readonly ExerciseCatalogueEntry[],
  increment: number | null,
): Record<string, PerExerciseOverride> {
  const next: Record<string, PerExerciseOverride> = { ...overrides };

  for (const exercise of exercises) {
    if (exercise.isBodyweight) {
      continue;
    }

    const current = next[exercise.id] ?? emptyOverride();
    const updated: PerExerciseOverride = {
      ...current,
      increment,
    };

    if (!isOverrideActive(updated)) {
      delete next[exercise.id];
    } else {
      next[exercise.id] = updated;
    }
  }

  return next;
}

export function patchExerciseOverride(
  overrides: Record<string, PerExerciseOverride>,
  exerciseId: string,
  patch: Partial<PerExerciseOverride>,
): Record<string, PerExerciseOverride> {
  const current = overrides[exerciseId] ?? emptyOverride();
  const updated: PerExerciseOverride = {
    warmUpPercent:
      patch.warmUpPercent !== undefined
        ? patch.warmUpPercent
        : current.warmUpPercent,
    sliderRange:
      patch.sliderRange !== undefined ? patch.sliderRange : current.sliderRange,
    increment:
      patch.increment !== undefined ? patch.increment : current.increment,
  };

  const next = { ...overrides };
  if (!isOverrideActive(updated)) {
    delete next[exerciseId];
  } else {
    next[exerciseId] = updated;
  }
  return next;
}

export function clearExerciseOverride(
  overrides: Record<string, PerExerciseOverride>,
  exerciseId: string,
): Record<string, PerExerciseOverride> {
  if (!(exerciseId in overrides)) {
    return overrides;
  }
  const next = { ...overrides };
  delete next[exerciseId];
  return next;
}
