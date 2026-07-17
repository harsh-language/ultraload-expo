/** BR20 — global rest timer bounds (seconds). */
export const REST_TIMER_MIN_SECONDS = 3;
export const REST_TIMER_MAX_SECONDS = 300;

export function clampRestTimerSeconds(seconds: number): number {
  return Math.min(
    REST_TIMER_MAX_SECONDS,
    Math.max(REST_TIMER_MIN_SECONDS, seconds),
  );
}

export function formatRestTimerDisplay(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/** Elapsed fraction 0→1 — fill grows left→right as the rest timer runs. */
export function getRestTimerProgress(
  remainingSeconds: number,
  totalSeconds: number,
): number {
  if (totalSeconds <= 0) {
    return 0;
  }
  const elapsed = totalSeconds - remainingSeconds;
  return Math.max(0, Math.min(elapsed / totalSeconds, 1));
}
