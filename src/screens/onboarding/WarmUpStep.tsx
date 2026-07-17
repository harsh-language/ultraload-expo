import { StyleSheet, View } from 'react-native';
import { Accordion } from '../../components/Accordion';
import { InputSlider } from '../../components/InputSlider';
import { WARMUP_RANGE_CAPTION } from '../../components/InputSliderCaption';
import { InputToggle } from '../../components/InputToggle';
import { spacing } from '../../theme/tokens';
import { OnboardingLayout } from './OnboardingLayout';

const WARM_UP_MIN_PERCENT = 10;
const WARM_UP_MAX_PERCENT = 70;
const WARM_UP_STEP_PERCENT = 5;

interface WarmUpStepProps {
  warmUpPercent: number;
  warmUpAutoTagEnabled: boolean;
  onWarmUpChange: (percent: number) => void;
  onWarmUpAutoTagChange: (enabled: boolean) => void;
  onBack: () => void;
  onComplete: () => void;
  completing?: boolean;
}

export function WarmUpStep({
  warmUpPercent,
  warmUpAutoTagEnabled,
  onWarmUpChange,
  onWarmUpAutoTagChange,
  onBack,
  onComplete,
  completing = false,
}: WarmUpStepProps) {
  return (
    <OnboardingLayout
      actionDisabled={completing}
      actionLabel="finish profile"
      onAction={onComplete}
      onBack={onBack}
      step={4}
      title="warmup weight"
      trailingIcon="check"
    >
      <View style={styles.stack}>
        <View style={styles.topGroup}>
          <InputToggle
            label={['automatically tag ', 'warmup sets']}
            onValueChange={onWarmUpAutoTagChange}
            togglePosition="left"
            value={warmUpAutoTagEnabled}
          />

          <Accordion
            items={[
              'autotags set below a fixed weight %',
              'starts tagging after 2nd session',
              'manual tagging still available',
            ]}
            title="how it works"
          />
        </View>

        <InputSlider
          caption={WARMUP_RANGE_CAPTION}
          disabled={!warmUpAutoTagEnabled}
          formatValue={(value) => `${value}%`}
          maximumValue={WARM_UP_MAX_PERCENT}
          minimumValue={WARM_UP_MIN_PERCENT}
          onValueChange={onWarmUpChange}
          prefix="upto"
          step={WARM_UP_STEP_PERCENT}
          suffix=""
          value={warmUpPercent}
        />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  stack: {
    flex: 1,
    width: '100%',
    paddingTop: spacing['s-8'],
    justifyContent: 'space-between',
  },
  topGroup: {
    gap: spacing['s-8'],
    width: '100%',
  },
});
