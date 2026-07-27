jest.mock('react-native-reanimated', () => ({
  Easing: {
    bezier: () => 'mock-bezier',
  },
}));

import {
  ENTER_STAGGER_MS,
  INTERACTIVE_SCALE,
  MENU_SPRING_DURATION_MS,
  MENU_SPRING_RESPONSE,
  MOMENTUM_DECELERATION_RATE,
  PANEL_EXIT_SPRING_RESPONSE,
  PANEL_SPRING_DAMPING_RATIO,
  PANEL_SPRING_DURATION_MS,
  PANEL_SPRING_RESPONSE,
  PRESS_FEEDBACK_MS,
  REDUCED_MOTION_FADE_MS,
  RUBBERBAND_CONSTANT,
  SLIDE_TRANSITION_MS,
  menuSpringConfig,
  panelExitSpringConfig,
  panelSpringConfig,
  projectMomentum,
  rubberband,
} from '../../src/theme/motion';

describe('panelSpringConfig', () => {
  it('uses house spring damping 0.9 and response 0.15s', () => {
    expect(PANEL_SPRING_DAMPING_RATIO).toBe(0.9);
    expect(PANEL_SPRING_RESPONSE).toBe(0.15);
    expect(PANEL_SPRING_DURATION_MS).toBe(150);
    expect(panelSpringConfig).toEqual({
      dampingRatio: 0.9,
      duration: 150,
    });
  });

  it('uses faster exit and menu springs at 0.15s', () => {
    expect(PANEL_EXIT_SPRING_RESPONSE).toBe(0.15);
    expect(MENU_SPRING_RESPONSE).toBe(0.15);
    expect(MENU_SPRING_DURATION_MS).toBe(150);
    expect(panelExitSpringConfig).toEqual({
      dampingRatio: 0.9,
      duration: 150,
    });
    expect(menuSpringConfig).toEqual({
      dampingRatio: 0.9,
      duration: 150,
    });
  });
});

describe('interaction motion constants', () => {
  it('locks press, projection, rubberband, stagger, slide, and fades', () => {
    expect(INTERACTIVE_SCALE).toBe(0.97);
    expect(PRESS_FEEDBACK_MS).toBe(150);
    expect(MOMENTUM_DECELERATION_RATE).toBe(0.99);
    expect(RUBBERBAND_CONSTANT).toBe(0.6);
    expect(REDUCED_MOTION_FADE_MS).toBe(150);
    expect(ENTER_STAGGER_MS).toBe(30);
    expect(SLIDE_TRANSITION_MS).toBe(300);
  });
});

describe('projectMomentum', () => {
  it('projects with snappier 0.99 deceleration', () => {
    expect(projectMomentum(1000, 0.99)).toBeCloseTo(99);
  });

  it('returns 0 for invalid deceleration rates', () => {
    expect(projectMomentum(1000, 1)).toBe(0);
    expect(projectMomentum(1000, 0)).toBe(0);
  });
});

describe('rubberband', () => {
  it('resists past the bound with constant 0.6', () => {
    const result = rubberband(100, 200, 0.6);
    expect(result).toBeCloseTo((100 * 200 * 0.6) / (200 + 0.6 * 100));
    expect(Math.abs(result)).toBeLessThan(100);
  });

  it('returns 0 when dimension is non-positive', () => {
    expect(rubberband(50, 0)).toBe(0);
  });
});
