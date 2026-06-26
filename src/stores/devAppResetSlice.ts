import { create } from 'zustand';

interface DevAppResetSlice {
  generation: number;
  trigger: () => void;
}

/** Dev-only — bump to remount app flow after wiping persisted data. */
export const useDevAppResetStore = create<DevAppResetSlice>((set) => ({
  generation: 0,
  trigger: () => set((state) => ({ generation: state.generation + 1 })),
}));
