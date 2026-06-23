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
import { TAB_LABELS, type MainTabKey } from '../navigation/mainTabs';

interface PlaceholderTabsProps {
  tab: MainTabKey;
}

const selectableExercises = getSelectableExercises();

export function PlaceholderTabs({ tab }: PlaceholderTabsProps) {
  const insets = useSafeAreaInsets();
  const bodyweight = useProfileStore((state) => state.bodyweight);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const sheetRef = useRef<BottomSheetModal>(null);

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
        <Text style={typography.brand1}>{TAB_LABELS[tab]}</Text>
        <Text style={typography.para4}>
          stage 0 shell — shared components smoke test
        </Text>

        <View style={styles.section}>
          <Text style={typography.label}>profile</Text>
          <Text style={typography.para2}>
            bodyweight: {bodyweight != null ? `${bodyweight} kg` : 'not set'}
          </Text>
          <Button label="save 82.5 kg bodyweight" onPress={handleSaveBodyweight} />
        </View>

        <View style={styles.section}>
          <Text style={typography.label}>catalogue</Text>
          <Text style={typography.para4}>
            {selectableExercises.length} selectable exercises
          </Text>
          <Text style={typography.para2}>
            first picker label: {demoExercise?.name ?? '—'}
          </Text>
          {demoExercise ? (
            <>
              <View style={styles.logStack}>
                <LogRow
                  type="set"
                  setIndex={1}
                  weight={demoRange.min + 20}
                  reps={8}
                />
                <LogRow
                  type="set"
                  weight={demoRange.min + 10}
                  reps={5}
                  warmUp
                  showActions
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              </View>
              <LogRow type="space" />
              <LogRow type="exercise" title={demoExercise.name} />
            </>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={typography.label}>controls</Text>
          <InputSlider
            value={reps}
            minimumValue={1}
            maximumValue={20}
            step={1}
            prefix=""
            suffix="reps"
            onValueChange={setReps}
          />
          <InputSlider
            value={weight}
            minimumValue={demoRange.min}
            maximumValue={demoRange.max}
            step={demoExercise?.increment ?? 1}
            prefix=""
            suffix="kg"
            onValueChange={setWeight}
          />
          <InputToggle label="warm-up set" value={warmUp} onValueChange={setWarmUp} />
          <Button label="open bottom sheet" onPress={openSheet} variant="secondary" />
        </View>
      </ScrollView>

      <AppBottomSheet ref={sheetRef} title="add set">
        {demoExercise ? (
          <>
            <Text style={typography.para2}>
              {getExerciseById(demoExercise.id)?.name}
            </Text>
            <InputSlider
              value={reps}
              minimumValue={1}
              maximumValue={20}
              prefix=""
              suffix="reps"
              onValueChange={setReps}
            />
            <InputSlider
              value={weight}
              minimumValue={demoRange.min}
              maximumValue={demoRange.max}
              step={demoExercise.increment}
              prefix=""
              suffix="kg"
              onValueChange={setWeight}
            />
            <InputToggle label="warm-up set" value={warmUp} onValueChange={setWarmUp} />
            <Button label="record set" onPress={() => sheetRef.current?.dismiss()} />
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
  /** Set rows stack flush (border-only separators) per Figma log component */
  logStack: {
    gap: 0,
  },
});
