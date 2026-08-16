/**
 * Structured demo workouts + metadata for DEV seed/reset.
 * Source of truth: docs/demo-data.md — update that file first, then this module.
 */

import type { PlanState, ProfileState } from './repositories';

export interface DemoSet {
  exerciseId: string;
  warmUp: boolean;
  weightKg: number;
  reps: number;
}

export interface DemoSession {
  date: string;
  sets: DemoSet[];
}

/** docs/demo-data.md → Metadata → Profile */
export const DEMO_PROFILE: ProfileState = {
  bodyweight: 75,
  name: null,
  height: null,
  age: null,
  units: 'kg',
  warmUpPercent: 50,
  warmUpAutoTagEnabled: true,
  restTimerSeconds: 180,
  onboardingComplete: true,
};

/** docs/demo-data.md → Metadata → Plan */
export const DEMO_PLAN: PlanState = {
  exerciseIds: ['bench-press', 'low-bar-squats', 'lat-pulldown'],
};

type DemoRepPattern = 'single' | 'double';

interface DemoExerciseSpec {
  exerciseId: string;
  pattern: DemoRepPattern;
  workingWeightKg: number;
}

function buildFixedExerciseSets({
  exerciseId,
  pattern,
  workingWeightKg,
}: DemoExerciseSpec): DemoSet[] {
  const standardSets =
    pattern === 'double'
      ? [
          { weightKg: workingWeightKg, reps: 10 },
          { weightKg: workingWeightKg, reps: 10 },
          { weightKg: workingWeightKg, reps: 9 },
          { weightKg: workingWeightKg, reps: 8 },
        ]
      : [
          { weightKg: workingWeightKg, reps: 10 },
          { weightKg: workingWeightKg, reps: 9 },
          { weightKg: workingWeightKg, reps: 8 },
          { weightKg: workingWeightKg - 5, reps: 8 },
        ];

  return [
    {
      exerciseId,
      warmUp: true,
      weightKg: roundWarmUpKg(workingWeightKg),
      reps: 10,
    },
    ...standardSets.map(({ weightKg, reps }) => ({
      exerciseId,
      warmUp: false,
      weightKg,
      reps,
    })),
  ];
}

function buildFixedDemoSession(
  date: string,
  benchWeightKg: number,
  squatWeightKg: number,
  latWeightKg: number,
  patterns: readonly [DemoRepPattern, DemoRepPattern, DemoRepPattern],
): DemoSession {
  const weights = [benchWeightKg, squatWeightKg, latWeightKg];
  return {
    date,
    sets: DEMO_PLAN.exerciseIds.flatMap((exerciseId, index) =>
      buildFixedExerciseSets({
        exerciseId,
        pattern: patterns[index]!,
        workingWeightKg: weights[index]!,
      }),
    ),
  };
}

const SINGLE: readonly [DemoRepPattern, DemoRepPattern, DemoRepPattern] = [
  'single',
  'single',
  'single',
];
const DOUBLE: readonly [DemoRepPattern, DemoRepPattern, DemoRepPattern] = [
  'double',
  'double',
  'double',
];

const EARLY_DEMO_SESSIONS: readonly DemoSession[] = [
  buildFixedDemoSession('2026-04-01', 60, 80, 50, SINGLE),
  buildFixedDemoSession('2026-04-08', 60, 80, 50, DOUBLE),
  buildFixedDemoSession('2026-04-15', 65, 85, 55, SINGLE),
  buildFixedDemoSession('2026-04-22', 65, 85, 55, DOUBLE),
  buildFixedDemoSession('2026-05-01', 70, 90, 60, SINGLE),
  buildFixedDemoSession('2026-05-08', 70, 90, 60, SINGLE),
  buildFixedDemoSession('2026-05-15', 70, 90, 60, DOUBLE),
  buildFixedDemoSession('2026-05-22', 75, 95, 65, SINGLE),
  buildFixedDemoSession('2026-06-01', 75, 95, 65, SINGLE),
  buildFixedDemoSession('2026-06-08', 75, 95, 65, DOUBLE),
  buildFixedDemoSession('2026-06-15', 80, 100, 70, SINGLE),
  buildFixedDemoSession('2026-06-22', 80, 100, 70, SINGLE),
];

