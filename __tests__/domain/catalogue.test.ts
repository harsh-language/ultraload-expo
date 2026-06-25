import {
  getAllExercises,
  getExerciseById,
  getExerciseLabel,
  getOrphanFallbackLabel,
  getSelectableExercises,
  isKnownExercise,
} from '../../src/domain/catalogue';
import { EXERCISE_CATALOGUE } from '../../src/data/exercise-catalogue';

describe('catalogue domain', () => {
  it('looks up exercises by id', () => {
    const bench = getExerciseById('bench-press');
    expect(bench?.name).toBe('bench press');
    expect(getExerciseLabel('bench-press')).toBe('bench press');
  });

  it('excludes deprecated exercises from selectable list (T25 partial)', () => {
    const originalLength = getSelectableExercises().length;
    expect(originalLength).toBe(EXERCISE_CATALOGUE.length);

    const deprecatedEntry = EXERCISE_CATALOGUE.find(
      (entry) => entry.id === 'crossover',
    );
    expect(deprecatedEntry).toBeDefined();
    if (deprecatedEntry) {
      deprecatedEntry.deprecated = true;
    }

    const selectable = getSelectableExercises();
    expect(selectable.some((entry) => entry.id === 'crossover')).toBe(false);
    expect(selectable.length).toBe(originalLength - 1);

    if (deprecatedEntry) {
      delete deprecatedEntry.deprecated;
    }
  });

  it('returns fallback label for orphaned exercise ids (T26 partial)', () => {
    expect(isKnownExercise('missing-exercise-id')).toBe(false);
    expect(getExerciseLabel('missing-exercise-id')).toBe('unknown exercise');
    expect(getOrphanFallbackLabel('missing-exercise-id')).toBe(
      'missing-exercise-id',
    );
  });

  it('includes all 25 v1 catalogue exercises', () => {
    expect(getAllExercises()).toHaveLength(25);
  });
});
