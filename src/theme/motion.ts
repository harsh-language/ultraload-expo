import { Easing } from 'react-native-reanimated';

/**
 * Open / close / move duration for sheets, menus, dropdowns, and other panels.
 * Use for every panel appear, dismiss, or reposition animation.
 */
export const PANEL_TRANSITION_MS = 150;

export const panelTransitionTiming = {
  duration: PANEL_TRANSITION_MS,
} as const;

/** Horizontal page / slide transitions (onboarding pager, etc.). */
export const SLIDE_TRANSITION_MS = 280;

export const slideTransitionEasing = Easing.bezier(0.4, 0, 0.2, 1);

export const slideTransitionTiming = {
  duration: SLIDE_TRANSITION_MS,
  easing: slideTransitionEasing,
} as const;
