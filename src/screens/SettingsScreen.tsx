import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
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
import { InputTag } from '../components/InputTag';
import { InputToggle } from '../components/InputToggle';
import {
  RemoveExerciseSheet,
  type RemoveExerciseSheetHandle,
} from '../components/RemoveExerciseSheet';
import { ScrollFadeView } from '../components/ScrollFadeView';
import { SecondaryButton } from '../components/SecondaryButton';
import { SectionDivider } from '../components/SectionDivider';
import { UnitOptionRow } from '../components/UnitOptionRow';
import { CircleCheckIcon } from '../components/icons/CircleCheckIcon';
import { CircleXIcon } from '../components/icons/CircleXIcon';
import { BackIcon } from '../components/icons/BackIcon';
import { getDatabase } from '../db/client';
import type { PerExerciseOverride } from '../db/schema';
import type { DisplayUnit } from '../data/exercise-catalogue';
import { getExerciseById, getSelectableExercises } from '../domain/catalogue';
import {
  OVERRIDE_INCREMENT_OPTIONS,
  applyCommonIncrement,
  clearExerciseOverride,
  getCommonIncrementOverride,
  isOverrideActive,
  patchExerciseOverride,
} from '../domain/exercise-overrides';
import {
  formatHeightDigits,
  inchesToHeightDigits,
  parseOptionalHeight,
} from '../domain/height-input';
import {
  BODYWEIGHT_MAX,
  BODYWEIGHT_MIN,
  sanitizeAge,
  sanitizeName,
  parseOptionalInt,
} from '../domain/profile-inputs';
import {
  REST_TIMER_MAX_SECONDS,
  REST_TIMER_MIN_SECONDS,
  clampRestTimerSeconds,
} from '../domain/rest-timer';
import {
  displayToKg,
  formatDisplayWeight,
  formatWeight,
  getUnitLabel,
  kgToDisplay,
  sanitizeDisplayWeightInput,
} from '../domain/units';
import type { MainStackParamList } from '../navigation/types';
import {
  usePlanStore,
  useProfileStore,
  useSettingsStore,
} from '../stores';
import { colors, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';

type Props = NativeStackScreenProps<MainStackParamList, 'Settings'>;

const WARM_UP_MIN_PERCENT = 10;
const WARM_UP_MAX_PERCENT = 70;
const WARM_UP_STEP_PERCENT = 5;

const UNIT_OPTIONS: { value: DisplayUnit; label: string }[] = [
  { value: 'kg', label: 'kg' },
  { value: 'lbs', label: 'lbs' },
  { value: 'stone', label: 'st' },
];

const INCREMENT_INDEX_OPTIONS = OVERRIDE_INCREMENT_OPTIONS;

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

function ageDisplayString(age: number | null): string {
  return age == null ? '' : String(age);
}

function heightDisplayString(heightInches: number | null): string {
  if (heightInches == null) {
    return '';
  }
  return formatHeightDigits(inchesToHeightDigits(heightInches));
}

export function SettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const removeSheetRef = useRef<RemoveExerciseSheetHandle>(null);

  const bodyweightKg = useProfileStore((s) => s.bodyweight);
  const nameValue = useProfileStore((s) => s.name);
  const heightInches = useProfileStore((s) => s.height);
  const ageValue = useProfileStore((s) => s.age);
  const units = useProfileStore((s) => s.units);
  const warmUpPercent = useProfileStore((s) => s.warmUpPercent);
  const warmUpAutoTagEnabled = useProfileStore((s) => s.warmUpAutoTagEnabled);
  const restTimerSeconds = useProfileStore((s) => s.restTimerSeconds);
  const updateProfile = useProfileStore((s) => s.updateProfile);

  const exerciseIds = usePlanStore((s) => s.exerciseIds);
  const updatePlan = usePlanStore((s) => s.updatePlan);

  const perExerciseOverrides = useSettingsStore((s) => s.perExerciseOverrides);
  const updateOverrides = useSettingsStore((s) => s.updateOverrides);

  const selectable = useMemo(() => getSelectableExercises(), []);
  const commonIncrement = useMemo(
    () => getCommonIncrementOverride(perExerciseOverrides, selectable),
    [perExerciseOverrides, selectable],
  );
  const commonIncrementEnabled = commonIncrement != null;

  const [bodyweightText, setBodyweightText] = useState(() =>
    bodyweightDisplayString(bodyweightKg, units),
  );
  const [heightText, setHeightText] = useState(() =>
    heightDisplayString(heightInches),
  );
  const [ageText, setAgeText] = useState(() => ageDisplayString(ageValue));
  const [nameText, setNameText] = useState(nameValue ?? '');
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(
    null,
  );
  const [commonIncrementDraft, setCommonIncrementDraft] = useState(
    commonIncrement ?? 2.5,
  );

  useEffect(() => {
    setBodyweightText(bodyweightDisplayString(bodyweightKg, units));
  }, [bodyweightKg, units]);

  useEffect(() => {
    setHeightText(heightDisplayString(heightInches));
  }, [heightInches]);

  useEffect(() => {
    setAgeText(ageDisplayString(ageValue));
  }, [ageValue]);

  useEffect(() => {
    setNameText(nameValue ?? '');
  }, [nameValue]);

  useEffect(() => {
    if (commonIncrement != null) {
      setCommonIncrementDraft(commonIncrement);
    }
  }, [commonIncrement]);

  const planExercises = useMemo(
    () =>
      exerciseIds
        .map((id) => getExerciseById(id))
        .filter((entry): entry is NonNullable<typeof entry> => entry != null),
    [exerciseIds],
  );

  const persistOverrides = useCallback(
    async (next: Record<string, PerExerciseOverride>) => {
      await updateOverrides(getDatabase(), next);
    },
    [updateOverrides],
  );

  const persistBodyweight = useCallback(async () => {
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
    await updateProfile(getDatabase(), {
      height: parseOptionalHeight(heightText),
    });
  }, [heightText, updateProfile]);

  const persistAge = useCallback(async () => {
    await updateProfile(getDatabase(), {
      age: parseOptionalInt(ageText),
    });
  }, [ageText, updateProfile]);

  const persistName = useCallback(async () => {
    await updateProfile(getDatabase(), {
      name: nameText.trim() || null,
    });
  }, [nameText, updateProfile]);

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

  const handleRemoveRequest = useCallback(
    (exerciseId: string) => {
      if (exerciseIds.length <= 1) {
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
    },
    [exerciseIds.length],
  );

  const handleRemoveConfirm = useCallback(
    async (exerciseId: string) => {
      const nextIds = exerciseIds.filter((id) => id !== exerciseId);
      await updatePlan(getDatabase(), nextIds);
      if (expandedExerciseId === exerciseId) {
        setExpandedExerciseId(null);
      }
    },
    [exerciseIds, expandedExerciseId, updatePlan],
  );

  const handleCommonIncrementToggle = useCallback(
    async (enabled: boolean) => {
      const next = applyCommonIncrement(
        perExerciseOverrides,
        selectable,
        enabled ? commonIncrementDraft : null,
      );
      await persistOverrides(next);
    },
    [
      commonIncrementDraft,
      perExerciseOverrides,
      persistOverrides,
      selectable,
    ],
  );

  const handleCommonIncrementChange = useCallback(
    async (index: number) => {
      const increment =
        INCREMENT_INDEX_OPTIONS[
          Math.min(INCREMENT_INDEX_OPTIONS.length - 1, Math.max(0, index))
        ]!;
      setCommonIncrementDraft(increment);
      if (!commonIncrementEnabled) {
        return;
      }
      const next = applyCommonIncrement(
        perExerciseOverrides,
        selectable,
        increment,
      );
      await persistOverrides(next);
    },
    [
      commonIncrementEnabled,
      perExerciseOverrides,
      persistOverrides,
      selectable,
    ],
  );

  const handleExerciseOverridePatch = useCallback(
    async (exerciseId: string, patch: Partial<PerExerciseOverride>) => {
      const next = patchExerciseOverride(
        perExerciseOverrides,
        exerciseId,
        patch,
      );
      await persistOverrides(next);
    },
    [perExerciseOverrides, persistOverrides],
  );

  const handleResetOverride = useCallback(
    async (exerciseId: string) => {
      const next = clearExerciseOverride(perExerciseOverrides, exerciseId);
      await persistOverrides(next);
    },
    [perExerciseOverrides, persistOverrides],
  );

  const incrementSliderIndex = INCREMENT_INDEX_OPTIONS.indexOf(
    commonIncrementDraft as (typeof INCREMENT_INDEX_OPTIONS)[number],
  );
  const incrementIndex =
    incrementSliderIndex >= 0 ? incrementSliderIndex : 1;

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing['s-8'] }]}>
      <View style={styles.titleBar}>
        <IconButton
          accessibilityLabel="back"
          onPress={() => navigation.goBack()}
        >
          <BackIcon />
        </IconButton>
        <Text style={styles.title}>settings</Text>
      </View>

      <ScrollFadeView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              Math.max(insets.bottom, spacing['s-8']) + spacing['s-8'],
          },
        ]}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <View style={styles.intro}>
          <Text style={styles.introTitle}>any updates made here will</Text>
          <View style={styles.introRow}>
            <CircleXIcon color={colors['content-2']} />
            <Text style={styles.introLine}>not affect past session</Text>
          </View>
          <View style={styles.introRow}>
            <CircleCheckIcon color={colors['content-1']} />
            <Text style={styles.introLine}>only affect future session</Text>
          </View>
        </View>

        <View style={styles.section}>
          <SectionDivider label="profile" />
          <View style={styles.stackGap8}>
            <InputComboUnit
              keyboardType="decimal-pad"
              leadingLabel="body weight :"
              onBlur={persistBodyweight}
              onChangeText={(value) =>
                setBodyweightText(sanitizeDisplayWeightInput(value))
              }
              placeholder="required"
              unit={getUnitLabel(units)}
              value={bodyweightText}
            />
            <InputHeightField
              leadingLabel="height :"
              onBlur={persistHeight}
              onChangeText={setHeightText}
              value={heightText}
            />
            <InputComboUnit
              keyboardType="number-pad"
              leadingLabel="age :"
              onBlur={persistAge}
              onChangeText={(value) => setAgeText(sanitizeAge(value))}
              placeholder="optional"
              unit="years"
              value={ageText}
            />
            <InputComboUnit
              autoCapitalize="none"
              leadingLabel="name :"
              onBlur={persistName}
              onChangeText={(value) => setNameText(sanitizeName(value))}
              placeholder="optional"
              unit=""
              value={nameText}
            />
          </View>
        </View>

        <View style={styles.section}>
          <SectionDivider label="exercises" />
          <View style={styles.stackGap5}>
            {planExercises.map((exercise) => {
              const expanded = expandedExerciseId === exercise.id;
              const override = perExerciseOverrides[exercise.id];

              return (
                <View key={exercise.id} style={styles.exerciseBlock}>
                  <InputTag
                    label={exercise.name}
                    onPress={() =>
                      setExpandedExerciseId(expanded ? null : exercise.id)
                    }
                    onRemove={() => handleRemoveRequest(exercise.id)}
                    removeDisabled={exerciseIds.length <= 1}
                    selected={expanded}
                  />
                  {expanded ? (
                    <ExerciseOverridePanel
                      catalogueIncrement={exercise.increment}
                      catalogueRange={exercise.sliderRange}
                      globalWarmUpPercent={warmUpPercent}
                      hideIncrement={commonIncrementEnabled}
                      onPatch={(patch) =>
                        handleExerciseOverridePatch(exercise.id, patch)
                      }
                      onReset={() => handleResetOverride(exercise.id)}
                      override={override}
                      units={units}
                    />
                  ) : null}
                </View>
              );
            })}
            <SecondaryButton
              label="add exercises"
              leadingIcon="plus"
              onPress={() => navigation.navigate('AddExercises')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <SectionDivider label="warmup sets" />
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
        </View>

        <View style={styles.section}>
          <SectionDivider label="weight ranges" />
          <View style={styles.stackGap8}>
            <UnitOptionRow
              caption="unit of measurement"
              onChange={(value) => {
                void handleUnitsChange(value);
              }}
              options={UNIT_OPTIONS}
              value={units}
            />
            <InputToggle
              label="use common weight increment for all exercises"
              onValueChange={(value) => {
                void handleCommonIncrementToggle(value);
              }}
              value={commonIncrementEnabled}
            />
            <InputSlider
              caption={{ emphasis: 'weight increment' }}
              captionPosition="above"
              disabled={!commonIncrementEnabled}
              formatValue={(index) => {
                const increment =
                  INCREMENT_INDEX_OPTIONS[
                    Math.min(
                      INCREMENT_INDEX_OPTIONS.length - 1,
                      Math.max(0, Math.round(index)),
                    )
                  ]!;
                return formatWeight(increment, units);
              }}
              maximumValue={INCREMENT_INDEX_OPTIONS.length - 1}
              minimumValue={0}
              onValueChange={(index) => {
                void handleCommonIncrementChange(Math.round(index));
              }}
              step={1}
              suffix={getUnitLabel(units)}
              value={incrementIndex}
            />
          </View>
        </View>

        <View style={styles.section}>
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
            step={1}
            suffix={restSettingSuffix(restTimerSeconds)}
            value={restTimerSeconds}
          />
        </View>
      </ScrollFadeView>

      <RemoveExerciseSheet
        ref={removeSheetRef}
        onConfirm={(id) => {
          void handleRemoveConfirm(id);
        }}
      />
    </View>
  );
}

