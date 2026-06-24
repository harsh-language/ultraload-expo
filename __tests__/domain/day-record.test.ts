import {
  getLocalCalendarDate,
  planWorkoutForSet,
} from '../../src/domain/day-record';

describe('day record domain', () => {
  it('formats device-local calendar dates (BR1)', () => {
    const date = new Date(2026, 5, 22, 23, 59, 59);
    expect(getLocalCalendarDate(date)).toBe('2026-06-22');
  });

  it('first set creates one workout per calendar day (T10)', () => {
    const calendarDate = '2026-06-22';
    const recordedDates: string[] = [];

    const recordSet = () => {
      const plan = planWorkoutForSet(recordedDates, calendarDate);
      if (plan.createWorkout) {
        recordedDates.push(plan.calendarDate);
      }
      return plan;
    };

    const first = recordSet();
    expect(first.createWorkout).toBe(true);
    expect(recordedDates).toEqual(['2026-06-22']);

    const second = recordSet();
    expect(second.createWorkout).toBe(false);
    expect(recordedDates).toHaveLength(1);
  });

  it('creates a new workout when the calendar day changes', () => {
    const dayOne = planWorkoutForSet([], '2026-06-22');
    expect(dayOne.createWorkout).toBe(true);

    const dayTwo = planWorkoutForSet(['2026-06-22'], '2026-06-23');
    expect(dayTwo.createWorkout).toBe(true);
  });
});
