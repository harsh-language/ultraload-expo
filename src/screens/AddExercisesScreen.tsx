import { useCallback, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton } from '../components/IconButton';
import {
  RemoveExerciseSheet,
  type RemoveExerciseSheetHandle,
} from '../components/RemoveExerciseSheet';
import { BackIcon } from '../components/icons/BackIcon';
import { getDatabase } from '../db/client';
import { getExerciseById } from '../domain/catalogue';
import type { MainStackParamList } from '../navigation/types';
import { usePlanStore } from '../stores';
import { colors, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';
import {
  ExercisePicker,
  getAddExercisesScrollBottomInset,
} from './onboarding/ExercisePicker';

type Props = NativeStackScreenProps<MainStackParamList, 'AddExercises'>;

export function AddExercisesScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const removeSheetRef = useRef<RemoveExerciseSheetHandle>(null);
  const exerciseIds = usePlanStore((state) => state.exerciseIds);
  const updatePlan = usePlanStore((state) => state.updatePlan);
  const exerciseIdsRef = useRef(exerciseIds);
  exerciseIdsRef.current = exerciseIds;

  const handleToggle = useCallback(
    (exerciseId: string) => {
      const currentIds = exerciseIdsRef.current;
      if (currentIds.includes(exerciseId)) {
        if (currentIds.length <= 1) {
          return;
        }
        const exercise = getExerciseById(exerciseId);
        if (exercise == null) {
          return;
        }
        removeSheetRef.current?.present({
          id: exercise.id,
          name: exercise.name,
        });
        return;
      }

      const nextIds = [...currentIds, exerciseId];
      exerciseIdsRef.current = nextIds;
      void updatePlan(getDatabase(), nextIds);
    },
    [updatePlan],
  );

  const handleRemoveConfirm = useCallback(
    (exerciseId: string) => {
      const currentIds = exerciseIdsRef.current;
      if (currentIds.length <= 1) {
        return;
      }
      const nextIds = currentIds.filter((id) => id !== exerciseId);
      exerciseIdsRef.current = nextIds;
      void updatePlan(getDatabase(), nextIds);
    },
    [updatePlan],
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing['s-8'] }]}>
      <View style={styles.titleBar}>
        <IconButton
          accessibilityLabel="back"
          onPress={() => navigation.goBack()}
        >
          <BackIcon />
        </IconButton>
        <Text style={styles.title}>exercises</Text>
      </View>

      <View style={styles.body}>
        <ExercisePicker
          contentBottomInset={getAddExercisesScrollBottomInset(insets)}
          onToggle={handleToggle}
          selectedIds={exerciseIds}
          showHeader={false}
          step={0}
          title="exercises"
        />
      </View>

      <RemoveExerciseSheet
        ref={removeSheetRef}
        onConfirm={handleRemoveConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors['bg-1'],
    paddingHorizontal: spacing['s-8'],
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['s-5'],
    minHeight: spacing['s-12'],
    marginBottom: spacing['s-8'],
  },
  title: {
    ...typography.brand1,
    ...textCase.upper,
    flex: 1,
  },
  body: {
    flex: 1,
  },
});
