import { create } from 'zustand';
import type { AppDatabase } from '../db/client';
import { getDatabase } from '../db/client';
import { getLocalCalendarDate } from '../domain/day-record';
import {
  deleteSet as persistDeleteSet,
  listWorkoutTrees,
  recordSet as persistSet,
  updateSet as persistUpdateSet,
} from '../db/workoutRepository';
import {
  useTodayStore,
  type RecordSetPayload,
  type TodayWorkout,
  type UpdateSetPayload,
} from './todaySlice';

interface HistorySlice {
  workouts: TodayWorkout[];
  hydrated: boolean;
  hydrate: (db: AppDatabase) => Promise<void>;
  refresh: (db: AppDatabase) => Promise<void>;
  recordSet: (
    db: AppDatabase,
    calendarDate: string,
    payload: RecordSetPayload,
  ) => Promise<void>;
  updateSet: (db: AppDatabase, payload: UpdateSetPayload) => Promise<void>;
  deleteSet: (db: AppDatabase, setId: number) => Promise<void>;
  clear: () => void;
}

async function syncTodayIfNeeded(calendarDate: string): Promise<void> {
  if (calendarDate === getLocalCalendarDate()) {
    await useTodayStore.getState().hydrate(getDatabase());
  }
}

export const useHistoryStore = create<HistorySlice>((set, get) => ({
  workouts: [],
  hydrated: false,
  hydrate: async (db) => {
    const workouts = await listWorkoutTrees(db);
    set({ workouts, hydrated: true });
  },
  refresh: async (db) => {
    const workouts = await listWorkoutTrees(db);
    set({ workouts, hydrated: true });
  },
  recordSet: async (db, calendarDate, payload) => {
    await persistSet(db, {
      calendarDate,
      exerciseId: payload.exerciseId,
      weight: payload.weight,
      reps: payload.reps,
      warmUp: payload.warmUp,
    });
    await get().refresh(db);
    await syncTodayIfNeeded(calendarDate);
  },
  updateSet: async (db, payload) => {
    const workout = await persistUpdateSet(db, payload);
    await get().refresh(db);
    if (workout) {
      await syncTodayIfNeeded(workout.date);
    }
  },
  deleteSet: async (db, setId) => {
    const before = get().workouts.find((workout) =>
      workout.loggedExercises.some((logged) =>
        logged.sets.some((entry) => entry.id === setId),
      ),
    );
    await persistDeleteSet(db, setId);
    await get().refresh(db);
    if (before) {
      await syncTodayIfNeeded(before.date);
    }
  },
  clear: () => set({ workouts: [], hydrated: true }),
}));
