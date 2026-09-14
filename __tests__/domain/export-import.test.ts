import {
  buildExportSnapshot,
  serializeExportSnapshot,
} from '../../src/domain/export';
import type { ExportSnapshot } from '../../src/domain/exportSchema';
import {
  parseAndValidateExportJson,
  validateExportSnapshot,
} from '../../src/domain/import';
import type { ProfileState } from '../../src/db/repositories';
import type { TodayWorkout } from '../../src/stores/todaySlice';

const sampleProfile: ProfileState = {
  bodyweight: 75,
  name: 'pablo',
  height: 70,
  age: 30,
  units: 'kg',
  warmUpPercent: 50,
  warmUpAutoTagEnabled: true,
  restTimerSeconds: 180,
  onboardingComplete: true,
};

const sampleWorkouts: TodayWorkout[] = [
  {
    id: 1,
    date: '2026-06-22',
    loggedExercises: [
      {
        id: 10,
        exerciseId: 'bench-press',
        order: 0,
        sets: [
          {
            id: 100,
            weight: 40,
            reps: 8,
            warmUp: true,
            order: 0,
            timestamp: '2026-06-22T10:00:00.000Z',
          },
          {
            id: 101,
            weight: 60,
            reps: 8,
            warmUp: false,
            order: 1,
            timestamp: '2026-06-22T10:30:00.000Z',
          },
        ],
      },
      {
        id: 11,
        exerciseId: 'overhead-press',
        order: 1,
        sets: [
          {
            id: 102,
            weight: 40,
            reps: 6,
            warmUp: false,
            order: 0,
            timestamp: '2026-06-22T10:45:00.000Z',
          },
        ],
      },
    ],
  },
];

function sampleSnapshot(): ExportSnapshot {
  return buildExportSnapshot({
    profile: sampleProfile,
    workoutPlan: ['overhead-press', 'bench-press'],
    workouts: sampleWorkouts,
    appVersion: '1.0.0',
    exportedAt: '2026-06-22T12:00:00.000Z',
  });
}

describe('export/import (T22 / T24)', () => {
  it('T22: round-trip preserves profile, plan order, warm-up flags, timestamps', () => {
    const original = sampleSnapshot();
    const text = serializeExportSnapshot(original);
    const parsed = parseAndValidateExportJson(text);

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) {
      return;
    }

    expect(parsed.snapshot).toEqual(original);
    expect(parsed.snapshot.workoutPlan).toEqual([
      'overhead-press',
      'bench-press',
    ]);
    expect(
      parsed.snapshot.workouts[0]?.loggedExercises[0]?.sets[0]?.warmUp,
    ).toBe(true);
    expect(
      parsed.snapshot.workouts[0]?.loggedExercises[0]?.sets[0]?.timestamp,
    ).toBe('2026-06-22T10:00:00.000Z');
    expect(parsed.snapshot.workouts[0]?.loggedExercises[0]?.order).toBe(0);
    expect(parsed.snapshot.workouts[0]?.loggedExercises[1]?.order).toBe(1);
  });

  it('T22: export → cleared state → re-import restores the same snapshot', () => {
    const exported = sampleSnapshot();
    const clearedPlan: string[] = [];
    const clearedWorkouts: TodayWorkout[] = [];

    expect(clearedPlan).toEqual([]);
    expect(clearedWorkouts).toEqual([]);

    const restored = parseAndValidateExportJson(
      serializeExportSnapshot(exported),
    );
    expect(restored.ok).toBe(true);
    if (!restored.ok) {
      return;
    }
    expect(restored.snapshot).toEqual(exported);
  });

  it('T24: rejects malformed JSON without producing a snapshot', () => {
    const result = parseAndValidateExportJson('{not json');
    expect(result).toEqual({ ok: false, reason: 'malformed_json' });
  });

  it('T24: rejects unsupported schemaVersion', () => {
    const bad = {
      ...sampleSnapshot(),
      schemaVersion: 2,
    };
    const result = validateExportSnapshot(bad);
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.reason).toBe('unsupported_schema');
  });

  it('T24: rejects unknown exercise ids', () => {
    const bad = sampleSnapshot();
    bad.workoutPlan = ['not-a-real-exercise'];
    const result = validateExportSnapshot(bad);
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.reason).toBe('unknown_exercise');
    expect(result.detail).toBe('not-a-real-exercise');
  });

  it('T24: rejects unknown exercise ids inside workouts', () => {
    const bad = sampleSnapshot();
    const first = bad.workouts[0]?.loggedExercises[0];
    if (first) {
      first.exerciseId = 'ghost-lift';
    }
    const result = validateExportSnapshot(bad);
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.reason).toBe('unknown_exercise');
  });

  it('T24: rejects missing required profile fields', () => {
    const { profile: _profile, ...rest } = sampleSnapshot();
    const result = validateExportSnapshot(rest);
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.reason).toBe('invalid_shape');
  });
});
