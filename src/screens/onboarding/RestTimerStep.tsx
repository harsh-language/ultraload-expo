import { StyleSheet, Text, View } from 'react-native';
import { InputSlider } from '../../components/InputSlider';
import { WARMUP_RANGE_CAPTION } from '../../components/InputSliderCaption';
import {
  clampRestTimerSeconds,
  REST_TIMER_MAX_SECONDS,
  REST_TIMER_MIN_SECONDS,
  REST_TIMER_STEP_SECONDS,
} from '../../domain/rest-timer';
import { typography } from '../../theme/typography';
import { textCase } from '../../theme/textCase';
import { OnboardingLayout } from './OnboardingLayout';

function formatRestTimerMinutes(seconds: number): string {
  const minutes = seconds / 60;
  return Number.isInteger(minutes) ? String(minutes) : minutes.toFixed(1);
}

interface RestTimerStepProps {
  restTimerSeconds: number;
  onRestTimerChange: (seconds: number) => void;
  onBack: () => void;
  onNext: () => void;
}

export function RestTimerStep({
  restTimerSeconds,
  onRestTimerChange,
  onBack,
  onNext,
}: RestTimerStepProps) {
  return (
    <OnboardingLayout
      actionLabel="set warm up range"
      onAction={onNext}
      onBack={onBack}
      step={3}
      title="rest timer"
    >
      <View style={styles.stack}>
        <Text style={styles.subtitle}>use this timer between sets.</Text>
        <InputSlider
          caption={WARMUP_RANGE_CAPTION}
          captionHidden
          formatValue={formatRestTimerMinutes}
          maximumValue={REST_TIMER_MAX_SECONDS}
          minimumValue={REST_TIMER_MIN_SECONDS}
          onValueChange={(value) =>
            onRestTimerChange(clampRestTimerSeconds(value))
          }
          step={REST_TIMER_STEP_SECONDS}
          suffix="min"
          value={restTimerSeconds}
        />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  stack: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
  },
  subtitle: {
    ...typography.para4,
    ...textCase.lower,
  },
});
