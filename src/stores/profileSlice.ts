import { create } from 'zustand';
import type { AppDatabase } from '../db/client';
import {
  DEFAULT_PROFILE,
  loadProfile,
  saveProfile,
  type ProfileState,
} from '../db/repositories';

interface ProfileSlice extends ProfileState {
  hydrated: boolean;
  hydrate: (db: AppDatabase) => Promise<void>;
  updateProfile: (db: AppDatabase, patch: Partial<ProfileState>) => Promise<void>;
}

export const useProfileStore = create<ProfileSlice>((set, get) => ({
  ...DEFAULT_PROFILE,
  hydrated: false,
  hydrate: async (db) => {
    const profileState = await loadProfile(db);
    set({ ...profileState, hydrated: true });
  },
  updateProfile: async (db, patch) => {
    const current = get();
    const profileState: ProfileState = {
      bodyweight: patch.bodyweight ?? current.bodyweight,
      name: patch.name ?? current.name,
      height: patch.height ?? current.height,
      age: patch.age ?? current.age,
      units: patch.units ?? current.units,
      warmUpPercent: patch.warmUpPercent ?? current.warmUpPercent,
      warmUpAutoTagEnabled:
        patch.warmUpAutoTagEnabled ?? current.warmUpAutoTagEnabled,
      restTimerSeconds: patch.restTimerSeconds ?? current.restTimerSeconds,
      onboardingComplete: patch.onboardingComplete ?? current.onboardingComplete,
    };
    await saveProfile(db, profileState);
    set({ ...profileState, hydrated: true });
  },
}));
