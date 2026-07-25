import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ExerciseCatalogueEntry, MuscleGroup } from '../../data/exercise-catalogue';
import { getSelectableExercises } from '../../domain/catalogue';
import { InputOption } from '../../components/InputOption';
import { OnboardingProgress } from '../../components/OnboardingProgress';
import { ScrollFadeView } from '../../components/ScrollFadeView';
import { SectionDivider } from '../../components/SectionDivider';
import { spacing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { textCase } from '../../theme/textCase';
import { getOnboardingScrollBottomInset } from './OnboardingLayout';

const MUSCLE_ORDER: MuscleGroup[] = [
  'Shoulders',
  'Chest',
  'Back',
  'Glutes',
  'Quads',
  'Biceps',
  'Triceps',
];

export const exercisePickerSpacing = {
  contentGap: spacing['s-8'],
  listStackGap: spacing['s-8'],
  listStackPaddingVertical: spacing['s-8'],
  exerciseGroupGap: spacing['s-5'],
} as const;

function groupByMuscle(
  exercises: ExerciseCatalogueEntry[],
): Map<MuscleGroup, ExerciseCatalogueEntry[]> {
  const groups = new Map<MuscleGroup, ExerciseCatalogueEntry[]>();

  for (const exercise of exercises) {
    const existing = groups.get(exercise.primaryMuscle) ?? [];
    existing.push(exercise);
    groups.set(exercise.primaryMuscle, existing);
  }

  return groups;
}

interface ExercisePickerListProps {
  selectedIds: string[];
  onToggle: (exerciseId: string) => void;
  exercises?: ExerciseCatalogueEntry[];
}

/** Shared muscle-group option list — used by onboarding and Settings add-exercises. */
export function ExercisePickerList({
  selectedIds,
  onToggle,
  exercises = getSelectableExercises(),
}: ExercisePickerListProps) {
  const grouped = useMemo(() => groupByMuscle(exercises), [exercises]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  return (
    <View style={styles.listStack}>
      {MUSCLE_ORDER.flatMap((muscle) => {
        const items = grouped.get(muscle);
        if (!items?.length) {
          return [];
        }

        return [
          <SectionDivider key={`${muscle}-divider`} label={muscle} />,
          <View key={`${muscle}-group`} style={styles.exerciseGroup}>
            {items.map((exercise) => (
              <InputOption
                key={exercise.id}
                label={exercise.name}
                onPress={() => onToggle(exercise.id)}
                selected={selectedSet.has(exercise.id)}
              />
            ))}
          </View>,
        ];
      })}
    </View>
  );
}

interface ExercisePickerProps {
  step: number;
  title: string;
  selectedIds: string[];
  onToggle: (exerciseId: string) => void;
  exercises?: ExerciseCatalogueEntry[];
  /** Override scroll bottom inset (defaults to onboarding footer clearance). */
  contentBottomInset?: number;
  showHeader?: boolean;
  /** When false, omit top fade (e.g. sticky title bar). Default true. */
  topFadeEnabled?: boolean;
}

export function ExercisePicker({
  step,
  title,
  selectedIds,
  onToggle,
  exercises = getSelectableExercises(),
  contentBottomInset,
  showHeader = true,
  topFadeEnabled = true,
}: ExercisePickerProps) {
  const insets = useSafeAreaInsets();
  const scrollBottomInset =
    contentBottomInset ?? getOnboardingScrollBottomInset(insets);

  return (
    <ScrollFadeView
      bottomFadeHeight={spacing['s-17']}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: scrollBottomInset },
      ]}
      showsVerticalScrollIndicator={false}
      style={styles.scroll}
      topFadeEnabled={topFadeEnabled}
    >
      {showHeader ? (
        <>
          <OnboardingProgress step={step} />
          <Text style={styles.title}>{title}</Text>
        </>
      ) : null}
      <ExercisePickerList
        exercises={exercises}
        onToggle={onToggle}
        selectedIds={selectedIds}
      />
    </ScrollFadeView>
  );
}

/** Bottom safe padding for Settings add-exercises (no overlay footer). */
export function getAddExercisesScrollBottomInset(insets: EdgeInsets): number {
  return Math.max(insets.bottom, spacing['s-8']) + spacing['s-8'];
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    gap: exercisePickerSpacing.contentGap,
  },
  title: {
    ...typography.brand1,
    ...textCase.upper,
  },
  listStack: {
    paddingVertical: exercisePickerSpacing.listStackPaddingVertical,
    gap: exercisePickerSpacing.listStackGap,
  },
  exerciseGroup: {
    gap: exercisePickerSpacing.exerciseGroupGap,
  },
});