const JULY_DEMO_SESSIONS: readonly DemoSession[] = [
  {
    date: '2026-07-01',
    sets: [
      { exerciseId: 'bench-press', warmUp: true, weightKg: 40, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 80, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 80, reps: 9 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 80, reps: 8 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 75, reps: 8 },
      { exerciseId: 'low-bar-squats', warmUp: true, weightKg: 50, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 100, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 100, reps: 9 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 100, reps: 8 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 95, reps: 8 },
      { exerciseId: 'lat-pulldown', warmUp: true, weightKg: 35, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 70, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 70, reps: 9 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 70, reps: 8 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 65, reps: 8 },
    ],
  },
  {
    date: '2026-07-03',
    sets: [
      { exerciseId: 'bench-press', warmUp: true, weightKg: 40, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 80, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 80, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 80, reps: 9 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 80, reps: 8 },
      { exerciseId: 'low-bar-squats', warmUp: true, weightKg: 50, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 100, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 100, reps: 9 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 100, reps: 8 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 95, reps: 8 },
      { exerciseId: 'lat-pulldown', warmUp: true, weightKg: 35, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 70, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 70, reps: 9 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 70, reps: 8 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 65, reps: 8 },
    ],
  },
  {
    date: '2026-07-05',
    sets: [
      { exerciseId: 'bench-press', warmUp: true, weightKg: 40, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 85, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 85, reps: 9 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 85, reps: 8 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 80, reps: 8 },
      { exerciseId: 'low-bar-squats', warmUp: true, weightKg: 50, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 100, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 100, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 100, reps: 9 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 100, reps: 8 },
      { exerciseId: 'lat-pulldown', warmUp: true, weightKg: 35, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 70, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 70, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 70, reps: 9 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 70, reps: 8 },
    ],
  },
  {
    date: '2026-07-07',
    sets: [
      { exerciseId: 'bench-press', warmUp: true, weightKg: 40, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 85, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 85, reps: 9 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 85, reps: 8 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 80, reps: 8 },
      { exerciseId: 'low-bar-squats', warmUp: true, weightKg: 50, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 105, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 105, reps: 9 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 105, reps: 8 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 100, reps: 8 },
      { exerciseId: 'lat-pulldown', warmUp: true, weightKg: 35, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 75, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 75, reps: 9 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 75, reps: 8 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 70, reps: 8 },
    ],
  },
  {
    date: '2026-07-09',
    sets: [
      { exerciseId: 'bench-press', warmUp: true, weightKg: 40, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 85, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 85, reps: 9 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 85, reps: 8 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 80, reps: 8 },
      { exerciseId: 'low-bar-squats', warmUp: true, weightKg: 50, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 105, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 105, reps: 9 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 105, reps: 8 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 100, reps: 8 },
      { exerciseId: 'lat-pulldown', warmUp: true, weightKg: 35, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 75, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 75, reps: 9 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 75, reps: 8 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 70, reps: 8 },
    ],
  },
  {
    date: '2026-07-11',
    sets: [
      { exerciseId: 'bench-press', warmUp: true, weightKg: 40, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 85, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 85, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 85, reps: 9 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 85, reps: 8 },
      { exerciseId: 'low-bar-squats', warmUp: true, weightKg: 50, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 105, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 105, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 105, reps: 9 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 105, reps: 8 },
      { exerciseId: 'lat-pulldown', warmUp: true, weightKg: 35, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 75, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 75, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 75, reps: 9 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 75, reps: 8 },
    ],
  },
  {
    date: '2026-07-13',
    sets: [
      { exerciseId: 'bench-press', warmUp: true, weightKg: 45, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 90, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 90, reps: 9 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 90, reps: 8 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 85, reps: 8 },
      { exerciseId: 'low-bar-squats', warmUp: true, weightKg: 55, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 110, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 110, reps: 9 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 110, reps: 8 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 105, reps: 8 },
      { exerciseId: 'lat-pulldown', warmUp: true, weightKg: 40, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 80, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 80, reps: 9 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 80, reps: 8 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 75, reps: 8 },
    ],
  },
  {
    date: '2026-07-15',
    sets: [
      { exerciseId: 'bench-press', warmUp: true, weightKg: 45, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 90, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 90, reps: 9 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 90, reps: 8 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 85, reps: 8 },
      { exerciseId: 'low-bar-squats', warmUp: true, weightKg: 55, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 110, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 110, reps: 9 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 110, reps: 8 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 105, reps: 8 },
      { exerciseId: 'lat-pulldown', warmUp: true, weightKg: 40, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 80, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 80, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 80, reps: 9 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 80, reps: 8 },
    ],
  },
  {
    date: '2026-07-17',
    sets: [
      { exerciseId: 'bench-press', warmUp: true, weightKg: 45, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 90, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 90, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 90, reps: 9 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 90, reps: 8 },
      { exerciseId: 'low-bar-squats', warmUp: true, weightKg: 55, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 110, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 110, reps: 9 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 110, reps: 8 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 105, reps: 8 },
      { exerciseId: 'lat-pulldown', warmUp: true, weightKg: 40, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 85, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 85, reps: 9 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 85, reps: 8 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 80, reps: 8 },
    ],
  },
  {
    date: '2026-07-20',
    sets: [
      { exerciseId: 'bench-press', warmUp: true, weightKg: 45, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 95, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 95, reps: 9 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 95, reps: 8 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 90, reps: 8 },
      { exerciseId: 'low-bar-squats', warmUp: true, weightKg: 55, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 110, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 110, reps: 9 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 110, reps: 8 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 105, reps: 8 },
      { exerciseId: 'lat-pulldown', warmUp: true, weightKg: 40, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 85, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 85, reps: 9 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 85, reps: 8 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 80, reps: 8 },
    ],
  },
  {
    date: '2026-07-22',
    sets: [
      { exerciseId: 'bench-press', warmUp: true, weightKg: 45, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 95, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 95, reps: 9 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 95, reps: 8 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 90, reps: 8 },
      { exerciseId: 'low-bar-squats', warmUp: true, weightKg: 55, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 110, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 110, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 110, reps: 9 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 110, reps: 8 },
      { exerciseId: 'lat-pulldown', warmUp: true, weightKg: 40, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 85, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 85, reps: 9 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 85, reps: 8 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 80, reps: 8 },
    ],
  },
  {
    date: '2026-07-24',
    sets: [
      { exerciseId: 'bench-press', warmUp: true, weightKg: 45, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 95, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 95, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 95, reps: 9 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 95, reps: 8 },
      { exerciseId: 'low-bar-squats', warmUp: true, weightKg: 55, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 115, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 115, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 115, reps: 9 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 115, reps: 8 },
      { exerciseId: 'lat-pulldown', warmUp: true, weightKg: 40, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 85, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 85, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 85, reps: 9 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 85, reps: 8 },
    ],
  },
  {
    date: '2026-07-26',
    sets: [
      { exerciseId: 'bench-press', warmUp: true, weightKg: 50, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 100, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 100, reps: 9 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 100, reps: 8 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 95, reps: 8 },
      { exerciseId: 'low-bar-squats', warmUp: true, weightKg: 60, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 120, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 120, reps: 9 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 120, reps: 8 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 115, reps: 8 },
      { exerciseId: 'lat-pulldown', warmUp: true, weightKg: 45, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 90, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 90, reps: 9 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 90, reps: 8 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 85, reps: 8 },
    ],
  },
  {
    date: '2026-07-28',
    sets: [
      { exerciseId: 'bench-press', warmUp: true, weightKg: 50, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 100, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 100, reps: 9 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 100, reps: 8 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 95, reps: 8 },
      { exerciseId: 'low-bar-squats', warmUp: true, weightKg: 60, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 120, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 120, reps: 9 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 120, reps: 8 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 115, reps: 8 },
      { exerciseId: 'lat-pulldown', warmUp: true, weightKg: 45, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 90, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 90, reps: 9 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 90, reps: 8 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 85, reps: 8 },
    ],
  },
  {
    date: '2026-07-31',
    sets: [
      { exerciseId: 'bench-press', warmUp: true, weightKg: 50, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 100, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 100, reps: 10 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 100, reps: 9 },
      { exerciseId: 'bench-press', warmUp: false, weightKg: 100, reps: 8 },
      { exerciseId: 'low-bar-squats', warmUp: true, weightKg: 60, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 120, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 120, reps: 10 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 120, reps: 9 },
      { exerciseId: 'low-bar-squats', warmUp: false, weightKg: 120, reps: 8 },
      { exerciseId: 'lat-pulldown', warmUp: true, weightKg: 45, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 90, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 90, reps: 10 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 90, reps: 9 },
      { exerciseId: 'lat-pulldown', warmUp: false, weightKg: 90, reps: 8 },
    ],
  },
];

