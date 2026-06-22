import { create } from 'zustand';
import type { AppDatabase } from '../db/client';
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  type SettingsState,
} from '../db/repositories';
import type { PerExerciseOverride } from '../db/schema';

interface SettingsSlice extends SettingsState {
  hydrated: boolean;
  hydrate: (db: AppDatabase) => Promise<void>;
  updateOverrides: (
    db: AppDatabase,
    perExerciseOverrides: Record<string, PerExerciseOverride>,
  ) => Promise<void>;
}

export const useSettingsStore = create<SettingsSlice>((set, get) => ({
  ...DEFAULT_SETTINGS,
  hydrated: false,
  hydrate: async (db) => {
    const settingsState = await loadSettings(db);
    set({ ...settingsState, hydrated: true });
  },
  updateOverrides: async (db, perExerciseOverrides) => {
    await saveSettings(db, { perExerciseOverrides });
    set({ perExerciseOverrides, hydrated: true });
  },
}));
