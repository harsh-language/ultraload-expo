import { StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import {
  formatExerciseSelectionLabel,
  getExerciseSelectionTickerBottom,
  getExerciseSelectionTickerLeft,
} from '../domain/exercise-selection-ticker';
import { colors, radii, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';
import { useEnterRevealAnimation } from './useEnterRevealAnimation';

interface ExerciseSelectionTickerProps {
  count: number;
  hasBackButton?: boolean;
}

export function ExerciseSelectionTicker({
  count,
  hasBackButton = true,
}: ExerciseSelectionTickerProps) {
  const insets = useSafeAreaInsets();
  const visible = count > 0;
  const { mounted, animatedStyle } = useEnterRevealAnimation(visible);

  if (!mounted) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.pill,
        {
          bottom: getExerciseSelectionTickerBottom(insets),
          left: getExerciseSelectionTickerLeft(hasBackButton),
          zIndex: 1,
        },
        animatedStyle,
      ]}
    >
      <Text
        accessibilityLiveRegion="polite"
        style={[typography.para3, styles.label]}
      >
        {formatExerciseSelectionLabel(count)}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    borderRadius: radii['r-pill'],
    backgroundColor: colors['bg-5'],
    paddingHorizontal: spacing['s-5'],
    paddingVertical: spacing['s-3'],
  },
  label: {
    color: colors['bg-1'],
    ...textCase.lower,
  },
});
