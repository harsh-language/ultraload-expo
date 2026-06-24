import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  formatExerciseSelectionLabel,
  getExerciseSelectionTickerBottom,
  getExerciseSelectionTickerLeft,
} from '../domain/exercise-selection-ticker';
import { colors, radii, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';

const TICKER_TRANSITION_MS = 250;
const TICKER_ENTER_OFFSET = 6;

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
  const [mounted, setMounted] = useState(false);
  const wasVisibleRef = useRef(false);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(TICKER_ENTER_OFFSET);

  useEffect(() => {
    const wasVisible = wasVisibleRef.current;
    wasVisibleRef.current = visible;

    if (visible && !wasVisible) {
      setMounted(true);
      opacity.value = 0;
      translateY.value = TICKER_ENTER_OFFSET;
      opacity.value = withTiming(1, { duration: TICKER_TRANSITION_MS });
      translateY.value = withTiming(0, { duration: TICKER_TRANSITION_MS });
      return;
    }

    if (!visible && wasVisible) {
      opacity.value = withTiming(0, { duration: TICKER_TRANSITION_MS }, (finished) => {
        if (finished) {
          runOnJS(setMounted)(false);
        }
      });
      translateY.value = withTiming(TICKER_ENTER_OFFSET, {
        duration: TICKER_TRANSITION_MS,
      });
    }
  }, [visible, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

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
