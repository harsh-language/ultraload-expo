import type { RefObject } from 'react';
import { View } from 'react-native';
import type { DisplayUnit } from '../data/exercise-catalogue';
import { getLocalCalendarDate } from '../domain/day-record';
import { formatHistoryDateLabel } from '../domain/history-date';
import {
  formatSessionTotalWeightLabel,
  getSessionTotalWeightMoved,
  hasStandardSets,
  type WorkoutForSessionTotal,
} from '../domain/session-totals';
import { IconButton } from './IconButton';
import { SessionTitleBar } from './SessionTitleBar';
import { ChevronBottomIcon } from './icons';

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
      dateLabel={formatHistoryDateLabel(getLocalCalendarDate())}
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
