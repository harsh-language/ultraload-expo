import { ONBOARDING_STEP_ORDER } from './onboardingSteps';

const EXERCISE_STEP = ONBOARDING_STEP_ORDER.indexOf('exercises') + 1;
const EXERCISE_TITLE = 'exercises';
import { ExerciseSelectionTicker } from '../../components/ExerciseSelectionTicker';
import { ExercisePicker } from './ExercisePicker';
import { OnboardingLayout } from './OnboardingLayout';

interface ExercisePickerStepProps {
  selectedIds: string[];
  onToggle: (exerciseId: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function ExercisePickerStep({
  selectedIds,
  onToggle,
  onBack,
  onNext,
}: ExercisePickerStepProps) {
  const isValid = selectedIds.length > 0;

  return (
    <OnboardingLayout
      actionDisabled={!isValid}
      actionLabel="set rest timer"
      footerAccessory={
        <ExerciseSelectionTicker count={selectedIds.length} />
      }
      onAction={onNext}
      onBack={onBack}
      scrollable
      step={EXERCISE_STEP}
      title={EXERCISE_TITLE}
    >
      <ExercisePicker
        onToggle={onToggle}
        selectedIds={selectedIds}
        step={EXERCISE_STEP}
        title={EXERCISE_TITLE}
      />
    </OnboardingLayout>
  );
}
