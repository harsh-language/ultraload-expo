import { getStandardSetsForExerciseToday } from './standard-sets';

/** Display index for standard sets — always two digits (`01`, `02`, …). */
export function formatSetIndex(setIndex: number): string {
  return String(setIndex).padStart(2, '0');
}

/**
 * Next standard-set number for an exercise today (warm-ups excluded).
 * First standard set of the day → 1.
 */
export function getNextStandardSetIndex(
  workout: {
    loggedExercises: {
      exerciseId: string;
      sets: { warmUp: boolean }[];
    }[];
  } | null,
  exerciseId: string,
): number {
  return getStandardSetsForExerciseToday(workout, exerciseId).length + 1;
}

/** Add Set sheet — primary CTA copy (title stays “add new set”). */
export function getAddSetRecordLabel(options: {
  warmUp: boolean;
  nextStandardSetIndex: number;
}): string {
  if (options.warmUp) {
    return 'record warmup set';
  }

  return `record set ${formatSetIndex(options.nextStandardSetIndex)}`;
}

/** Edit Set sheet — primary CTA copy. */
export function getEditSetRecordLabel(warmUp: boolean): string {
  return warmUp ? 'save warmup set' : 'save set';
}

/**
 * Add/Edit/Delete set sheet title.
 * Warm-up → `{action} warmup set`; standard → `{action} set 01`.
 */
export function getSetSheetTitle(
  action: 'edit' | 'delete',
  set: { warmUp: boolean; setIndex?: number } | null,
): string {
  if (set == null) {
    return `${action} set`;
  }

  if (set.warmUp) {
    return `${action} warmup set`;
  }

  return `${action} set ${formatSetIndex(set.setIndex ?? 1)}`;
}
