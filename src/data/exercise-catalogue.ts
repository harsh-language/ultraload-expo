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
  /** Fixed range from 75 kg strength standards (BR14). */
  sliderRange: SliderRange;
  increment: number;
  muscleMultipliers: MuscleMultiplier[];
  deprecated?: boolean;
}

export const EXERCISE_CATALOGUE: ExerciseCatalogueEntry[] = [
  {
    id: 'bench-press',
    name: 'bench press',
    primaryMuscle: 'Chest',
    type: 'Compound',
    sliderRange: { min: 30, max: 150 },
    increment: 5,
    muscleMultipliers: [
      { muscle: 'Chest', multiplier: 1 },
      { muscle: 'Triceps', multiplier: 0.5 },
      { muscle: 'Shoulders', multiplier: 0.33 },
    ],
  },
  {
    id: 'crossover',
    name: 'crossover',
    primaryMuscle: 'Chest',
    type: 'Isolation',
    sliderRange: { min: 10, max: 110 },
    increment: 1,
    muscleMultipliers: [{ muscle: 'Chest', multiplier: 1 }],
  },
  {
    id: 'incline-bench-30',
    name: '30° incline bench press',
    primaryMuscle: 'Chest',
    type: 'Compound',
    sliderRange: { min: 30, max: 140 },
    increment: 5,
    muscleMultipliers: [
      { muscle: 'Chest', multiplier: 1 },
      { muscle: 'Shoulders', multiplier: 0.5 },
      { muscle: 'Triceps', multiplier: 0.33 },
    ],
  },
  {
    id: 'overhead-press',
    name: 'overhead press',
    primaryMuscle: 'Shoulders',
    type: 'Compound',
    sliderRange: { min: 20, max: 110 },
    increment: 5,
    muscleMultipliers: [
      { muscle: 'Shoulders', multiplier: 1 },
      { muscle: 'Triceps', multiplier: 0.5 },
      { muscle: 'Chest', multiplier: 0.2 },
    ],
  },
  {
    id: 'z-press',
    name: 'z press',
    primaryMuscle: 'Shoulders',
    type: 'Compound',
    sliderRange: { min: 20, max: 90 },
    increment: 5,
    muscleMultipliers: [
      { muscle: 'Shoulders', multiplier: 1 },
      { muscle: 'Triceps', multiplier: 0.5 },
    ],
  },
  {
    id: 'modified-bradford-press',
    name: 'modified bradford press',
    primaryMuscle: 'Shoulders',
    type: 'Compound',
    sliderRange: { min: 10, max: 80 },
    increment: 5,
    muscleMultipliers: [
      { muscle: 'Shoulders', multiplier: 1 },
      { muscle: 'Triceps', multiplier: 0.33 },
    ],
  },
  {
    id: 'rows',
    name: 'rows',
    primaryMuscle: 'Back',
    type: 'Compound',
    sliderRange: { min: 30, max: 140 },
    increment: 5,
    muscleMultipliers: [
      { muscle: 'Back', multiplier: 1 },
      { muscle: 'Biceps', multiplier: 0.5 },
    ],
  },
  {
    id: 'meadows-row',
    name: 'meadows row',
    primaryMuscle: 'Back',
    type: 'Compound',
    sliderRange: { min: 10, max: 70 },
    increment: 5,
    muscleMultipliers: [
      { muscle: 'Back', multiplier: 1 },
      { muscle: 'Biceps', multiplier: 0.5 },
    ],
  },
  {
    id: 'high-cable-row',
    name: 'high-cable row',
    primaryMuscle: 'Back',
    type: 'Compound',
    sliderRange: { min: 30, max: 120 },
    increment: 1,
    muscleMultipliers: [
      { muscle: 'Back', multiplier: 1 },
      { muscle: 'Biceps', multiplier: 0.33 },
    ],
  },
  {
    id: 'lat-pulldown',
    name: 'lat pulldown',
    primaryMuscle: 'Back',
    type: 'Compound',
    sliderRange: { min: 30, max: 140 },
    increment: 1,
    muscleMultipliers: [
      { muscle: 'Back', multiplier: 1 },
      { muscle: 'Biceps', multiplier: 0.5 },
    ],
  },
  {
    id: 'dead-row',
    name: 'dead row',
    primaryMuscle: 'Back',
    type: 'Compound',
    sliderRange: { min: 40, max: 150 },
    increment: 5,
    muscleMultipliers: [
      { muscle: 'Back', multiplier: 1 },
      { muscle: 'Glutes', multiplier: 0.5 },
      { muscle: 'Biceps', multiplier: 0.33 },
    ],
  },
  {
    id: 'barbell-hip-thrust',
    name: 'barbell hip thrust',
    primaryMuscle: 'Glutes',
    type: 'Compound',
    sliderRange: { min: 30, max: 270 },
    increment: 5,
    muscleMultipliers: [
      { muscle: 'Glutes', multiplier: 1 },
      { muscle: 'Quads', multiplier: 0.2 },
    ],
  },
  {
    id: 'cable-pull-through',
    name: 'cable pull through',
    primaryMuscle: 'Glutes',
    type: 'Compound',
    sliderRange: { min: 10, max: 140 },
    increment: 1,
    muscleMultipliers: [{ muscle: 'Glutes', multiplier: 1 }],
  },
  {
    id: 'dumbbell-leaning-step-up',
    name: 'dumbbell leaning step up',
    primaryMuscle: 'Glutes',
    type: 'Compound',
    sliderRange: { min: 10, max: 110 },
    increment: 2.5,
    muscleMultipliers: [
      { muscle: 'Glutes', multiplier: 1 },
      { muscle: 'Quads', multiplier: 0.66 },
    ],
  },
  {
    id: 'romanian-deadlifts',
    name: 'romanian deadlifts',
    primaryMuscle: 'Glutes',
    type: 'Compound',
    sliderRange: { min: 50, max: 210 },
    increment: 5,
    muscleMultipliers: [
      { muscle: 'Glutes', multiplier: 1 },
      { muscle: 'Back', multiplier: 0.33 },
    ],
  },
  {
    id: 'low-bar-squats',
    name: 'low bar squats',
    primaryMuscle: 'Glutes',
    type: 'Compound',
    sliderRange: { min: 60, max: 230 },
    increment: 5,
    muscleMultipliers: [
      { muscle: 'Glutes', multiplier: 1 },
      { muscle: 'Quads', multiplier: 0.66 },
      { muscle: 'Back', multiplier: 0.2 },
    ],
  },
  {
    id: 'front-squat',
    name: 'front squat',
    primaryMuscle: 'Quads',
    type: 'Compound',
    sliderRange: { min: 50, max: 170 },
    increment: 5,
    muscleMultipliers: [
      { muscle: 'Quads', multiplier: 1 },
      { muscle: 'Glutes', multiplier: 0.5 },
    ],
  },
  {
    id: 'belt-squat',
    name: 'belt squat',
    primaryMuscle: 'Quads',
    type: 'Compound',
    sliderRange: { min: 50, max: 190 },
    increment: 2.5,
    muscleMultipliers: [
      { muscle: 'Quads', multiplier: 1 },
      { muscle: 'Glutes', multiplier: 0.5 },
    ],
  },
  {
    id: 'hack-squat',
    name: 'hack squat',
    primaryMuscle: 'Quads',
    type: 'Compound',
    sliderRange: { min: 50, max: 300 },
    increment: 2.5,
    muscleMultipliers: [
      { muscle: 'Quads', multiplier: 1 },
      { muscle: 'Glutes', multiplier: 0.5 },
    ],
  },
  {
    id: 'bulgarian-split-squat',
    name: 'bulgarian split squat',
    primaryMuscle: 'Quads',
    type: 'Compound',
    sliderRange: { min: 10, max: 140 },
    increment: 5,
    muscleMultipliers: [
      { muscle: 'Quads', multiplier: 1 },
      { muscle: 'Glutes', multiplier: 0.66 },
    ],
  },
  {
    id: 'high-bar-back-squat',
    name: 'high bar back squat',
    primaryMuscle: 'Quads',
    type: 'Compound',
    sliderRange: { min: 50, max: 210 },
    increment: 5,
    muscleMultipliers: [
      { muscle: 'Quads', multiplier: 1 },
      { muscle: 'Glutes', multiplier: 0.66 },
      { muscle: 'Back', multiplier: 0.2 },
    ],
  },
  {
    id: 'reverse-lunge',
    name: 'reverse lunge',
    primaryMuscle: 'Quads',
    type: 'Compound',
    sliderRange: { min: 30, max: 150 },
    increment: 5,
    muscleMultipliers: [
      { muscle: 'Quads', multiplier: 1 },
      { muscle: 'Glutes', multiplier: 0.66 },
    ],
  },
];

export const ORPHAN_EXERCISE_FALLBACK_LABEL = 'unknown exercise';
