import { create } from 'zustand';

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

interface TodaySlice {
  workout: TodayWorkout | null;
  hydrated: boolean;
  setWorkout: (workout: TodayWorkout | null) => void;
  clear: () => void;
}

export const useTodayStore = create<TodaySlice>((set) => ({
  workout: null,
  hydrated: false,
  setWorkout: (workout) => set({ workout, hydrated: true }),
  clear: () => set({ workout: null, hydrated: true }),
}));
