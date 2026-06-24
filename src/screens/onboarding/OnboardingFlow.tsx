import { useCallback, useState } from 'react';
import { isValidBodyweight } from '../../domain/profile-inputs';
import { DEFAULT_PROFILE } from '../../db/repositories';
import { getDatabase } from '../../db/client';
import {
  usePlanStore,
  useProfileStore,
} from '../../stores';
import { BodyweightStep } from './BodyweightStep';
import { ExercisePickerStep } from './ExercisePickerStep';
import { OnboardingPager } from './OnboardingPager';
import { RestTimerStep } from './RestTimerStep';
import { WarmUpStep } from './WarmUpStep';
import type { OnboardingStep } from './onboardingSteps';

interface OnboardingFlowProps {
  onComplete: () => void;
}

function parseOptionalInt(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const completeOnboarding = useProfileStore((state) => state.completeOnboarding);
  const updatePlan = usePlanStore((state) => state.updatePlan);

  const [step, setStep] = useState<OnboardingStep>('bodyweight');
  const [bodyweight, setBodyweight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [name, setName] = useState('');
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);
  const [restTimerSeconds, setRestTimerSeconds] = useState(
    DEFAULT_PROFILE.restTimerSeconds,
  );
  const [warmUpPercent, setWarmUpPercent] = useState(DEFAULT_PROFILE.warmUpPercent);
  const [warmUpAutoTagEnabled, setWarmUpAutoTagEnabled] = useState(
    DEFAULT_PROFILE.warmUpAutoTagEnabled,
  );
  const [completing, setCompleting] = useState(false);

  const toggleExercise = useCallback((exerciseId: string) => {
    setSelectedExerciseIds((current) =>
      current.includes(exerciseId)
        ? current.filter((id) => id !== exerciseId)
        : [...current, exerciseId],
    );
  }, []);

  const handleComplete = useCallback(async () => {
    if (completing) {
      return;
    }

    if (!isValidBodyweight(bodyweight)) {
      return;
    }

    const parsedBodyweight = Number.parseFloat(bodyweight);

    setCompleting(true);
    try {
      const db = getDatabase();
      await completeOnboarding(db, {
        bodyweight: parsedBodyweight,
        name: name.trim() || null,
        height: null,
        age: parseOptionalInt(age),
        restTimerSeconds,
        warmUpPercent,
        warmUpAutoTagEnabled,
      });
      await updatePlan(db, selectedExerciseIds);
      onComplete();
    } finally {
      setCompleting(false);
    }
  }, [
    age,
    bodyweight,
    completeOnboarding,
    completing,
    name,
    onComplete,
    restTimerSeconds,
    selectedExerciseIds,
    updatePlan,
    warmUpAutoTagEnabled,
    warmUpPercent,
  ]);

  const renderStep = useCallback(
    (panelStep: OnboardingStep) => {
      switch (panelStep) {
        case 'bodyweight':
          return (
            <BodyweightStep
              age={age}
              bodyweight={bodyweight}
              height={height}
              name={name}
              onAgeChange={setAge}
              onBodyweightChange={setBodyweight}
              onHeightChange={setHeight}
              onNameChange={setName}
              onNext={() => setStep('exercises')}
            />
          );
        case 'exercises':
          return (
            <ExercisePickerStep
              onBack={() => setStep('bodyweight')}
              onNext={() => setStep('rest')}
              onToggle={toggleExercise}
              selectedIds={selectedExerciseIds}
            />
          );
        case 'rest':
          return (
            <RestTimerStep
              onBack={() => setStep('exercises')}
              onNext={() => setStep('warmup')}
              onRestTimerChange={setRestTimerSeconds}
              restTimerSeconds={restTimerSeconds}
            />
          );
        case 'warmup':
          return (
            <WarmUpStep
              completing={completing}
              onBack={() => setStep('rest')}
              onComplete={handleComplete}
              onWarmUpAutoTagChange={setWarmUpAutoTagEnabled}
              onWarmUpChange={setWarmUpPercent}
              warmUpAutoTagEnabled={warmUpAutoTagEnabled}
              warmUpPercent={warmUpPercent}
            />
          );
        default: {
          const _exhaustive: never = panelStep;
          return _exhaustive;
        }
      }
    },
    [
      age,
      bodyweight,
      completing,
      handleComplete,
      height,
      name,
      restTimerSeconds,
      selectedExerciseIds,
      toggleExercise,
      warmUpAutoTagEnabled,
      warmUpPercent,
    ],
  );

  return <OnboardingPager renderStep={renderStep} step={step} />;
}
