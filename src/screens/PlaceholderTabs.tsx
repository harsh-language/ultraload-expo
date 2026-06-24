import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBottomSheet } from '../components/AppBottomSheet';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { ScrollFadeView } from '../components/ScrollFadeView';
import { InputSlider } from '../components/InputSlider';
import { InputToggle } from '../components/InputToggle';
import { LogRow } from '../components/LogRow';
import { getExerciseById, getSelectableExercises } from '../domain/catalogue';
import { getDatabase } from '../db/client';
import { useProfileStore } from '../stores/profileSlice';
import { colors, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';
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
      <ScrollFadeView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <Text style={styles.screenTitle}>{TAB_LABELS[tab]}</Text>
        <Text style={styles.screenSubtitle}>
          stage 0 shell — shared components smoke test
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>profile</Text>
          <Text style={styles.dataText}>
            bodyweight: {bodyweight != null ? `${bodyweight} kg` : 'not set'}
          </Text>
          <PrimaryButton label="save 82.5 kg bodyweight" onPress={handleSaveBodyweight} trailingIcon="none" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>catalogue</Text>
          <Text style={styles.metaText}>
            {selectableExercises.length} selectable exercises
          </Text>
          <Text style={styles.dataText}>
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
          <Text style={styles.sectionLabel}>controls</Text>
          <InputSlider
            value={reps}
            minimumValue={1}
            maximumValue={20}
            step={1}
            suffix="reps"
            onValueChange={setReps}
          />
          <InputSlider
            value={weight}
            minimumValue={demoRange.min}
            maximumValue={demoRange.max}
            step={demoExercise?.increment ?? 1}
            suffix="kg"
            onValueChange={setWeight}
          />
          <InputToggle label="warm-up set" value={warmUp} onValueChange={setWarmUp} />
          <SecondaryButton label="open bottom sheet" onPress={openSheet} />
        </View>
      </ScrollFadeView>

      <AppBottomSheet ref={sheetRef} title="add set">
        {demoExercise ? (
          <>
            <Text style={styles.dataText}>
              {getExerciseById(demoExercise.id)?.name}
            </Text>
            <InputSlider
              value={reps}
              minimumValue={1}
              maximumValue={20}
              suffix="reps"
              onValueChange={setReps}
            />
            <InputSlider
              value={weight}
              minimumValue={demoRange.min}
              maximumValue={demoRange.max}
              step={demoExercise.increment}
              suffix="kg"
              onValueChange={setWeight}
            />
            <InputToggle label="warm-up set" value={warmUp} onValueChange={setWarmUp} />
            <PrimaryButton
              label="record set"
              onPress={() => sheetRef.current?.dismiss()}
              trailingIcon="none"
            />
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing['s-7'],
    paddingBottom: spacing['s-10'],
    gap: spacing['s-8'],
  },
  section: {
    gap: spacing['s-5'],
  },
  logStack: {
    gap: 0,
  },
  screenTitle: {
    ...typography.brand1,
    ...textCase.upper,
  },
  screenSubtitle: {
    ...typography.para4,
    ...textCase.lower,
  },
  sectionLabel: {
    ...typography.label,
    ...textCase.upper,
  },
  metaText: {
    ...typography.para4,
    ...textCase.lower,
  },
  dataText: {
    ...typography.para2,
    ...textCase.none,
  },
});
