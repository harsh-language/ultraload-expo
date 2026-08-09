/** Format a YYYY-MM-DD calendar date for session/history chrome (e.g. "31 OCT"). */
export function formatHistoryDateLabel(calendarDate: string): string {
  const [year, month, day] = calendarDate.split('-').map(Number);
  if (year == null || month == null || day == null) {
    return calendarDate;
  }

  const date = new Date(year, month - 1, day);
  const monthLabel = date
    .toLocaleDateString('en-GB', { month: 'short' })
    .replace('.', '')
    .toUpperCase();
  return `${day} ${monthLabel}`;
}

/** Shift a YYYY-MM-DD calendar date by whole local days. */
export function addCalendarDays(calendarDate: string, deltaDays: number): string {
  const [year, month, day] = calendarDate.split('-').map(Number);
  if (year == null || month == null || day == null) {
    return calendarDate;
  }

  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + deltaDays);
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0');
  const nextDay = String(date.getDate()).padStart(2, '0');
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

/**
 * Inclusive calendar range, newest → oldest (history list order).
 * Returns [] when `start` is after `end`.
 */
export function eachCalendarDateDescending(
  start: string,
  end: string,
): string[] {
  if (start > end) {
    return [];
  }

  const dates: string[] = [];
  let cursor = end;
  while (cursor >= start) {
    dates.push(cursor);
    if (cursor === start) {
      break;
    }
    cursor = addCalendarDays(cursor, -1);
  }
  return dates;
}