interface ExerciseOverridePanelProps {
  override: PerExerciseOverride | undefined;
  catalogueRange: { min: number; max: number };
  catalogueIncrement: number;
  globalWarmUpPercent: number;
  units: DisplayUnit;
  hideIncrement?: boolean;
  onPatch: (patch: Partial<PerExerciseOverride>) => void;
  onReset: () => void;
}

function ExerciseOverridePanel({
  override,
  catalogueRange,
  catalogueIncrement,
  globalWarmUpPercent,
  units,
  hideIncrement = false,
  onPatch,
  onReset,
}: ExerciseOverridePanelProps) {
  const warmUp =
    override?.warmUpPercent ?? globalWarmUpPercent;
  const range = override?.sliderRange ?? catalogueRange;
  const increment = override?.increment ?? catalogueIncrement;
  const unitLabel = getUnitLabel(units);

  const [minText, setMinText] = useState(() =>
    formatDisplayWeight(kgToDisplay(range.min, units)),
  );
  const [maxText, setMaxText] = useState(() =>
    formatDisplayWeight(kgToDisplay(range.max, units)),
  );

  useEffect(() => {
    setMinText(formatDisplayWeight(kgToDisplay(range.min, units)));
    setMaxText(formatDisplayWeight(kgToDisplay(range.max, units)));
  }, [range.max, range.min, units]);

  const persistRange = useCallback(() => {
    const minDisplay = Number.parseFloat(minText);
    const maxDisplay = Number.parseFloat(maxText);
    if (!Number.isFinite(minDisplay) || !Number.isFinite(maxDisplay)) {
      setMinText(formatDisplayWeight(kgToDisplay(range.min, units)));
      setMaxText(formatDisplayWeight(kgToDisplay(range.max, units)));
      return;
    }
    const minKg = displayToKg(minDisplay, units);
    const maxKg = displayToKg(maxDisplay, units);
    if (minKg >= maxKg) {
      setMinText(formatDisplayWeight(kgToDisplay(range.min, units)));
      setMaxText(formatDisplayWeight(kgToDisplay(range.max, units)));
      return;
    }
    onPatch({ sliderRange: { min: minKg, max: maxKg } });
  }, [maxText, minText, onPatch, range.max, range.min, units]);

  const hasCustom = isOverrideActive(override);

  return (
    <View style={styles.overridePanel}>
      <InputSlider
        caption={{ support: 'warmup', emphasis: 'override %' }}
        captionPosition="above"
        formatValue={(value) => `${value}%`}
        maximumValue={WARM_UP_MAX_PERCENT}
        minimumValue={WARM_UP_MIN_PERCENT}
        onValueChange={(value) => onPatch({ warmUpPercent: value })}
        prefix="upto"
        step={WARM_UP_STEP_PERCENT}
        suffix=""
        value={warmUp}
      />
      <View style={styles.rangeRow}>
        <InputComboUnit
          keyboardType="decimal-pad"
          leadingLabel="min :"
          onBlur={persistRange}
          onChangeText={(value) =>
            setMinText(sanitizeDisplayWeightInput(value))
          }
          unit={unitLabel}
          value={minText}
        />
        <InputComboUnit
          keyboardType="decimal-pad"
          leadingLabel="max :"
          onBlur={persistRange}
          onChangeText={(value) =>
            setMaxText(sanitizeDisplayWeightInput(value))
          }
          unit={unitLabel}
          value={maxText}
        />
      </View>
      {hideIncrement ? null : (
        <UnitOptionRow
          caption="increment"
          onChange={(value) => onPatch({ increment: Number.parseFloat(value) })}
          options={OVERRIDE_INCREMENT_OPTIONS.map((option) => ({
            value: String(option),
          label: formatWeight(option, units),
          }))}
          value={String(increment)}
        />
      )}
      {hasCustom ? (
        <Pressable
          accessibilityRole="button"
          onPress={onReset}
          style={({ pressed }) => [
            styles.resetRow,
            pressed && styles.resetPressed,
          ]}
        >
          <Text style={styles.resetLabel}>reset to defaults</Text>
        </Pressable>
      ) : null}
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
    gap: spacing['s-5'],
    minHeight: spacing['s-12'],
    marginHorizontal: spacing['s-8'],
    marginBottom: spacing['s-8'],
  },
  title: {
    ...typography.brand1,
    ...textCase.upper,
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing['s-8'],
    gap: spacing['s-11'],
  },
  intro: {
    gap: spacing['s-5'],
    paddingVertical: spacing['s-8'],
  },
  introTitle: {
    ...typography.para2,
    ...textCase.lower,
  },
  introRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['s-5'],
  },
  introLine: {
    ...typography.para2,
    flex: 1,
    ...textCase.lower,
  },
  section: {
    gap: spacing['s-8'],
  },
  stackGap8: {
    gap: spacing['s-8'],
  },
  stackGap5: {
    gap: spacing['s-5'],
  },
  exerciseBlock: {
    gap: spacing['s-5'],
  },
  overridePanel: {
    gap: spacing['s-5'],
    paddingLeft: spacing['s-5'],
    borderLeftWidth: spacing['s-1'],
    borderLeftColor: colors['border-2'],
  },
  rangeRow: {
    gap: spacing['s-5'],
  },
  resetRow: {
    alignSelf: 'flex-start',
    paddingVertical: spacing['s-4'],
  },
  resetPressed: {
    opacity: 0.7,
  },
  resetLabel: {
    ...typography.para3,
    color: colors['content-2'],
    ...textCase.lower,
  },
});
