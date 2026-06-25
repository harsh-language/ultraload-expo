import { useEffect, useRef, useState } from 'react';
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export const ENTER_REVEAL_TRANSITION_MS = 250;
export const ENTER_REVEAL_OFFSET = 6;

export function useEnterRevealAnimation(visible: boolean) {
  const [mounted, setMounted] = useState(false);
  const wasVisibleRef = useRef(false);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(ENTER_REVEAL_OFFSET);

  useEffect(() => {
    const wasVisible = wasVisibleRef.current;
    wasVisibleRef.current = visible;

    if (visible && !wasVisible) {
      setMounted(true);
      opacity.value = 0;
      translateY.value = ENTER_REVEAL_OFFSET;
      opacity.value = withTiming(1, { duration: ENTER_REVEAL_TRANSITION_MS });
      translateY.value = withTiming(0, { duration: ENTER_REVEAL_TRANSITION_MS });
      return;
    }

    if (!visible && wasVisible) {
      opacity.value = withTiming(0, { duration: ENTER_REVEAL_TRANSITION_MS }, (finished) => {
        if (finished) {
          runOnJS(setMounted)(false);
        }
      });
      translateY.value = withTiming(ENTER_REVEAL_OFFSET, {
        duration: ENTER_REVEAL_TRANSITION_MS,
      });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return { mounted, animatedStyle };
}
