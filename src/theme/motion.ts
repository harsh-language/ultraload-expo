import { Easing, type WithSpringConfig } from 'react-native-reanimated';

/**
 * Panel open / close / move spring (sheets, menus, dropdowns, accordions).
 * Apple-style designer params: damping ratio + response.
 * Mapped to Reanimated's duration + dampingRatio spring API
 * (`response` seconds → perceptual `duration` ms).
 */
export const PANEL_SPRING_DAMPING_RATIO = 0.9;
/** Apple response, in seconds — house open / expand. */
export const PANEL_SPRING_RESPONSE = 0.15;
/** Perceptual duration for Reanimated (`response` × 1000). */
export const PANEL_SPRING_DURATION_MS = PANEL_SPRING_RESPONSE * 1000;

/** Faster dismiss / collapse response. */
export const PANEL_EXIT_SPRING_RESPONSE = 0.15;
export const PANEL_EXIT_SPRING_DURATION_MS = PANEL_EXIT_SPRING_RESPONSE * 1000;

/** Options menu open/close (snappier than house panels). */
export const MENU_SPRING_RESPONSE = 0.15;
export const MENU_SPRING_DURATION_MS = MENU_SPRING_RESPONSE * 1000;

/** House spring for panel open / expand / settle. */
export const panelSpringConfig = {
  dampingRatio: PANEL_SPRING_DAMPING_RATIO,
  duration: PANEL_SPRING_DURATION_MS,
} as const satisfies WithSpringConfig;

/** Faster spring for dismiss / collapse. */
export const panelExitSpringConfig = {
  dampingRatio: PANEL_SPRING_DAMPING_RATIO,
  duration: PANEL_EXIT_SPRING_DURATION_MS,
} as const satisfies WithSpringConfig;

/** Options menu spring. */
export const menuSpringConfig = {
  dampingRatio: PANEL_SPRING_DAMPING_RATIO,
  duration: MENU_SPRING_DURATION_MS,
} as const satisfies WithSpringConfig;

/** Press / menu enter scale (rest = 1). */
export const INTERACTIVE_SCALE = 0.97;

/** Press scale transition duration. */
export const PRESS_FEEDBACK_MS = 150;

/** Short interactive ease-out — press feedback and programmatic scroll. */
export const interactiveEasing = Easing.bezier(0.23, 1, 0.32, 1);

export const pressFeedbackTiming = {
  duration: PRESS_FEEDBACK_MS,
  easing: interactiveEasing,
} as const;

/**
 * Programmatic scroll correction (parking a filter row at an edge). Shorter
 * than the platform default so the row lands with the press, not after it.
 */
export const AUTO_SCROLL_MS = 90;

export const autoScrollTiming = {
  duration: AUTO_SCROLL_MS,
  easing: interactiveEasing,
} as const;

/** Apple-style flick projection (snappier than scroll’s 0.998). */
export const MOMENTUM_DECELERATION_RATE = 0.99;

/** Soft edge resistance for overdrag. */
export const RUBBERBAND_CONSTANT = 0.6;

/** Opacity-only transitions when Reduce Motion is on. */
export const REDUCED_MOTION_FADE_MS = 150;

/** Enter-reveal travel distance (px). */
export const ENTER_REVEAL_OFFSET = 6;

/** First-paint stagger between sibling enters. */
export const ENTER_STAGGER_MS = 30;

/**
 * Project travel distance from release velocity (Apple fluid interfaces).
 * `initialVelocity` in px/s; result in px.
 */
export function projectMomentum(
  initialVelocity: number,
  decelerationRate: number = MOMENTUM_DECELERATION_RATE,
): number {
  'worklet';
  if (decelerationRate <= 0 || decelerationRate >= 1) {
    return 0;
  }
  return (
    (initialVelocity / 1000) * decelerationRate / (1 - decelerationRate)
  );
}

/**
 * Progressive resistance past a bound (Apple rubber-banding).
 */
export function rubberband(
  overshoot: number,
  dimension: number,
  constant: number = RUBBERBAND_CONSTANT,
): number {
  'worklet';
  if (dimension <= 0) {
    return 0;
  }
  return (
    (overshoot * dimension * constant) /
    (dimension + constant * Math.abs(overshoot))
  );
}

/** Horizontal page / slide transitions (onboarding pager, etc.). */
export const SLIDE_TRANSITION_MS = 300;

export const slideTransitionEasing = Easing.bezier(0.24, 1, 0.33, 1);

export const slideTransitionTiming = {
  duration: SLIDE_TRANSITION_MS,
  easing: slideTransitionEasing,
} as const;
