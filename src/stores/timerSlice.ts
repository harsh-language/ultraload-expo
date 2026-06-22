import { create } from 'zustand';

interface TimerSlice {
  remainingSeconds: number | null;
  isRunning: boolean;
  start: (seconds: number) => void;
  tick: () => void;
  stop: () => void;
}

export const useTimerStore = create<TimerSlice>((set, get) => ({
  remainingSeconds: null,
  isRunning: false,
  start: (seconds) => set({ remainingSeconds: seconds, isRunning: true }),
  tick: () => {
    const { remainingSeconds, isRunning } = get();
    if (!isRunning || remainingSeconds === null) {
      return;
    }
    if (remainingSeconds <= 1) {
      set({ remainingSeconds: 0, isRunning: false });
      return;
    }
    set({ remainingSeconds: remainingSeconds - 1 });
  },
  stop: () => set({ remainingSeconds: null, isRunning: false }),
}));
