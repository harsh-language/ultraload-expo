export type MuscleGroup =
  | 'Chest'
  | 'Shoulders'
  | 'Back'
  | 'Glutes'
  | 'Quads'
  | 'Biceps'
  | 'Triceps';

export type ExerciseType = 'Compound' | 'Isolation';

export type DisplayUnit = 'kg' | 'lbs' | 'stone';

export interface MuscleMultiplier {
  muscle: MuscleGroup;
  multiplier: number;
}

export interface SliderRange {
  min: number;
  max: number;
}

export interface ExerciseCatalogueEntry {
  id: string;
  name: string;
  primaryMuscle: MuscleGroup;
  type: ExerciseType;
  /** Fixed range for the 22 non-bodyweight exercises (BR14). */
  sliderRange?: SliderRange;
  increment: number;
  /** External-load warm-up threshold for non-bodyweight exercises (BR15). */
  warmUpThreshold?: number;
  muscleMultipliers: MuscleMultiplier[];
  isBodyweight: boolean;
  deprecated?: boolean;
}

export const EXERCISE_CATALOGUE: ExerciseCatalogueEntry[] = [
  {
    id: 'bench-press',
    name: 'Bench press',
    primaryMuscle: 'Chest',
    type: 'Compound',
    sliderRange: { min: 30, max: 150 },
    increment: 5,
    warmUpThreshold: 47,
    muscleMultipliers: [
      { muscle: 'Chest', multiplier: 1 },
      { muscle: 'Triceps', multiplier: 0.5 },
      { muscle: 'Shoulders', multiplier: 0.33 },
    ],
    isBodyweight: false,
  },
  {
    id: 'dip-weighted',
    name: 'Dip (weighted)',
    primaryMuscle: 'Chest',
    type: 'Compound',
    increment: 1,
    muscleMultipliers: [
      { muscle: 'Chest', multiplier: 1 },
      { muscle: 'Triceps', multiplier: 0.5 },
      { muscle: 'Shoulders', multiplier: 0.33 },
    ],
    isBodyweight: true,
  },
  {
    id: 'crossover',
    name: 'Crossover',
    primaryMuscle: 'Chest',
    type: 'Isolation',
    sliderRange: { min: 10, max: 110 },
    increment: 1,
    warmUpThreshold: 19,
    muscleMultipliers: [{ muscle: 'Chest', multiplier: 1 }],
    isBodyweight: false,
  },
  {
    id: 'incline-bench-30',
    name: '30° incline bench press',
    primaryMuscle: 'Chest',
    type: 'Compound',
    sliderRange: { min: 30, max: 140 },
    increment: 5,
    warmUpThreshold: 38,
    muscleMultipliers: [
      { muscle: 'Chest', multiplier: 1 },
      { muscle: 'Shoulders', multiplier: 0.5 },
      { muscle: 'Triceps', multiplier: 0.33 },
    ],
    isBodyweight: false,
  },
  {
    id: 'overhead-press',
    name: 'Overhead press',
    primaryMuscle: 'Shoulders',
    type: 'Compound',
    sliderRange: { min: 20, max: 110 },
    increment: 5,
    warmUpThreshold: 30,
    muscleMultipliers: [
      { muscle: 'Shoulders', multiplier: 1 },
      { muscle: 'Triceps', multiplier: 0.5 },
      { muscle: 'Chest', multiplier: 0.2 },
    ],
    isBodyweight: false,
  },
  {
    id: 'z-press',
    name: 'Z press',
    primaryMuscle: 'Shoulders',
    type: 'Compound',
    sliderRange: { min: 20, max: 90 },
    increment: 5,
    warmUpThreshold: 25,
    muscleMultipliers: [
      { muscle: 'Shoulders', multiplier: 1 },
      { muscle: 'Triceps', multiplier: 0.5 },
    ],
    isBodyweight: false,
  },
  {
    id: 'modified-bradford-press',
    name: 'Modified Bradford press',
    primaryMuscle: 'Shoulders',
    type: 'Compound',
    sliderRange: { min: 10, max: 80 },
    increment: 5,
    warmUpThreshold: 21,
    muscleMultipliers: [
      { muscle: 'Shoulders', multiplier: 1 },
      { muscle: 'Triceps', multiplier: 0.33 },
    ],
    isBodyweight: false,
  },
  {
    id: 'weighted-pull-ups',
    name: 'Weighted pull-ups',
    primaryMuscle: 'Back',
    type: 'Compound',
    increment: 1,
    muscleMultipliers: [
      { muscle: 'Back', multiplier: 1 },
      { muscle: 'Biceps', multiplier: 0.5 },
    ],
    isBodyweight: true,
  },
  {
    id: 'rows',
    name: 'Rows',
    primaryMuscle: 'Back',
    type: 'Compound',
    sliderRange: { min: 30, max: 140 },
    increment: 5,
    warmUpThreshold: 38,
    muscleMultipliers: [
      { muscle: 'Back', multiplier: 1 },
      { muscle: 'Biceps', multiplier: 0.5 },
    ],
    isBodyweight: false,
  },
  {
    id: 'meadows-row',
    name: 'Meadows row',
    primaryMuscle: 'Back',
    type: 'Compound',
    sliderRange: { min: 10, max: 70 },
    increment: 5,
    warmUpThreshold: 17,
    muscleMultipliers: [
      { muscle: 'Back', multiplier: 1 },
      { muscle: 'Biceps', multiplier: 0.5 },
    ],
    isBodyweight: false,
  },
  {
    id: 'high-cable-row',
    name: 'High-cable row',
    primaryMuscle: 'Back',
    type: 'Compound',
    sliderRange: { min: 30, max: 120 },
    increment: 1,
    warmUpThreshold: 34,
    muscleMultipliers: [
      { muscle: 'Back', multiplier: 1 },
      { muscle: 'Biceps', multiplier: 0.33 },
    ],
    isBodyweight: false,
  },
  {
    id: 'lat-pulldown',
    name: 'Lat pulldown',
    primaryMuscle: 'Back',
    type: 'Compound',
    sliderRange: { min: 30, max: 140 },
    increment: 1,
    warmUpThreshold: 38,
    muscleMultipliers: [
      { muscle: 'Back', multiplier: 1 },
      { muscle: 'Biceps', multiplier: 0.5 },
    ],
    isBodyweight: false,
  },
  {
    id: 'dead-row',
    name: 'Dead row',
    primaryMuscle: 'Back',
    type: 'Compound',
    sliderRange: { min: 40, max: 150 },
    increment: 5,
    warmUpThreshold: 42,
    muscleMultipliers: [
      { muscle: 'Back', multiplier: 1 },
      { muscle: 'Glutes', multiplier: 0.5 },
      { muscle: 'Biceps', multiplier: 0.33 },
    ],
    isBodyweight: false,
  },
  {
    id: 'barbell-hip-thrust',
    name: 'Barbell hip thrust',
    primaryMuscle: 'Glutes',
    type: 'Compound',
    sliderRange: { min: 30, max: 270 },
    increment: 5,
    warmUpThreshold: 66,
    muscleMultipliers: [
      { muscle: 'Glutes', multiplier: 1 },
      { muscle: 'Quads', multiplier: 0.2 },
    ],
    isBodyweight: false,
  },
  {
    id: 'cable-pull-through',
    name: 'Cable pull through',
    primaryMuscle: 'Glutes',
    type: 'Compound',
    sliderRange: { min: 10, max: 140 },
    increment: 1,
    warmUpThreshold: 28,
    muscleMultipliers: [{ muscle: 'Glutes', multiplier: 1 }],
    isBodyweight: false,
  },
  {
    id: 'dumbbell-leaning-step-up',
    name: 'Dumbbell leaning step up',
    primaryMuscle: 'Glutes',
    type: 'Compound',
    sliderRange: { min: 10, max: 110 },
    increment: 2.5,
    warmUpThreshold: 23,
    muscleMultipliers: [
      { muscle: 'Glutes', multiplier: 1 },
      { muscle: 'Quads', multiplier: 0.66 },
    ],
    isBodyweight: false,
  },
  {
    id: 'gluteus-bridge-curl',
    name: 'Gluteus bridge curl',
    primaryMuscle: 'Glutes',
    type: 'Isolation',
    increment: 1,
    muscleMultipliers: [{ muscle: 'Glutes', multiplier: 1 }],
    isBodyweight: true,
  },
  {
    id: 'romanian-deadlifts',
    name: 'Romanian deadlifts',
    primaryMuscle: 'Glutes',
    type: 'Compound',
    sliderRange: { min: 50, max: 210 },
    increment: 5,
    warmUpThreshold: 57,
    muscleMultipliers: [
      { muscle: 'Glutes', multiplier: 1 },
      { muscle: 'Back', multiplier: 0.33 },
    ],
    isBodyweight: false,
  },
  {
    id: 'low-bar-squats',
    name: 'Low bar squats',
    primaryMuscle: 'Glutes',
    type: 'Compound',
    sliderRange: { min: 60, max: 230 },
    increment: 5,
    warmUpThreshold: 66,
    muscleMultipliers: [
      { muscle: 'Glutes', multiplier: 1 },
      { muscle: 'Quads', multiplier: 0.66 },
      { muscle: 'Back', multiplier: 0.2 },
    ],
    isBodyweight: false,
  },
  {
    id: 'front-squat',
    name: 'Front squat',
    primaryMuscle: 'Quads',
    type: 'Compound',
    sliderRange: { min: 50, max: 170 },
    increment: 5,
    warmUpThreshold: 47,
    muscleMultipliers: [
      { muscle: 'Quads', multiplier: 1 },
      { muscle: 'Glutes', multiplier: 0.5 },
    ],
    isBodyweight: false,
  },
  {
    id: 'belt-squat',
    name: 'Belt squat',
    primaryMuscle: 'Quads',
    type: 'Compound',
    sliderRange: { min: 50, max: 190 },
    increment: 2.5,
    warmUpThreshold: 53,
    muscleMultipliers: [
      { muscle: 'Quads', multiplier: 1 },
      { muscle: 'Glutes', multiplier: 0.5 },
    ],
    isBodyweight: false,
  },
  {
    id: 'hack-squat',
    name: 'Hack squat',
    primaryMuscle: 'Quads',
    type: 'Compound',
    sliderRange: { min: 50, max: 300 },
    increment: 2.5,
    warmUpThreshold: 75,
    muscleMultipliers: [
      { muscle: 'Quads', multiplier: 1 },
      { muscle: 'Glutes', multiplier: 0.5 },
    ],
    isBodyweight: false,
  },
  {
    id: 'bulgarian-split-squat',
    name: 'Bulgarian split squat',
    primaryMuscle: 'Quads',
    type: 'Compound',
    sliderRange: { min: 10, max: 140 },
    increment: 5,
    warmUpThreshold: 28,
    muscleMultipliers: [
      { muscle: 'Quads', multiplier: 1 },
      { muscle: 'Glutes', multiplier: 0.66 },
    ],
    isBodyweight: false,
  },
  {
    id: 'high-bar-back-squat',
    name: 'High bar back squat',
    primaryMuscle: 'Quads',
    type: 'Compound',
    sliderRange: { min: 50, max: 210 },
    increment: 5,
    warmUpThreshold: 57,
    muscleMultipliers: [
      { muscle: 'Quads', multiplier: 1 },
      { muscle: 'Glutes', multiplier: 0.66 },
      { muscle: 'Back', multiplier: 0.2 },
    ],
    isBodyweight: false,
  },
  {
    id: 'reverse-lunge',
    name: 'Reverse lunge',
    primaryMuscle: 'Quads',
    type: 'Compound',
    sliderRange: { min: 30, max: 150 },
    increment: 5,
    warmUpThreshold: 38,
    muscleMultipliers: [
      { muscle: 'Quads', multiplier: 1 },
      { muscle: 'Glutes', multiplier: 0.66 },
    ],
    isBodyweight: false,
  },
];

export const ORPHAN_EXERCISE_FALLBACK_LABEL = 'Unknown exercise';
