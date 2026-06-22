import { create } from 'zustand';
import type { AppDatabase } from '../db/client';
import {
  DEFAULT_PLAN,
  loadPlan,
  savePlan,
  type PlanState,
} from '../db/repositories';

interface PlanSlice extends PlanState {
  hydrated: boolean;
  hydrate: (db: AppDatabase) => Promise<void>;
  updatePlan: (db: AppDatabase, exerciseIds: string[]) => Promise<void>;
}

export const usePlanStore = create<PlanSlice>((set, get) => ({
  ...DEFAULT_PLAN,
  hydrated: false,
  hydrate: async (db) => {
    const planState = await loadPlan(db);
    set({ ...planState, hydrated: true });
  },
  updatePlan: async (db, exerciseIds) => {
    await savePlan(db, { exerciseIds });
    set({ exerciseIds, hydrated: true });
  },
}));
