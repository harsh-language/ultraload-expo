import {
  EXERCISE_CATALOGUE,
  ORPHAN_EXERCISE_FALLBACK_LABEL,
  type ExerciseCatalogueEntry,
  type MuscleGroup,
} from '../data/exercise-catalogue';

const catalogueById = new Map(
  EXERCISE_CATALOGUE.map((entry) => [entry.id, entry]),
);

export function getExerciseById(id: string): ExerciseCatalogueEntry | undefined {
  return catalogueById.get(id);
}

export function getExerciseLabel(id: string): string {
  return catalogueById.get(id)?.name ?? ORPHAN_EXERCISE_FALLBACK_LABEL;
}

export function getOrphanFallbackLabel(id: string): string {
  return catalogueById.has(id) ? getExerciseLabel(id) : id;
}

export function getAllExercises(): ExerciseCatalogueEntry[] {
  return EXERCISE_CATALOGUE;
}

export function getSelectableExercises(): ExerciseCatalogueEntry[] {
  return EXERCISE_CATALOGUE.filter((entry) => !entry.deprecated);
}

export function isDeprecatedExercise(id: string): boolean {
  return catalogueById.get(id)?.deprecated === true;
}

export function isKnownExercise(id: string): boolean {
  return catalogueById.has(id);
}

export function getExercisesByIds(ids: string[]): ExerciseCatalogueEntry[] {
  return ids
    .map((id) => catalogueById.get(id))
    .filter((entry): entry is ExerciseCatalogueEntry => entry !== undefined);
}

export const FILTERABLE_MUSCLE_GROUPS = [
  'Chest',
  'Shoulders',
  'Back',
  'Glutes',
  'Quads',
] as const satisfies readonly MuscleGroup[];

export type FilterableMuscleGroup = (typeof FILTERABLE_MUSCLE_GROUPS)[number];

export function getFilterableMuscleGroups(): FilterableMuscleGroup[] {
  return [...FILTERABLE_MUSCLE_GROUPS];
}
