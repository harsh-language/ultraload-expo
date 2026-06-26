import { Easing } from 'react-native-reanimated';

export const SLIDE_TRANSITION_MS = 280;

export const slideTransitionEasing = Easing.bezier(0.4, 0, 0.2, 1);

export const slideTransitionTiming = {
  duration: SLIDE_TRANSITION_MS,
  easing: slideTransitionEasing,
} as const;
