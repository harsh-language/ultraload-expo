import { useCallback, useEffect } from 'react';
import { clampRestTimerSeconds } from '../domain/rest-timer';
import {
  cancelRestTimerNotification,
  scheduleRestTimerNotification,
} from '../notifications/restTimerNotifications';
import { useTimerStore } from '../stores/timerSlice';

export function useRestTimer() {
  const remainingSeconds = useTimerStore((state) => state.remainingSeconds);
  const totalSeconds = useTimerStore((state) => state.totalSeconds);
  const isRunning = useTimerStore((state) => state.isRunning);
  const start = useTimerStore((state) => state.start);
  const tick = useTimerStore((state) => state.tick);
  const pause = useTimerStore((state) => state.pause);
  const resume = useTimerStore((state) => state.resume);
  const hide = useTimerStore((state) => state.hide);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const intervalId = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning, tick]);

  const startTimer = useCallback(
    async (seconds: number) => {
      const clamped = clampRestTimerSeconds(seconds);
      await scheduleRestTimerNotification(clamped);
      start(clamped);
    },
    [start],
  );

  const toggleTimer = useCallback(async () => {
    if (isRunning) {
      pause();
      await cancelRestTimerNotification();
      return;
    }

    if (remainingSeconds === null || remainingSeconds <= 0) {
      return;
    }

    await scheduleRestTimerNotification(remainingSeconds);
    resume();
  }, [isRunning, pause, remainingSeconds, resume]);

  const dismissTimer = useCallback(async () => {
    await cancelRestTimerNotification();
    hide();
  }, [hide]);

  return {
    remainingSeconds,
    totalSeconds,
    isRunning,
    startTimer,
    toggleTimer,
    dismissTimer,
  };
}
