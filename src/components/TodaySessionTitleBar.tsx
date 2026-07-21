import type { RefObject } from 'react';
import { View } from 'react-native';
import type { DisplayUnit } from '../data/exercise-catalogue';
import {
  formatSessionTotalWeightLabel,
  getSessionTotalWeightMoved,
  hasStandardSets,
  type WorkoutForSessionTotal,
} from '../domain/session-totals';
import { IconButton } from './IconButton';
import { SessionTitleBar } from './SessionTitleBar';
import { ChevronBottomIcon } from './icons';

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
  units: DisplayUnit;
  menuButtonRef?: RefObject<View | null>;
  onMenuPress?: () => void;
  menuOpen?: boolean;
}

export function TodaySessionTitleBar({
  workout,
  units,
  menuButtonRef,
  onMenuPress,
  menuOpen = false,
}: TodaySessionTitleBarProps) {
  const totalLabel = hasStandardSets(workout)
    ? formatSessionTotalWeightLabel(getSessionTotalWeightMoved(workout), units)
    : undefined;

  return (
    <SessionTitleBar
      dateLabel={formatSessionDateLabel(new Date())}
      totalLabel={totalLabel}
      trailing={
        onMenuPress ? (
          <View ref={menuButtonRef} collapsable={false}>
            <IconButton
              accessibilityLabel="More options"
              onPress={onMenuPress}
              pressed={menuOpen}
              size="small"
            >
              <ChevronBottomIcon />
            </IconButton>
          </View>
        ) : null
      }
    />
  );
}
