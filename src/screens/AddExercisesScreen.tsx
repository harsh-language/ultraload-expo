import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton } from '../components/IconButton';
import { CheckmarkIcon } from '../components/icons/CheckmarkIcon';
import { CloseIcon } from '../components/icons/CloseIcon';
import { getDatabase } from '../db/client';
import type { MainStackParamList } from '../navigation/types';
import { usePlanStore } from '../stores';
import { shadowBelow } from '../theme/shadow';
import { colors, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';
import {
  ExercisePicker,
  getAddExercisesScrollBottomInset,
} from './onboarding/ExercisePicker';

/** Figma session-title-bar fill — vertical content-trans-light → bg-trans-1 over bg-1 */
const TITLE_BAR_GRADIENT = [
  colors['content-trans-light'],
  colors['bg-trans-1'],
] as const;

type Props = NativeStackScreenProps<MainStackParamList, 'AddExercises'>;

export function AddExercisesScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const exerciseIds = usePlanStore((state) => state.exerciseIds);
  const updatePlan = usePlanStore((state) => state.updatePlan);
  const [draftExerciseIds, setDraftExerciseIds] = useState(() => exerciseIds);
  const savingRef = useRef(false);

  const handleToggle = useCallback(
    (exerciseId: string) => {
      setDraftExerciseIds((currentIds) => {
        if (!currentIds.includes(exerciseId)) {
          return [...currentIds, exerciseId];
        }
        if (currentIds.length <= 1) {
          return currentIds;
        }
        return currentIds.filter((id) => id !== exerciseId);
      });
    },
    [],
  );

  const handleDiscard = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSave = useCallback(async () => {
    if (savingRef.current) {
      return;
    }
    savingRef.current = true;
    try {
      await updatePlan(getDatabase(), draftExerciseIds);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save exercise plan', error);
    } finally {
      savingRef.current = false;
    }
  }, [draftExerciseIds, navigation, updatePlan]);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.titleBar}>
        <LinearGradient
          colors={[...TITLE_BAR_GRADIENT]}
          end={{ x: 0.5, y: 1 }}
          pointerEvents="none"
          start={{ x: 0.5, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.title}>select</Text>
        <IconButton
          accessibilityLabel="discard changes"
          onPress={handleDiscard}
          size="small"
        >
          <CloseIcon />
        </IconButton>
        <IconButton
          accessibilityLabel="save changes"
          onPress={() => {
            void handleSave();
          }}
          size="small"
          variant="primary"
        >
          <CheckmarkIcon />
        </IconButton>
      </View>

      <View style={styles.body}>
        <ExercisePicker
          contentBottomInset={getAddExercisesScrollBottomInset(insets)}
          onToggle={handleToggle}
          selectedIds={draftExerciseIds}
          showHeader={false}
          step={0}
          title="exercises"
          topFadeEnabled={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors['bg-1'],
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['s-8'],
    padding: spacing['s-8'],
    backgroundColor: colors['bg-1'],
    borderBottomWidth: spacing['s-1'],
    borderBottomColor: colors['border-2'],
    zIndex: 1,
    ...shadowBelow,
  },
  title: {
    ...typography.brand1,
    ...textCase.upper,
    flex: 1,
    minWidth: 0,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing['s-8'],
  },
});
