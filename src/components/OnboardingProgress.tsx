import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';
import { ONBOARDING_STEP_ORDER } from '../screens/onboarding/onboardingSteps';

const DOT_SIZE = spacing['s-4'];
const TOTAL_STEPS = ONBOARDING_STEP_ORDER.length;

interface OnboardingProgressProps {
  step: number;
}

export function OnboardingProgress({ step }: OnboardingProgressProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: TOTAL_STEPS }, (_, index) => {
        const active = index < step;
        return (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: active ? colors['content-1'] : colors['border-2'] },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['s-4'],
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
});
