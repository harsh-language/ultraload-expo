import type { ExerciseCatalogueEntry } from '../../src/data/exercise-catalogue';
import type { PerExerciseOverride } from '../../src/db/schema';
import {
  OVERRIDE_INCREMENT_OPTIONS,
  applyCommonIncrement,
  clearExerciseOverride,
  emptyOverride,
  getCommonIncrementOverride,
  isOverrideActive,
  isOverrideIncrementOption,
  patchExerciseOverride,
} from '../../src/domain/exercise-overrides';

const bench: ExerciseCatalogueEntry = {
  id: 'bench-press',
  name: 'bench press',
  primaryMuscle: 'Chest',
  type: 'Compound',
  sliderRange: { min: 30, max: 150 },
  increment: 5,
  muscleMultipliers: [{ muscle: 'Chest', multiplier: 1 }],
};

const row: ExerciseCatalogueEntry = {
  id: 'row',
  name: 'row',
  primaryMuscle: 'Back',
  type: 'Compound',
  sliderRange: { min: 20, max: 120 },
  increment: 5,
  muscleMultipliers: [{ muscle: 'Back', multiplier: 1 }],
};

describe('exercise-overrides', () => {
  it('limits override increments to 1 / 2.5 / 5 (BR16)', () => {
    expect(OVERRIDE_INCREMENT_OPTIONS).toEqual([1, 2.5, 5]);
    expect(isOverrideIncrementOption(2.5)).toBe(true);
    expect(isOverrideIncrementOption(3)).toBe(false);
  });

  it('treats null fields as inactive override', () => {
    expect(isOverrideActive(undefined)).toBe(false);
    expect(isOverrideActive(emptyOverride())).toBe(false);
    expect(
      isOverrideActive({
        warmUpPercent: 40,
        sliderRange: null,
        increment: null,
      }),
    ).toBe(true);
  });

  it('detects common increment only when every exercise matches', () => {
    const overrides: Record<string, PerExerciseOverride> = {
      'bench-press': { ...emptyOverride(), increment: 2.5 },
      row: { ...emptyOverride(), increment: 2.5 },
    };
    expect(getCommonIncrementOverride(overrides, [bench, row])).toBe(2.5);

    expect(
      getCommonIncrementOverride(
        {
          'bench-press': { ...emptyOverride(), increment: 2.5 },
          row: { ...emptyOverride(), increment: 5 },
        },
        [bench, row],
      ),
    ).toBeNull();

    expect(
      getCommonIncrementOverride(
        {
          'bench-press': { ...emptyOverride(), increment: 2.5 },
        },
        [bench, row],
      ),
    ).toBeNull();
  });

  it('applies common increment to all exercises', () => {
    const next = applyCommonIncrement({}, [bench, row], 2.5);
    expect(next['bench-press']?.increment).toBe(2.5);
    expect(next.row?.increment).toBe(2.5);
  });

  it('clears common increment without dropping other override fields', () => {
    const current: Record<string, PerExerciseOverride> = {
      'bench-press': {
        warmUpPercent: 40,
        sliderRange: null,
        increment: 2.5,
      },
      row: { ...emptyOverride(), increment: 2.5 },
    };
    const next = applyCommonIncrement(current, [bench, row], null);
    expect(next['bench-press']).toEqual({
      warmUpPercent: 40,
      sliderRange: null,
      increment: null,
    });
    expect(next.row).toBeUndefined();
  });

  it('patches and clears a single exercise override', () => {
    const patched = patchExerciseOverride({}, 'bench-press', {
      warmUpPercent: 35,
    });
    expect(patched['bench-press']?.warmUpPercent).toBe(35);

    const cleared = clearExerciseOverride(patched, 'bench-press');
    expect(cleared['bench-press']).toBeUndefined();
  });
});
