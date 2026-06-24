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
import { IconButton } from './IconButton';
import { InputSlider } from './InputSlider';
import { InputToggle } from './InputToggle';
import { PrimaryButton } from './PrimaryButton';
import { BackIcon } from './icons/BackIcon';
import { getExerciseById, getExerciseLabel } from '../domain/catalogue';
import {
  getExerciseIncrement,
  getExerciseSliderRange,
} from '../domain/ranges';
import { shouldAutoTagWarmUp } from '../domain/warmup';

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
  onRecord: (payload: {
    exerciseId: string;
    weight: number;
    reps: number;
    warmUp: boolean;
  }) => void;
}

function selectExercise(
  id: string,
  bodyweight: number | null,
  warmUpAutoTagEnabled: boolean,
) {
  const nextExercise = getExerciseById(id);
  if (!nextExercise) {
    return null;
  }

  const nextRange = getExerciseSliderRange(nextExercise, bodyweight);
  return {
    exerciseId: id,
    weight: nextRange.min,
    warmUp: shouldAutoTagWarmUp({
      exercise: nextExercise,
      weight: nextRange.min,
      bodyweight,
      warmUpAutoTagEnabled,
    }),
  };
}

export const AddSetSheet = forwardRef<AddSetSheetHandle, AddSetSheetProps>(
  function AddSetSheet(
    { exerciseIds, bodyweight, warmUpAutoTagEnabled, onRecord },
    ref,
  ) {
    const sheetRef = useRef<BottomSheetModal>(null);
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

    const resetDraft = useCallback(() => {
      const nextExerciseId = exerciseIds[0] ?? '';
      const selection = nextExerciseId
        ? selectExercise(nextExerciseId, bodyweight, warmUpAutoTagEnabled)
        : null;

      setExerciseId(nextExerciseId);
      setReps(REPS_MIN);
      setWeight(selection?.weight ?? 0);
      setWarmUpTouched(false);
      setWarmUp(selection?.warmUp ?? false);
    }, [bodyweight, exerciseIds, warmUpAutoTagEnabled]);

    useImperativeHandle(ref, () => ({
      present: () => {
        resetDraft();
        sheetRef.current?.present();
      },
    }));

    useEffect(() => {
      if (!exercise || warmUpTouched) {
        return;
      }

      setWarmUp(
        shouldAutoTagWarmUp({
          exercise,
          weight,
          bodyweight,
          warmUpAutoTagEnabled,
        }),
      );
    }, [exercise, weight, bodyweight, warmUpAutoTagEnabled, warmUpTouched]);

    useEffect(() => {
      if (exerciseIds.length > 0 && !exerciseIds.includes(exerciseId)) {
        const selection = selectExercise(
          exerciseIds[0],
          bodyweight,
          warmUpAutoTagEnabled,
        );
        setExerciseId(exerciseIds[0]);
        if (selection) {
          setWeight(selection.weight);
          setWarmUp(selection.warmUp);
        }
      }
    }, [exerciseId, exerciseIds, bodyweight, warmUpAutoTagEnabled]);

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

        const nextId = exerciseIds[targetIndex];
        const selection = selectExercise(
          nextId,
          bodyweight,
          warmUpAutoTagEnabled,
        );
        if (!selection) {
          return;
        }

        setExerciseId(selection.exerciseId);
        setWeight(selection.weight);
        setWarmUpTouched(false);
        setWarmUp(selection.warmUp);
      },
      [bodyweight, exerciseIds, exerciseIndex, warmUpAutoTagEnabled],
    );

    const handlePreviousExercise = useCallback(
      () => handleNavigateExercise(-1),
      [handleNavigateExercise],
    );

    const handleNextExercise = useCallback(
      () => handleNavigateExercise(1),
      [handleNavigateExercise],
    );

    if (exerciseIds.length === 0) {
      return null;
    }

    return (
      <AppBottomSheet
        ref={sheetRef}
        footer={
          <>
            <IconButton
              accessibilityLabel="back"
              onPress={() => sheetRef.current?.dismiss()}
            >
              <BackIcon />
            </IconButton>
            <PrimaryButton
              label="record set"
              leadingIcon="plus"
              onPress={handleRecord}
              style={styles.recordButton}
              trailingIcon="none"
            />
          </>
        }
        showHeaderBack={false}
        title="add set"
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

        <InputToggle
          label="warm-up set"
          onValueChange={handleWarmUpChange}
          value={warmUp}
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
