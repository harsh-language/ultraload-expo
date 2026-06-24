import { StyleSheet, Text, View } from 'react-native';
import { InputSlider } from '../../components/InputSlider';
import { WARMUP_RANGE_CAPTION } from '../../components/InputSliderCaption';
import { typography } from '../../theme/typography';
import { textCase } from '../../theme/textCase';
import { OnboardingLayout } from './OnboardingLayout';

const REST_MIN_SECONDS = 3;
const REST_MAX_SECONDS = 300;
const REST_STEP_SECONDS = 3;

function formatRestTimerMinutes(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60));
  return String(minutes);
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
          maximumValue={REST_MAX_SECONDS}
          minimumValue={REST_MIN_SECONDS}
          onValueChange={onRestTimerChange}
          step={REST_STEP_SECONDS}
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
