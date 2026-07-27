import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  INTERACTIVE_SCALE,
  pressFeedbackTiming,
} from '../theme/motion';

/**
 * 150ms ease-out press scale (0.97). Wire to Pressable onPressIn/onPressOut
 * and merge `animatedStyle` onto an Animated view/pressable.
 */
export function usePressScale(disabled = false) {
  const scale = useSharedValue(1);

  const onPressIn = () => {
    if (disabled) {
      return;
    }
    scale.value = withTiming(INTERACTIVE_SCALE, pressFeedbackTiming);
  };

  const onPressOut = () => {
    scale.value = withTiming(1, pressFeedbackTiming);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { onPressIn, onPressOut, animatedStyle };
}
