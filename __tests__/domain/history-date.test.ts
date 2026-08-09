import {
  addCalendarDays,
  eachCalendarDateDescending,
  formatHistoryDateLabel,
} from '../../src/domain/history-date';

describe('history-date', () => {
  it('formats calendar labels without a trailing period', () => {
    expect(formatHistoryDateLabel('2026-07-01')).toBe('1 JUL');
    expect(formatHistoryDateLabel('2026-11-09')).toBe('9 NOV');
  });

  it('shifts calendar dates across month boundaries', () => {
    expect(addCalendarDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addCalendarDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('lists inclusive ranges newest-first', () => {
    expect(eachCalendarDateDescending('2026-01-01', '2026-01-03')).toEqual([
      '2026-01-03',
      '2026-01-02',
      '2026-01-01',
    ]);
    expect(eachCalendarDateDescending('2026-01-03', '2026-01-01')).toEqual([]);
  });
});
