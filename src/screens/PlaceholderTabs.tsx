import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBottomSheet } from '../components/AppBottomSheet';
import { Button } from '../components/Button';
import { InputSlider } from '../components/InputSlider';
import { InputToggle } from '../components/InputToggle';
import { LogRow } from '../components/LogRow';
import { getExerciseById, getSelectableExercises } from '../domain/catalogue';
import { getDatabase } from '../db/client';
import { useProfileStore } from '../stores/profileSlice';
import { colors, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import type { MainTabKey } from '../components/MainNavigation';

interface PlaceholderTabsProps {
  tab: MainTabKey;
}

const TAB_TITLES: Record<MainTabKey, string> = {
  workout: 'Work Out',
  history: 'History',
  settings: 'Settings',
};

export function PlaceholderTabs({ tab }: PlaceholderTabsProps) {
  const insets = useSafeAreaInsets();
  const bodyweight = useProfileStore((state) => state.bodyweight);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const sheetRef = useRef<BottomSheetModal>(null);

  const selectableExercises = getSelectableExercises();
  const demoExercise = selectableExercises[0];
  const demoRange = demoExercise?.sliderRange ?? { min: 0, max: 100 };

  const [reps, setReps] = useState(8);
  const [weight, setWeight] = useState(demoRange.min);
  const [warmUp, setWarmUp] = useState(false);

  const openSheet = useCallback(() => {
    sheetRef.current?.present();
  }, []);

  const handleSaveBodyweight = useCallback(async () => {
    const db = getDatabase();
    await updateProfile(db, { bodyweight: 82.5 });
  }, [updateProfile]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing['s-7'] }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={typography.brandXL}>{TAB_TITLES[tab]}</Text>
        <Text style={typography.bodyS}>
          Stage 0 shell — shared components smoke test
        </Text>

        <View style={styles.section}>
          <Text style={typography.titleL}>Profile (SQLite)</Text>
          <Text style={typography.bodyM}>
            Bodyweight: {bodyweight != null ? `${bodyweight} kg` : 'Not set'}
          </Text>
          <Button label="Save 82.5 kg bodyweight" onPress={handleSaveBodyweight} />
        </View>

        <View style={styles.section}>
          <Text style={typography.titleL}>Catalogue</Text>
          <Text style={typography.bodyS}>
            {selectableExercises.length} selectable exercises
          </Text>
          <Text style={typography.bodyM}>
            First picker label: {demoExercise?.name ?? '—'}
          </Text>
          {demoExercise ? (
            <LogRow
              exerciseId={demoExercise.id}
              weight={demoRange.min + 20}
              reps={8}
              warmUp={false}
            />
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={typography.titleL}>Controls</Text>
          <InputSlider
            label="Reps"
            value={reps}
            minimumValue={1}
            maximumValue={20}
            step={1}
            onValueChange={setReps}
          />
          <InputSlider
            label="Weight"
            value={weight}
            minimumValue={demoRange.min}
            maximumValue={demoRange.max}
            step={demoExercise?.increment ?? 1}
            unit="kg"
            onValueChange={setWeight}
          />
          <InputToggle label="Warm-up set" value={warmUp} onValueChange={setWarmUp} />
          <Button label="Open bottom sheet" onPress={openSheet} variant="secondary" />
        </View>
      </ScrollView>

      <AppBottomSheet ref={sheetRef} title="Add Set">
        {demoExercise ? (
          <>
            <Text style={typography.bodyM}>
              {getExerciseById(demoExercise.id)?.name}
            </Text>
            <InputSlider
              label="Reps"
              value={reps}
              minimumValue={1}
              maximumValue={20}
              onValueChange={setReps}
            />
            <InputSlider
              label="Weight"
              value={weight}
              minimumValue={demoRange.min}
              maximumValue={demoRange.max}
              step={demoExercise.increment}
              unit="kg"
              onValueChange={setWeight}
            />
            <InputToggle label="Warm-up set" value={warmUp} onValueChange={setWarmUp} />
            <Button label="Record Set" onPress={() => sheetRef.current?.dismiss()} />
          </>
        ) : null}
      </AppBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors['bg-1'],
  },
  content: {
    paddingHorizontal: spacing['s-7'],
    paddingBottom: spacing['s-16'],
    gap: spacing['s-10'],
  },
  section: {
    gap: spacing['s-5'],
  },
});
