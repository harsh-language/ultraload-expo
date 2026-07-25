import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  Keyboard,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Accordion } from '../components/Accordion';
import { IconButton } from '../components/IconButton';
import { InputComboUnit } from '../components/InputComboUnit';
import { InputHeightField } from '../components/InputHeightField';
import { InputSlider } from '../components/InputSlider';
import { InputToggle } from '../components/InputToggle';
import { PlanExerciseTagRow } from '../components/PlanExerciseTagRow';
import { ScrollFadeView } from '../components/ScrollFadeView';
import { SecondaryButton } from '../components/SecondaryButton';
import { SectionDivider } from '../components/SectionDivider';
import { UnitOptionRow } from '../components/UnitOptionRow';
import { CircleCheckIcon } from '../components/icons/CircleCheckIcon';
import { CircleXIcon } from '../components/icons/CircleXIcon';
import { BackIcon } from '../components/icons/BackIcon';
import { getDatabase } from '../db/client';
import type { DisplayUnit } from '../data/exercise-catalogue';
import { getExerciseById } from '../domain/catalogue';
import {
  formatHeightDigits,
  inchesToHeightDigits,
  parseHeightForSave,
} from '../domain/height-input';
import {
  BODYWEIGHT_MAX,
  BODYWEIGHT_MIN,
  isValidBodyweight,
  parseAgeForSave,
  sanitizeAge,
} from '../domain/profile-inputs';
import { moveItemInList } from '../domain/reorder';
import {
  REST_TIMER_MAX_SECONDS,
  REST_TIMER_MIN_SECONDS,
  REST_TIMER_STEP_SECONDS,
  clampRestTimerSeconds,
} from '../domain/rest-timer';
import {
  displayToKg,
  formatDisplayWeight,
  getUnitLabel,
  kgToDisplay,
  sanitizeDisplayWeightInput,
} from '../domain/units';
import type { MainStackParamList } from '../navigation/types';
import { usePlanStore, useProfileStore } from '../stores';
import { shadowBelow } from '../theme/shadow';
import { colors, radii, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';

/** Figma session-title-bar fill — vertical content-trans-light → bg-trans-1 over bg-1 */
const TITLE_BAR_GRADIENT = [
  colors['content-trans-light'],
  colors['bg-trans-1'],
] as const;

type Props = NativeStackScreenProps<MainStackParamList, 'Settings'>;

const WARM_UP_MIN_PERCENT = 10;
const WARM_UP_MAX_PERCENT = 70;
const WARM_UP_STEP_PERCENT = 5;

const UNIT_OPTIONS: { value: DisplayUnit; label: string }[] = [
  { value: 'kg', label: 'kg' },
  { value: 'lbs', label: 'lbs' },
  { value: 'stone', label: 'st' },
];

function formatRestSetting(seconds: number): string {
  if (seconds < 60) {
    return String(seconds);
  }
  const minutes = seconds / 60;
  return Number.isInteger(minutes) ? String(minutes) : minutes.toFixed(1);
}

function restSettingSuffix(seconds: number): string {
  return seconds < 60 ? 's' : 'min';
}

function bodyweightDisplayString(
  bodyweightKg: number | null,
  units: DisplayUnit,
): string {
  if (bodyweightKg == null) {
    return '';
  }
  return formatDisplayWeight(kgToDisplay(bodyweightKg, units));
}

/** Empty / 0 age is cleared — optional for future wiring. */
function ageDisplayString(age: number | null): string {
  if (age == null || age === 0) {
    return '';
  }
  return String(age);
}

/** Empty / 0 height is cleared — optional for future wiring. */
function heightDisplayString(heightInches: number | null): string {
  if (heightInches == null || heightInches === 0) {
    return '';
  }
  return formatHeightDigits(inchesToHeightDigits(heightInches));
}

export function SettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const bodyweightKg = useProfileStore((s) => s.bodyweight);
  const heightInches = useProfileStore((s) => s.height);
  const ageValue = useProfileStore((s) => s.age);
  const units = useProfileStore((s) => s.units);
  const warmUpPercent = useProfileStore((s) => s.warmUpPercent);
  const warmUpAutoTagEnabled = useProfileStore((s) => s.warmUpAutoTagEnabled);
  const restTimerSeconds = useProfileStore((s) => s.restTimerSeconds);
  const updateProfile = useProfileStore((s) => s.updateProfile);

  const exerciseIds = usePlanStore((s) => s.exerciseIds);
  const updatePlan = usePlanStore((s) => s.updatePlan);

  const [bodyweightText, setBodyweightText] = useState(() =>
    bodyweightDisplayString(bodyweightKg, units),
  );
  const [heightText, setHeightText] = useState(() =>
    heightDisplayString(heightInches),
  );
  const [ageText, setAgeText] = useState(() => ageDisplayString(ageValue));
  const [reorderingExercises, setReorderingExercises] = useState(false);
  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null);
  const [dragHoverIndex, setDragHoverIndex] = useState<number | null>(null);

  useEffect(() => {
    setBodyweightText(bodyweightDisplayString(bodyweightKg, units));
  }, [bodyweightKg, units]);

  useEffect(() => {
    setHeightText(heightDisplayString(heightInches));
  }, [heightInches]);

  useEffect(() => {
    setAgeText(ageDisplayString(ageValue));
  }, [ageValue]);

  const planExercises = useMemo(
    () =>
      exerciseIds
        .map((id) => getExerciseById(id))
        .filter((entry): entry is NonNullable<typeof entry> => entry != null),
    [exerciseIds],
  );

  const persistBodyweight = useCallback(async () => {
    if (!isValidBodyweight(bodyweightText)) {
      setBodyweightText(bodyweightDisplayString(bodyweightKg, units));
      return;
    }
    const displayValue = Number.parseFloat(bodyweightText);
    const kg = displayToKg(displayValue, units);
    if (
      !Number.isFinite(kg) ||
      kg < BODYWEIGHT_MIN ||
      kg > BODYWEIGHT_MAX
    ) {
      setBodyweightText(bodyweightDisplayString(bodyweightKg, units));
      return;
    }
    await updateProfile(getDatabase(), { bodyweight: kg });
  }, [bodyweightKg, bodyweightText, units, updateProfile]);

  const persistHeight = useCallback(async () => {
    const next = parseHeightForSave(heightText);
    if (next === undefined) {
      setHeightText(heightDisplayString(heightInches));
      return;
    }
    await updateProfile(getDatabase(), { height: next });
  }, [heightInches, heightText, updateProfile]);

  const persistAge = useCallback(async () => {
    await updateProfile(getDatabase(), {
      age: parseAgeForSave(ageText),
    });
  }, [ageText, updateProfile]);

  const handleBodyweightChange = useCallback(
    (value: string) => {
      const next = sanitizeDisplayWeightInput(value);
      setBodyweightText(next);
      if (!isValidBodyweight(next)) {
        return;
      }
      const displayValue = Number.parseFloat(next);
      const kg = displayToKg(displayValue, units);
      if (
        !Number.isFinite(kg) ||
        kg < BODYWEIGHT_MIN ||
        kg > BODYWEIGHT_MAX
      ) {
        return;
      }
      void updateProfile(getDatabase(), { bodyweight: kg });
    },
    [units, updateProfile],
  );

  const handleHeightChange = useCallback(
    (value: string) => {
      setHeightText(value);
      const next = parseHeightForSave(value);
      if (next === undefined) {
        return;
      }
      void updateProfile(getDatabase(), { height: next });
    },
    [updateProfile],
  );

  const handleAgeChange = useCallback(
    (value: string) => {
      const next = sanitizeAge(value);
      setAgeText(next);
      void updateProfile(getDatabase(), { age: parseAgeForSave(next) });
    },
    [updateProfile],
  );

  const handleUnitsChange = useCallback(
    async (next: DisplayUnit) => {
      if (next === units) {
        return;
      }

      const displayValue = Number.parseFloat(bodyweightText);
      const draftKg = displayToKg(displayValue, units);
      const validDraft =
        Number.isFinite(draftKg) &&
        draftKg >= BODYWEIGHT_MIN &&
        draftKg <= BODYWEIGHT_MAX;
      const nextBodyweight = validDraft ? draftKg : bodyweightKg;

      if (nextBodyweight != null) {
        setBodyweightText(bodyweightDisplayString(nextBodyweight, next));
      }
      await updateProfile(getDatabase(), {
        bodyweight: nextBodyweight,
        units: next,
      });
    },
    [bodyweightKg, bodyweightText, units, updateProfile],
  );

  const handleRemove = useCallback(
    async (exerciseId: string) => {
      if (exerciseIds.length <= 1) {
        return;
      }
      const nextIds = exerciseIds.filter((id) => id !== exerciseId);
      await updatePlan(getDatabase(), nextIds);
    },
    [exerciseIds, updatePlan],
  );

  const handleExerciseDragStart = useCallback((index: number) => {
    setReorderingExercises(true);
    setDragFromIndex(index);
    setDragHoverIndex(index);
  }, []);

  const handleExerciseDragMove = useCallback(
    (_fromIndex: number, toIndex: number) => {
      setDragHoverIndex(toIndex);
    },
    [],
  );

  const handleExerciseDragEnd = useCallback(
    (fromIndex: number, toIndex: number) => {
      setReorderingExercises(false);
      setDragFromIndex(null);
      setDragHoverIndex(null);
      if (fromIndex === toIndex) {
        return;
      }
      const nextIds = moveItemInList(exerciseIds, fromIndex, toIndex);
      void updatePlan(getDatabase(), nextIds);
    },
    [exerciseIds, updatePlan],
  );

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
        <IconButton
          accessibilityLabel="back"
          onPress={() => navigation.goBack()}
          size="small"
        >
          <BackIcon />
        </IconButton>
        <Pressable onPress={Keyboard.dismiss} style={styles.titlePress}>
          <Text style={styles.title}>settings</Text>
        </Pressable>
      </View>

      <ScrollFadeView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              Math.max(insets.bottom, spacing['s-8']) + spacing['s-8'],
          },
        ]}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        scrollEnabled={!reorderingExercises}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        topFadeEnabled={false}
      >
        <Pressable onPress={Keyboard.dismiss} style={styles.dismissArea}>
        <View style={styles.intro}>
          <Text style={styles.introTitle}>any updates made here will</Text>
          <View style={styles.introRow}>
            <CircleXIcon color={colors['content-1']} />
            <Text style={styles.introLine}>not affect saved past sessions</Text>
          </View>
          <View style={styles.introRow}>
            <CircleCheckIcon color={colors['content-1']} />
            <Text style={styles.introLine}>only affect future sessions</Text>
          </View>
        </View>

        <SectionDivider label="profile" />
        <View style={styles.stackGap8}>
          <InputComboUnit
            keyboardType="decimal-pad"
            leadingLabel="body weight :"
            onBlur={persistBodyweight}
            onChangeText={handleBodyweightChange}
            unit={getUnitLabel(units)}
            value={bodyweightText}
          />
          <InputHeightField
            leadingLabel="height :"
            onBlur={persistHeight}
            onChangeText={handleHeightChange}
            placeholder=""
            value={heightText}
          />
          <InputComboUnit
            keyboardType="number-pad"
            leadingLabel="age :"
            onBlur={persistAge}
            onChangeText={handleAgeChange}
            unit="years"
            value={ageText}
          />
        </View>

        <SectionDivider label="exercises" />
        <View style={styles.stackGap5}>
          {planExercises.map((exercise, index) => (
            <PlanExerciseTagRow
              key={exercise.id}
              count={planExercises.length}
              dragFromIndex={dragFromIndex}
              dragHoverIndex={dragHoverIndex}
              index={index}
              label={exercise.name}
              onDragEnd={handleExerciseDragEnd}
              onDragMove={handleExerciseDragMove}
              onDragStart={handleExerciseDragStart}
              onRemove={() => {
                void handleRemove(exercise.id);
              }}
              removeDisabled={exerciseIds.length <= 1}
            />
          ))}
          <SecondaryButton
            label="add exercises"
            leadingIcon="plus"
            onPress={() => navigation.navigate('AddExercises')}
          />
        </View>

        <SectionDivider label="warmup sets" />
        <View style={styles.stackGap11}>
          <View style={styles.stackGap8}>
            <InputToggle
              label={['automatically tag ', 'warmup sets']}
              onValueChange={(value) => {
                void updateProfile(getDatabase(), {
                  warmUpAutoTagEnabled: value,
                });
              }}
              value={warmUpAutoTagEnabled}
            />
            <Accordion
              items={[
                'autotags set below a fixed weight %',
                'starts tagging after 2nd session',
                'manual tagging still available',
              ]}
              title="how automatic tagging works"
            />
          </View>
          <InputSlider
            caption={{
              support: 'warmup weight % of',
              emphasis: '6-rep max',
            }}
            captionPosition="above"
            disabled={!warmUpAutoTagEnabled}
            formatValue={(value) => `${value}%`}
            maximumValue={WARM_UP_MAX_PERCENT}
            minimumValue={WARM_UP_MIN_PERCENT}
            onValueChange={(value) => {
              void updateProfile(getDatabase(), { warmUpPercent: value });
            }}
            prefix="upto"
            step={WARM_UP_STEP_PERCENT}
            suffix=""
            value={warmUpPercent}
          />
        </View>

        <SectionDivider label="weight ranges" />
        <UnitOptionRow
          caption="unit of measurement"
          onChange={(value) => {
            void handleUnitsChange(value);
          }}
          options={UNIT_OPTIONS}
          value={units}
        />

        <SectionDivider label="rest timer" />
        <InputSlider
          caption={{ emphasis: 'optional timer between sets' }}
          captionPosition="above"
          formatValue={formatRestSetting}
          maximumValue={REST_TIMER_MAX_SECONDS}
          minimumValue={REST_TIMER_MIN_SECONDS}
          onValueChange={(value) => {
            void updateProfile(getDatabase(), {
              restTimerSeconds: clampRestTimerSeconds(value),
            });
          }}
          step={REST_TIMER_STEP_SECONDS}
          suffix={restSettingSuffix(restTimerSeconds)}
          value={restTimerSeconds}
        />
        </Pressable>
      </ScrollFadeView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors['bg-1'],
  },
  scroll: {
    flex: 1,
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
  },
  titlePress: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing['s-8'],
    paddingTop: spacing['s-12'],
    flexGrow: 1,
  },
  dismissArea: {
    flexGrow: 1,
    gap: spacing['s-12'],
  },
  intro: {
    gap: spacing['s-5'],
    padding: spacing['s-8'],
    backgroundColor: colors['bg-2'],
    borderWidth: spacing['s-1'],
    borderColor: colors['border-2'],
    borderStyle: 'dashed',
    borderRadius: radii['r-h-48'],
    overflow: 'hidden',
  },
  introTitle: {
    ...typography.para4,
    color: colors['content-1'],
    ...textCase.lower,
  },
  introRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing['s-5'],
  },
  introLine: {
    ...typography.para4,
    color: colors['content-1'],
    flex: 1,
    ...textCase.lower,
  },
  stackGap11: {
    gap: spacing['s-11'],
  },
  stackGap8: {
    gap: spacing['s-8'],
  },
  stackGap5: {
    gap: spacing['s-5'],
  },
});
