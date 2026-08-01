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
import { formatHistoryDateLabel } from '../domain/history-date';
import {
  buildHistoryListRows,
  formatPercentChange,
  formatSessionTotalWeightLabel,
  getPercentDirection,
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
    () => buildHistoryListRows(workouts, exerciseIds),
    [exerciseIds, workouts],
  );
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
      {rows.map((row, index) => {
        const dayPercent = row.dayPercent;
        const hasChange = dayPercent != null && dayPercent !== 0;
        const showStat = dayPercent == null || hasChange;
        return (
          <LogRow
            key={row.date}
            dateLabel={formatHistoryDateLabel(row.date)}
            isBestRecord={row.isBestRecord}
            onPress={() => {
              navigation.navigate('SessionDetail', { date: row.date });
            }}
            showBottomBorder={index < rows.length - 1}
            showStat={showStat}
            stat={
              hasChange
                ? {
                    label: formatPercentChange(dayPercent),
                    direction: getPercentDirection(dayPercent),
                  }
                : dayPercent == null
                  ? { label: '–', direction: 'flat' }
                  : undefined
            }
            totalLabel={formatSessionTotalWeightLabel(row.totalKg, units)}
            type="session"
          />
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
  chartStub: {
    flex: 1,
  },
});
