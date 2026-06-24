import { SessionTitleBar } from './SessionTitleBar';

function formatSessionDateLabel(date: Date = new Date()): string {
  const month = date
    .toLocaleDateString('en-GB', { month: 'short' })
    .replace('.', '')
    .toUpperCase();
  const day = date.getDate();
  return `${month} ${day}`;
}

export function TodaySessionTitleBar() {
  return <SessionTitleBar dateLabel={formatSessionDateLabel(new Date())} />;
}
