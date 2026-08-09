import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HistoryEmptyState } from '../components/HistoryEmptyState';
import {
  HISTORY_TABS,
  HistoryNavigation,
  type HistoryTab,
} from '../components/HistoryNavigation';
import { LogRow } from '../components/LogRow';
import { ScrollFadeView } from '../components/ScrollFadeView';
import { getDatabase } from '../db/client';
import { getLocalCalendarDate } from '../domain/day-record';
import { formatHistoryDateLabel } from '../domain/history-date';
import {
  buildHistoryListRows,
  formatPercentChange,
  formatSessionTotalWeightLabel,
  getPercentDirection,
  groupHistoryListRows,
} from '../domain/progress';
import { SlidePager } from '../navigation/SlidePager';
import type { MainStackParamList } from '../navigation/types';
import { useHistoryStore, usePlanStore, useProfileStore } from '../stores';
import { colors, spacing } from '../theme/tokens';
import { SCROLL_FADE_HEIGHT } from '../theme/scrollFade';

type Props = NativeStackScreenProps<MainStackParamList, 'HistoryList'>;

function clampSafeInset(value: number): number {
  return Math.max(value, spacing['s-5']);
}

export function HistoryListScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const units = useProfileStore((state) => state.units);
  const exerciseIds = usePlanStore((state) => state.exerciseIds);
  const workouts = useHistoryStore((state) => state.workouts);
  const refresh = useHistoryStore((state) => state.refresh);
  const [activeTab, setActiveTab] = useState<HistoryTab>('list');

  useFocusEffect(
    useCallback(() => {
      void refresh(getDatabase());
    }, [refresh]),
  );

  const rows = useMemo(
    () => buildHistoryListRows(workouts, exerciseIds, getLocalCalendarDate()),
    [exerciseIds, workouts],
  );
  const groups = useMemo(() => groupHistoryListRows(rows), [rows]);
  const isEmpty = rows.length === 0;

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const listContent = (
    <ScrollFadeView
      bottomFadeHeight={SCROLL_FADE_HEIGHT}
      contentContainerStyle={[
        styles.listContent,
        {
          paddingBottom: clampSafeInset(insets.bottom) + spacing['s-8'],
        },
      ]}
      showsVerticalScrollIndicator={false}
      style={styles.scroll}
      topFadeEnabled={false}
      topFadeHeight={SCROLL_FADE_HEIGHT}
    >
      {groups.map((group, groupIndex) => {
        const { session, rests } = group;
        const dayPercent = session.dayPercent;
        // Figma log flat state — null (no compare) and 0% both show "–".
        const hasChange = dayPercent != null && dayPercent !== 0;
        return (
          <View
            key={session.date}
            style={[
              styles.sessionGroup,
              groupIndex < groups.length - 1 && styles.sessionGroupBordered,
            ]}
          >
            {rests.map((rest) => (
              <LogRow
                key={rest.date}
                dateLabel={formatHistoryDateLabel(rest.date)}
                isRest
                onPress={() => {
                  navigation.navigate('SessionDetail', { date: rest.date });
                }}
                type="session"
              />
            ))}
            <LogRow
              dateLabel={formatHistoryDateLabel(session.date)}
              isBestRecord={session.isBestRecord}
              onPress={() => {
                navigation.navigate('SessionDetail', { date: session.date });
              }}
              showStat
              stat={
                hasChange
                  ? {
                      label: formatPercentChange(dayPercent),
                      direction: getPercentDirection(dayPercent),
                    }
                  : { label: '–', direction: 'flat' }
              }
              totalLabel={formatSessionTotalWeightLabel(session.totalKg, units)}
              type="session"
            />
          </View>
        );
      })}
    </ScrollFadeView>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {isEmpty ? (
        <HistoryEmptyState onStartWorkout={handleBack} />
      ) : (
        <>
          <View style={styles.header}>
            <HistoryNavigation
              activeTab={activeTab}
              onBack={handleBack}
              onTabChange={setActiveTab}
            />
          </View>
          <SlidePager
            items={HISTORY_TABS}
            renderItem={(tab) => {
              switch (tab) {
                case 'list':
                  return listContent;
                case 'chart':
                  // U4 stub — chart content ships in U5.
                  return <View style={styles.chartStub} />;
                default: {
                  const _exhaustive: never = tab;
                  return _exhaustive;
                }
              }
            }}
            selected={activeTab}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors['bg-1'],
  },
  header: {
    zIndex: 1,
  },
  scroll: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing['s-8'],
  },
  /**
   * Figma history list group — rests + session (or session alone).
   * Vertical pad s-5; bottom border separates groups.
   */
  sessionGroup: {
    paddingVertical: spacing['s-5'],
  },
  sessionGroupBordered: {
    borderBottomWidth: spacing['s-1'],
    borderBottomColor: colors['border-2'],
  },
  chartStub: {
    flex: 1,
  },
});
