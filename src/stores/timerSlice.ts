import { create } from 'zustand';

interface TimerSlice {
  remainingSeconds: number | null;
  totalSeconds: number | null;
  isRunning: boolean;
  start: (seconds: number) => void;
  tick: () => void;
  pause: () => void;
  resume: () => void;
  hide: () => void;
}

export const useTimerStore = create<TimerSlice>((set, get) => ({
  remainingSeconds: null,
  totalSeconds: null,
  isRunning: false,
  start: (seconds) =>
    set({
      remainingSeconds: seconds,
      totalSeconds: seconds,
      isRunning: true,
    }),
  tick: () => {
    const { remainingSeconds, isRunning } = get();
    if (!isRunning || remainingSeconds === null) {
      return;
    }
    if (remainingSeconds <= 1) {
      set({
        remainingSeconds: null,
        totalSeconds: null,
        isRunning: false,
      });
      return;
    }
    set({ remainingSeconds: remainingSeconds - 1 });
  },
  pause: () => set({ isRunning: false }),
  resume: () => {
    const { remainingSeconds } = get();
    if (remainingSeconds !== null && remainingSeconds > 0) {
      set({ isRunning: true });
    }
  },
  hide: () =>
    set({
      remainingSeconds: null,
      totalSeconds: null,
      isRunning: false,
    }),
}));
