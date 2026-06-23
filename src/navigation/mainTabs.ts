import { Easing } from 'react-native-reanimated';

export type MainTabKey = 'workout' | 'history' | 'settings';

/** Visual left-to-right order in main-navigation (Figma space-between row). */
export const MAIN_TAB_ORDER: MainTabKey[] = ['history', 'workout', 'settings'];

export const TAB_LABELS: Record<MainTabKey, string> = {
  history: 'history',
  workout: 'workout',
  settings: 'settings',
};

/** Figma active navigation-tab width — not a spacing token. */
export const ACTIVE_TAB_WIDTH = 164;

export const TAB_TRANSITION_MS = 280;

export const tabTransitionEasing = Easing.bezier(0.4, 0, 0.2, 1);

export const tabTransitionTiming = {
  duration: TAB_TRANSITION_MS,
  easing: tabTransitionEasing,
} as const;
