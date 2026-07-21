import { create } from 'zustand';
import type { AppDatabase } from '../db/client';
import {
  DEFAULT_PROFILE,
  loadProfile,
  saveProfile,
  type ProfileState,
} from '../db/repositories';

export interface CompleteOnboardingInput {
  bodyweight: number;
  name?: string | null;
  height?: number | null;
  age?: number | null;
  restTimerSeconds: number;
  warmUpPercent: number;
  warmUpAutoTagEnabled: boolean;
}

interface ProfileSlice extends ProfileState {
  hydrated: boolean;
  hydrate: (db: AppDatabase) => Promise<void>;
  updateProfile: (db: AppDatabase, patch: Partial<ProfileState>) => Promise<void>;
  completeOnboarding: (
    db: AppDatabase,
    input: CompleteOnboardingInput,
  ) => Promise<void>;
}

export function mergeProfilePatch(
  current: ProfileState,
  patch: Partial<ProfileState>,
): ProfileState {
  return {
    bodyweight:
      patch.bodyweight !== undefined ? patch.bodyweight : current.bodyweight,
    name: patch.name !== undefined ? patch.name : current.name,
    height: patch.height !== undefined ? patch.height : current.height,
    age: patch.age !== undefined ? patch.age : current.age,
    units: patch.units ?? current.units,
    warmUpPercent: patch.warmUpPercent ?? current.warmUpPercent,
    warmUpAutoTagEnabled:
      patch.warmUpAutoTagEnabled ?? current.warmUpAutoTagEnabled,
    restTimerSeconds: patch.restTimerSeconds ?? current.restTimerSeconds,
    onboardingComplete: patch.onboardingComplete ?? current.onboardingComplete,
  };
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
    const patchKeys = Object.keys(patch) as (keyof ProfileState)[];
    if (
      patchKeys.length > 0 &&
      patchKeys.every((key) => patch[key] === current[key])
    ) {
      return;
    }

    const profileState = mergeProfilePatch(current, patch);
    await saveProfile(db, profileState);
    set({ ...profileState, hydrated: true });
  },
  completeOnboarding: async (db, input) => {
    const current = get();
    const profileState: ProfileState = {
      bodyweight: input.bodyweight,
      name: input.name ?? current.name,
      height: input.height ?? current.height,
      age: input.age ?? current.age,
      units: current.units,
      warmUpPercent: input.warmUpPercent,
      warmUpAutoTagEnabled: input.warmUpAutoTagEnabled,
      restTimerSeconds: input.restTimerSeconds,
      onboardingComplete: true,
    };
    await saveProfile(db, profileState);
    set({ ...profileState, hydrated: true });
  },
}));
