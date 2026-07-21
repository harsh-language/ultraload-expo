import { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet } from 'react-native';
import { AppBottomSheet } from './AppBottomSheet';
import { ExerciseDropdown } from './ExerciseDropdown';
import { InputSlider } from './InputSlider';
import { Warmup } from './Warmup';
import { PrimaryButton } from './PrimaryButton';
import type { DisplayUnit } from '../data/exercise-catalogue';
import type { PerExerciseOverride } from '../db/schema';
import { getLastSetToday } from '../domain/defaults';
import { getExerciseById, getExerciseLabel } from '../domain/catalogue';
import {
  getExerciseIncrement,
  getExerciseSliderRange,
} from '../domain/ranges';
import {
  getAddSetRecordLabel,
  getEditSetRecordLabel,
  getNextStandardSetIndex,
} from '../domain/set-labels';
import { formatWeight, getUnitLabel } from '../domain/units';
import {
  getEffectiveWarmUpPercent,
  shouldAutoTagWarmUp,
  type TodayWorkoutForWarmUp,
} from '../domain/warmup';

const REPS_MIN = 1;
const REPS_MAX = 20;
const REPS_STEP = 1;

type SheetMode = 'add' | 'edit';

export interface EditableSet {
  id: number;
  exerciseId: string;
  weight: number;
  reps: number;
  warmUp: boolean;
}

export interface AddSetSheetHandle {
  present: () => void;
  presentForEdit: (set: EditableSet) => void;
  dismiss: () => void;
}

interface AddSetSheetProps {
  exerciseIds: string[];
  units: DisplayUnit;
  warmUpAutoTagEnabled: boolean;
  warmUpPercent: number;
  perExerciseOverrides: Record<string, PerExerciseOverride>;
  todayWorkout: TodayWorkoutForWarmUp | null;
  referenceWeightByExerciseId: Record<string, number | null>;
  onRecord: (payload: {
    exerciseId: string;
    weight: number;
    reps: number;
    warmUp: boolean;
  }) => void;
  onUpdate: (
    setId: number,
    payload: {
      exerciseId: string;
      weight: number;
      reps: number;
      warmUp: boolean;
    },
  ) => void;
  onVisibilityChange?: (visible: boolean) => void;
}

interface DraftContext {
  warmUpAutoTagEnabled: boolean;
  warmUpPercent: number;
  perExerciseOverrides: Record<string, PerExerciseOverride>;
  todayWorkout: TodayWorkoutForWarmUp | null;
  referenceWeightByExerciseId: Record<string, number | null>;
}

function getWarmUpForDraft(
  exerciseId: string,
  weight: number,
  context: DraftContext,
): boolean {
  const exercise = getExerciseById(exerciseId);
  if (!exercise) {
    return false;
  }

  const override = context.perExerciseOverrides[exerciseId] ?? null;
  const referenceWeight =
    context.referenceWeightByExerciseId[exerciseId] ?? null;

  return shouldAutoTagWarmUp({
    weight,
    warmUpAutoTagEnabled: context.warmUpAutoTagEnabled,
    warmUpPercent: getEffectiveWarmUpPercent(context.warmUpPercent, override),
    referenceWeight,
  });
}

function getExerciseDraft(exerciseId: string, context: DraftContext) {
  const exercise = getExerciseById(exerciseId);
  if (!exercise) {
    return null;
  }

  const override = context.perExerciseOverrides[exerciseId] ?? null;
  const sliderRange = getExerciseSliderRange(exercise, override);
  const lastSet = getLastSetToday(context.todayWorkout, exerciseId);
  const weight = lastSet?.weight ?? sliderRange.min;
  const reps = lastSet?.reps ?? REPS_MIN;

  return {
    exerciseId,
    weight,
    reps,
    warmUp: getWarmUpForDraft(exerciseId, weight, context),
  };
}

