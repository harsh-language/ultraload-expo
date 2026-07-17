import {
  clampRestTimerSeconds,
  formatRestTimerDisplay,
  getRestTimerProgress,
  REST_TIMER_MAX_SECONDS,
  REST_TIMER_MIN_SECONDS,
} from '../../src/domain/rest-timer';

describe('rest-timer domain', () => {
  it('clamps timer seconds to BR20 bounds (T17 partial)', () => {
    expect(clampRestTimerSeconds(1)).toBe(REST_TIMER_MIN_SECONDS);
    expect(clampRestTimerSeconds(3)).toBe(3);
    expect(clampRestTimerSeconds(180)).toBe(180);
    expect(clampRestTimerSeconds(600)).toBe(REST_TIMER_MAX_SECONDS);
  });

  it('formats countdown display as m:ss', () => {
    expect(formatRestTimerDisplay(0)).toBe('0:00');
    expect(formatRestTimerDisplay(65)).toBe('1:05');
    expect(formatRestTimerDisplay(180)).toBe('3:00');
  });

  it('grows progress left to right as elapsed time increases', () => {
    expect(getRestTimerProgress(180, 180)).toBe(0);
    expect(getRestTimerProgress(90, 180)).toBe(0.5);
    expect(getRestTimerProgress(0, 180)).toBe(1);
    expect(getRestTimerProgress(10, 0)).toBe(0);
  });
});
