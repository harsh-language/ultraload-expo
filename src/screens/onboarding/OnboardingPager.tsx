import type { ReactNode } from 'react';
import { SlidePager } from '../../navigation/SlidePager';
import type { OnboardingStep } from './onboardingSteps';
import { ONBOARDING_STEP_ORDER } from './onboardingSteps';

interface OnboardingPagerProps {
  step: OnboardingStep;
  renderStep: (step: OnboardingStep) => ReactNode;
}

export function OnboardingPager({ step, renderStep }: OnboardingPagerProps) {
  return (
    <SlidePager
      items={ONBOARDING_STEP_ORDER}
      renderItem={renderStep}
      selected={step}
    />
  );
}