export const AddSetSheet = forwardRef<AddSetSheetHandle, AddSetSheetProps>(
  function AddSetSheet(
    {
      exerciseIds,
      units,
      warmUpAutoTagEnabled,
      warmUpPercent,
      perExerciseOverrides,
      todayWorkout,
      referenceWeightByExerciseId,
      onRecord,
      onUpdate,
      onVisibilityChange,
    },
    ref,
  ) {
    const sheetRef = useRef<BottomSheetModal>(null);
    const [mode, setMode] = useState<SheetMode>('add');
    const [editingSetId, setEditingSetId] = useState<number | null>(null);
    const [exerciseId, setExerciseId] = useState(exerciseIds[0] ?? '');
    const [reps, setReps] = useState(REPS_MIN);
    const [weight, setWeight] = useState(0);
    const [warmUp, setWarmUp] = useState(false);
    const [warmUpTouched, setWarmUpTouched] = useState(false);

    const exercise = useMemo(
      () => (exerciseId ? getExerciseById(exerciseId) : undefined),
      [exerciseId],
    );

    const exerciseIndex = exerciseIds.indexOf(exerciseId);
    const override = exerciseId
      ? (perExerciseOverrides[exerciseId] ?? null)
      : null;

    const sliderRange = useMemo(() => {
      if (!exercise) {
        return { min: 0, max: 100 };
      }
      return getExerciseSliderRange(exercise, override);
    }, [exercise, override]);

    const increment = exercise
      ? getExerciseIncrement(exercise, override)
      : 1;

    const draftContext = useMemo<DraftContext>(
      () => ({
        warmUpAutoTagEnabled,
        warmUpPercent,
        perExerciseOverrides,
        todayWorkout,
        referenceWeightByExerciseId,
      }),
      [
        perExerciseOverrides,
        referenceWeightByExerciseId,
        todayWorkout,
        warmUpAutoTagEnabled,
        warmUpPercent,
      ],
    );

    const applyDraftFields = useCallback(
      (
        nextExerciseId: string,
        draft: { reps: number; weight: number; warmUp: boolean } | null,
      ) => {
        setExerciseId(nextExerciseId);
        setReps(draft?.reps ?? REPS_MIN);
        setWeight(draft?.weight ?? 0);
        setWarmUpTouched(false);
        setWarmUp(draft?.warmUp ?? false);
      },
      [],
    );

    const initializeAddDraft = useCallback(() => {
      const nextExerciseId = exerciseIds[0] ?? '';
      const draft = nextExerciseId
        ? getExerciseDraft(nextExerciseId, draftContext)
        : null;

      setMode('add');
      setEditingSetId(null);
      applyDraftFields(nextExerciseId, draft);
    }, [applyDraftFields, draftContext, exerciseIds]);

    const initializeEditDraft = useCallback((set: EditableSet) => {
      setMode('edit');
      setEditingSetId(set.id);
      setExerciseId(set.exerciseId);
      setReps(set.reps);
      setWeight(set.weight);
      setWarmUp(set.warmUp);
      setWarmUpTouched(true);
    }, []);

    useImperativeHandle(ref, () => ({
      present: () => {
        initializeAddDraft();
        sheetRef.current?.present();
      },
      presentForEdit: (set: EditableSet) => {
        initializeEditDraft(set);
        sheetRef.current?.present();
      },
      dismiss: () => {
        sheetRef.current?.dismiss();
      },
    }));

    useEffect(() => {
      if (!exerciseId || warmUpTouched || mode === 'edit') {
        return;
      }

      setWarmUp(getWarmUpForDraft(exerciseId, weight, draftContext));
    }, [draftContext, exerciseId, mode, warmUpTouched, weight]);

    useEffect(() => {
      if (exerciseIds.length > 0 && !exerciseIds.includes(exerciseId)) {
        setExerciseId(exerciseIds[0]);
        setWarmUpTouched(false);
      }
    }, [exerciseId, exerciseIds]);

    const handleSave = useCallback(() => {
      if (!exerciseId) {
        return;
      }

      const payload = { exerciseId, weight, reps, warmUp };

      if (mode === 'edit' && editingSetId != null) {
        onUpdate(editingSetId, payload);
      } else {
        onRecord(payload);
      }

      sheetRef.current?.dismiss();
    }, [
      editingSetId,
      exerciseId,
      mode,
      onRecord,
      onUpdate,
      reps,
      warmUp,
      weight,
    ]);

    const handleWarmUpChange = useCallback((value: boolean) => {
      setWarmUpTouched(true);
      setWarmUp(value);
    }, []);

    const applyExerciseDraft = useCallback(
      (nextExerciseId: string) => {
        const draft = getExerciseDraft(nextExerciseId, draftContext);
        if (!draft) {
          return;
        }

        applyDraftFields(nextExerciseId, draft);
      },
      [applyDraftFields, draftContext],
    );

    const handleNavigateExercise = useCallback(
      (delta: -1 | 1) => {
        if (mode === 'edit') {
          return;
        }

        const targetIndex = exerciseIndex + delta;
        if (targetIndex < 0 || targetIndex >= exerciseIds.length) {
          return;
        }

        applyExerciseDraft(exerciseIds[targetIndex]);
      },
      [applyExerciseDraft, exerciseIds, exerciseIndex, mode],
    );

    const handlePreviousExercise = useCallback(
      () => handleNavigateExercise(-1),
      [handleNavigateExercise],
    );

    const handleNextExercise = useCallback(
      () => handleNavigateExercise(1),
      [handleNavigateExercise],
    );

    const recordLabel = useMemo(() => {
      if (mode === 'edit') {
        return getEditSetRecordLabel(warmUp);
      }

      return getAddSetRecordLabel({
        warmUp,
        nextStandardSetIndex: getNextStandardSetIndex(todayWorkout, exerciseId),
      });
    }, [exerciseId, mode, todayWorkout, warmUp]);

    const unitLabel = getUnitLabel(units);
    const formatWeightValue = useCallback(
      (valueKg: number) => formatWeight(valueKg, units),
      [units],
    );

    if (exerciseIds.length === 0) {
      return null;
    }

    return (
      <AppBottomSheet
        ref={sheetRef}
        onVisibilityChange={onVisibilityChange}
        footer={
          <>
            <Warmup onValueChange={handleWarmUpChange} value={warmUp} />
            <PrimaryButton
              label={recordLabel}
              leadingIcon="none"
              onPress={handleSave}
              style={styles.recordButton}
              trailingIcon={mode === 'add' ? 'plus' : 'check'}
            />
          </>
        }
        title={mode === 'edit' ? 'edit set' : 'add new set'}
      >
        <ExerciseDropdown
          canNext={exerciseIndex >= 0 && exerciseIndex < exerciseIds.length - 1}
          canPrevious={exerciseIndex > 0}
          label={getExerciseLabel(exerciseId)}
          navigationDisabled={mode === 'edit'}
          onNext={handleNextExercise}
          onPrevious={handlePreviousExercise}
        />

        <InputSlider
          maximumValue={REPS_MAX}
          minimumValue={REPS_MIN}
          onValueChange={setReps}
          step={REPS_STEP}
          suffix="reps"
          value={reps}
        />

        <InputSlider
          formatValue={formatWeightValue}
          maximumValue={sliderRange.max}
          minimumValue={sliderRange.min}
          onValueChange={setWeight}
          step={increment}
          suffix={unitLabel}
          value={weight}
        />
      </AppBottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  recordButton: {
    flex: 1,
  },
});
