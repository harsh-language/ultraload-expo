import {
  withSpring,
  withTiming,
  type AnimatableValue,
  type AnimationCallback,
  type WithSpringConfig,
} from 'react-native-reanimated';
import {
  panelSpringConfig,
  REDUCED_MOTION_FADE_MS,
} from './motion';

/**
 * Panel / reveal motion: house spring, or 150ms opacity-compatible fade
 * when Reduce Motion is enabled.
 *
 * Animation callbacks must include a `'worklet'` directive — this helper is
 * not special-cased by the Reanimated Babel plugin, so plain JS callbacks
 * throw on the UI runtime (SIGABRT in Expo Go).
 */
export function animateWithMotionPreference<T extends AnimatableValue>(
  toValue: T,
  reduceMotion: boolean,
  springConfig: WithSpringConfig = panelSpringConfig,
  callback?: AnimationCallback,
) {
  if (reduceMotion) {
    return withTiming(toValue, { duration: REDUCED_MOTION_FADE_MS }, callback);
  }
  return withSpring(toValue, springConfig, callback);
}
