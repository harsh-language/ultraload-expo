import {
  formatSessionTotalWeightLabel,
  getSessionTotalWeightMoved,
  hasStandardSets,
  type WorkoutForSessionTotal,
} from '../domain/session-totals';
import { SessionTitleBar } from './SessionTitleBar';

function formatSessionDateLabel(date: Date = new Date()): string {
  const month = date
    .toLocaleDateString('en-GB', { month: 'short' })
    .replace('.', '')
    .toUpperCase();
  const day = date.getDate();
  return `${month} ${day}`;
}

interface TodaySessionTitleBarProps {
  workout: WorkoutForSessionTotal | null;
}

export function TodaySessionTitleBar({ workout }: TodaySessionTitleBarProps) {
  const totalLabel = hasStandardSets(workout)
    ? formatSessionTotalWeightLabel(getSessionTotalWeightMoved(workout))
    : undefined;

  return (
    <SessionTitleBar
      dateLabel={formatSessionDateLabel(new Date())}
      totalLabel={totalLabel}
    />
  );
}
