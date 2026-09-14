import { create } from 'zustand';

interface DevAppResetSlice {
  generation: number;
  trigger: () => void;
}

/**
 * Bump to remount splash → onboarding/main after a full data wipe.
 * Used by DEV homepage reset and shipping Settings reset/import (SCR17 / FL10).
 */
export const useDevAppResetStore = create<DevAppResetSlice>((set) => ({
  generation: 0,
  trigger: () => set((state) => ({ generation: state.generation + 1 })),
}));