const AUGUST_DEMO_SESSIONS: readonly DemoSession[] = [
  buildFixedDemoSession('2026-08-02', 105, 125, 95, SINGLE),
  buildFixedDemoSession('2026-08-05', 105, 125, 95, DOUBLE),
  buildFixedDemoSession('2026-08-09', 110, 130, 100, SINGLE),
];

export const DEMO_SESSIONS: readonly DemoSession[] = [
  ...EARLY_DEMO_SESSIONS,
  ...JULY_DEMO_SESSIONS,
  ...AUGUST_DEMO_SESSIONS,
];

/** Last fixed history session — rolling today progresses from this, never from a prior rolling day. */
export const LAST_FIXED_DEMO_SESSION: DemoSession =
  DEMO_SESSIONS[DEMO_SESSIONS.length - 1]!;

const FIXED_DEMO_DATES = new Set(DEMO_SESSIONS.map((session) => session.date));

/**
 * Workout dates that are neither fixed demo sessions nor today.
 * After reset, these leftovers (prior rolling-today days) must be removed.
 */
export function getStaleDemoWorkoutDates(
  existingDates: readonly string[],
  today: string,
): string[] {
  return existingDates.filter(
    (date) => date !== today && !FIXED_DEMO_DATES.has(date),
  );
}

