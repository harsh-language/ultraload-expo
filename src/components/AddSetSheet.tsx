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
import { getExerciseById, getExerciseLabel } from '../domain/catalogue';
import {
  getExerciseIncrement,
  getExerciseSliderRange,
} from '../domain/ranges';
import {
  getAddSetRecordLabel,
  getNextStandardSetIndex,
} from '../domain/set-labels';
import {
  getLastStandardSetWeightToday,
  shouldAutoTagWarmUp,
  type TodayWorkoutForWarmUp,
} from '../domain/warmup';

const REPS_MIN = 1;
const REPS_MAX = 20;
const REPS_STEP = 1;

export interface AddSetSheetHandle {
  present: () => void;
}

interface AddSetSheetProps {
  exerciseIds: string[];
  bodyweight: number | null;
  warmUpAutoTagEnabled: boolean;
  warmUpPercent: number;
  todayWorkout: TodayWorkoutForWarmUp | null;
  onRecord: (payload: {
    exerciseId: string;
    weight: number;
    reps: number;
    warmUp: boolean;
  }) => void;
  onVisibilityChange?: (visible: boolean) => void;
}

function getWarmUpForDraft(
  exerciseId: string,
  weight: number,
  bodyweight: number | null,
  warmUpAutoTagEnabled: boolean,
  warmUpPercent: number,
  todayWorkout: TodayWorkoutForWarmUp | null,
): boolean {
  const exercise = getExerciseById(exerciseId);
  if (!exercise) {
    return false;
  }

  const referenceWeight = getLastStandardSetWeightToday(todayWorkout, exerciseId);

  return shouldAutoTagWarmUp({
    exercise,
    weight,
    bodyweight,
    warmUpAutoTagEnabled,
    warmUpPercent,
    referenceWeight,
  });
}

function selectExercise(
  id: string,
  bodyweight: number | null,
  warmUpAutoTagEnabled: boolean,
  warmUpPercent: number,
  todayWorkout: TodayWorkoutForWarmUp | null,
) {
  const nextExercise = getExerciseById(id);
  if (!nextExercise) {
    return null;
  }

  const nextRange = getExerciseSliderRange(nextExercise, bodyweight);

  return {
    exerciseId: id,
    weight: nextRange.min,
    warmUp: getWarmUpForDraft(
      id,
      nextRange.min,
      bodyweight,
      warmUpAutoTagEnabled,
      warmUpPercent,
      todayWorkout,
    ),
  };
}

export const AddSetSheet = forwardRef<AddSetSheetHandle, AddSetSheetProps>(
  function AddSetSheet(
    {
      exerciseIds,
      bodyweight,
      warmUpAutoTagEnabled,
      warmUpPercent,
      todayWorkout,
      onRecord,
      onVisibilityChange,
    },
    ref,
  ) {
    const sheetRef = useRef<BottomSheetModal>(null);
    const draftInitializedRef = useRef(false);
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

    const sliderRange = useMemo(() => {
      if (!exercise) {
        return { min: 0, max: 100 };
      }
      return getExerciseSliderRange(exercise, bodyweight);
    }, [exercise, bodyweight]);

    const increment = exercise ? getExerciseIncrement(exercise) : 1;

    const initializeDraft = useCallback(() => {
      const nextExerciseId = exerciseIds[0] ?? '';
      const selection = nextExerciseId
        ? selectExercise(
            nextExerciseId,
            bodyweight,
            warmUpAutoTagEnabled,
            warmUpPercent,
            todayWorkout,
          )
        : null;

      setExerciseId(nextExerciseId);
      setReps(REPS_MIN);
      setWeight(selection?.weight ?? 0);
      setWarmUpTouched(false);
      setWarmUp(selection?.warmUp ?? false);
    }, [
      bodyweight,
      exerciseIds,
      todayWorkout,
      warmUpAutoTagEnabled,
      warmUpPercent,
    ]);

    const refreshWarmUpDraft = useCallback(() => {
      setWarmUpTouched(false);
      setWarmUp(
        getWarmUpForDraft(
          exerciseId,
          weight,
          bodyweight,
          warmUpAutoTagEnabled,
          warmUpPercent,
          todayWorkout,
        ),
      );
    }, [
      bodyweight,
      exerciseId,
      todayWorkout,
      warmUpAutoTagEnabled,
      warmUpPercent,
      weight,
    ]);

    useImperativeHandle(ref, () => ({
      present: () => {
        if (!draftInitializedRef.current) {
          initializeDraft();
          draftInitializedRef.current = true;
        } else {
          refreshWarmUpDraft();
        }
        sheetRef.current?.present();
      },
    }));

    useEffect(() => {
      if (!exerciseId || warmUpTouched) {
        return;
      }

      setWarmUp(
        getWarmUpForDraft(
          exerciseId,
          weight,
          bodyweight,
          warmUpAutoTagEnabled,
          warmUpPercent,
          todayWorkout,
        ),
      );
    }, [
      exerciseId,
      weight,
      bodyweight,
      warmUpAutoTagEnabled,
      warmUpPercent,
      todayWorkout,
      warmUpTouched,
    ]);

    useEffect(() => {
      if (exerciseIds.length > 0 && !exerciseIds.includes(exerciseId)) {
        setExerciseId(exerciseIds[0]);
        setWarmUpTouched(false);
      }
    }, [exerciseId, exerciseIds]);

    const handleRecord = useCallback(() => {
      if (!exerciseId) {
        return;
      }

      onRecord({ exerciseId, weight, reps, warmUp });
      sheetRef.current?.dismiss();
    }, [exerciseId, onRecord, reps, warmUp, weight]);

    const handleWarmUpChange = useCallback((value: boolean) => {
      setWarmUpTouched(true);
      setWarmUp(value);
    }, []);

    const handleNavigateExercise = useCallback(
      (delta: -1 | 1) => {
        const targetIndex = exerciseIndex + delta;
        if (targetIndex < 0 || targetIndex >= exerciseIds.length) {
          return;
        }

        setExerciseId(exerciseIds[targetIndex]);
        setWarmUpTouched(false);
      },
      [exerciseIds, exerciseIndex],
    );

    const handlePreviousExercise = useCallback(
      () => handleNavigateExercise(-1),
      [handleNavigateExercise],
    );

    const handleNextExercise = useCallback(
      () => handleNavigateExercise(1),
      [handleNavigateExercise],
    );

    const recordLabel = useMemo(
      () =>
        getAddSetRecordLabel({
          warmUp,
          nextStandardSetIndex: getNextStandardSetIndex(
            todayWorkout,
            exerciseId,
          ),
        }),
      [todayWorkout, exerciseId, warmUp],
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
              leadingIcon="plus"
              onPress={handleRecord}
              style={styles.recordButton}
              trailingIcon="none"
            />
          </>
        }
        title="add new set"
      >
        <ExerciseDropdown
          canNext={exerciseIndex >= 0 && exerciseIndex < exerciseIds.length - 1}
          canPrevious={exerciseIndex > 0}
          label={getExerciseLabel(exerciseId)}
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
          formatValue={(value) => value.toFixed(increment < 1 ? 1 : 0)}
          maximumValue={sliderRange.max}
          minimumValue={sliderRange.min}
          onValueChange={setWeight}
          step={increment}
          suffix="kg"
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
