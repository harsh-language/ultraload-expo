import { create } from 'zustand';
import type { AppDatabase } from '../db/client';
import { getLocalCalendarDate } from '../domain/day-record';
import {
  deleteSet as persistDeleteSet,
  loadWorkoutTree,
  recordSet as persistSet,
  clearWorkoutForDate,
  updateSet as persistUpdateSet,
} from '../db/workoutRepository';

export interface TodaySet {
  id: number;
  weight: number;
  reps: number;
  warmUp: boolean;
  order: number;
  timestamp: string;
}

export interface TodayLoggedExercise {
  id: number;
  exerciseId: string;
  order: number;
  sets: TodaySet[];
}

export interface TodayWorkout {
  id: number;
  date: string;
  loggedExercises: TodayLoggedExercise[];
}

export interface RecordSetPayload {
  exerciseId: string;
  weight: number;
  reps: number;
  warmUp: boolean;
}

export interface UpdateSetPayload {
  setId: number;
  weight: number;
  reps: number;
  warmUp: boolean;
}

interface TodaySlice {
  workout: TodayWorkout | null;
  hydrated: boolean;
  hydrate: (db: AppDatabase) => Promise<void>;
  recordSet: (db: AppDatabase, payload: RecordSetPayload) => Promise<void>;
  updateSet: (db: AppDatabase, payload: UpdateSetPayload) => Promise<void>;
  deleteSet: (db: AppDatabase, setId: number) => Promise<void>;
  clearTodayWorkout: (db: AppDatabase) => Promise<void>;
  clear: () => void;
}

export const useTodayStore = create<TodaySlice>((set) => ({
  workout: null,
  hydrated: false,
  hydrate: async (db) => {
    const calendarDate = getLocalCalendarDate();
    const workout = await loadWorkoutTree(db, calendarDate);
    set({ workout, hydrated: true });
  },
  recordSet: async (db, payload) => {
    const calendarDate = getLocalCalendarDate();
    const workout = await persistSet(db, {
      calendarDate,
      exerciseId: payload.exerciseId,
      weight: payload.weight,
      reps: payload.reps,
      warmUp: payload.warmUp,
    });
    set({ workout, hydrated: true });
  },
  updateSet: async (db, payload) => {
    const workout = await persistUpdateSet(db, payload);
    set({ workout, hydrated: true });
  },
  deleteSet: async (db, setId) => {
    const workout = await persistDeleteSet(db, setId);
    set({ workout, hydrated: true });
  },
  clearTodayWorkout: async (db) => {
    const calendarDate = getLocalCalendarDate();
    await clearWorkoutForDate(db, calendarDate);
    set({ workout: null });
  },
  clear: () => set({ workout: null, hydrated: true }),
}));