function roundWarmUpKg(workingKg: number): number {
  return Math.round((workingKg * 0.5) / 5) * 5;
}

function buildNextExerciseSets(
  exerciseId: string,
  priorSets: readonly DemoSet[],
): DemoSet[] {
  const standard = priorSets.filter(
    (set) => set.exerciseId === exerciseId && !set.warmUp,
  );
  const workingWeight = standard[0]?.weightKg;
  if (workingWeight == null) {
    throw new Error(`demo progression: no standard sets for ${exerciseId}`);
  }

  const tensAtWorking = standard.filter(
    (set) => set.weightKg === workingWeight && set.reps === 10,
  ).length;
  const nextWorking =
    tensAtWorking >= 2 ? workingWeight + 5 : workingWeight;

  return [
    {
      exerciseId,
      warmUp: true,
      weightKg: roundWarmUpKg(nextWorking),
      reps: 10,
    },
    { exerciseId, warmUp: false, weightKg: nextWorking, reps: 10 },
    { exerciseId, warmUp: false, weightKg: nextWorking, reps: 9 },
    { exerciseId, warmUp: false, weightKg: nextWorking, reps: 8 },
    { exerciseId, warmUp: false, weightKg: nextWorking - 5, reps: 8 },
  ];
}

/**
 * Next demo session sets from a prior session, per docs/demo-data.md progression rules.
 * Used for the rolling “today” seed from the last fixed day (currently 2026-08-09).
 */
export function buildNextDemoSession(prior: DemoSession): DemoSet[] {
  const next: DemoSet[] = [];
  for (const exerciseId of DEMO_PLAN.exerciseIds) {
    next.push(
      ...buildNextExerciseSets(
        exerciseId,
        prior.sets.filter((set) => set.exerciseId === exerciseId),
      ),
    );
  }
  return next;
}