/** BR1 — device-local calendar day key (YYYY-MM-DD). */
export function getLocalCalendarDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface WorkoutDayPlan {
  calendarDate: string;
  createWorkout: boolean;
}

/** Pure planning step for BR1 — one workout row per calendar day. */
export function planWorkoutForSet(
  existingDates: string[],
  calendarDate: string,
): WorkoutDayPlan {
  return {
    calendarDate,
    createWorkout: !existingDates.includes(calendarDate),
  };
}
