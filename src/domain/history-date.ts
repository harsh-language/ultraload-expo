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
