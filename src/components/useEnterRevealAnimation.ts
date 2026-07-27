import { useEffect, useRef, useState } from 'react';
import {
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';
import { animateWithMotionPreference } from '../theme/animateWithMotionPreference';
import {
  ENTER_REVEAL_OFFSET,
  panelExitSpringConfig,
  panelSpringConfig,
} from '../theme/motion';

export { ENTER_REVEAL_OFFSET };

export function useEnterRevealAnimation(visible: boolean) {
  const [mounted, setMounted] = useState(false);
  const wasVisibleRef = useRef(false);
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(ENTER_REVEAL_OFFSET);

  useEffect(() => {
    const wasVisible = wasVisibleRef.current;
    wasVisibleRef.current = visible;
    const reduced = reduceMotion === true;

    if (visible && !wasVisible) {
      setMounted(true);
      opacity.value = 0;
      translateY.value = reduced ? 0 : ENTER_REVEAL_OFFSET;
      opacity.value = animateWithMotionPreference(
        1,
        reduced,
        panelSpringConfig,
      );
      if (!reduced) {
        translateY.value = animateWithMotionPreference(
          0,
          false,
          panelSpringConfig,
        );
      }
      return;
    }

    if (!visible && wasVisible) {
      opacity.value = animateWithMotionPreference(
        0,
        reduced,
        panelExitSpringConfig,
        (finished) => {
          'worklet';
          if (finished) {
            runOnJS(setMounted)(false);
          }
        },
      );
      if (!reduced) {
        translateY.value = animateWithMotionPreference(
          ENTER_REVEAL_OFFSET,
          false,
          panelExitSpringConfig,
        );
      }
    }
  }, [opacity, reduceMotion, translateY, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return { mounted, animatedStyle };
}
