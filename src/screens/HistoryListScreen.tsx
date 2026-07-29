import { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HistoryEmptyState } from '../components/HistoryEmptyState';
import { HistoryNavigation } from '../components/HistoryNavigation';
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
import type { MainStackParamList } from '../navigation/types';
import { useHistoryStore, usePlanStore, useProfileStore } from '../stores';
import { colors, spacing } from '../theme/tokens';
import { SCROLL_FADE_HEIGHT } from '../theme/scrollFade';

type Props = NativeStackScreenProps<MainStackParamList, 'HistoryList'>;

const TITLE_TOP_GAP = spacing['s-8'];

function clampSafeInset(value: number): number {
  return Math.max(value, spacing['s-5']);
}

export function HistoryListScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const units = useProfileStore((state) => state.units);
  const exerciseIds = usePlanStore((state) => state.exerciseIds);
  const workouts = useHistoryStore((state) => state.workouts);
  const refresh = useHistoryStore((state) => state.refresh);

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

  const handleStartWorkout = useCallback(() => {
    navigation.navigate('WorkOut');
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          { paddingTop: clampSafeInset(insets.top) + TITLE_TOP_GAP },
        ]}
      >
        <HistoryNavigation
          activeTab="list"
          onBack={handleBack}
          onTabChange={(tab) => {
            if (tab === 'chart') {
              navigation.replace('HistoryChart');
            }
          }}
          showTabs={!isEmpty}
        />
      </View>

      {isEmpty ? (
        <HistoryEmptyState onStartWorkout={handleStartWorkout} />
      ) : (
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
          {rows.map((row) => {
            const hasComparison = row.dayPercent != null;
            return (
              <LogRow
                key={row.date}
                dateLabel={formatHistoryDateLabel(row.date)}
                onPress={() => {
                  navigation.navigate('SessionDetail', { date: row.date });
                }}
                showStat
                stat={
                  hasComparison
                    ? {
                        label: formatPercentChange(row.dayPercent!),
                        direction: getPercentDirection(row.dayPercent!),
                      }
                    : { label: '—', direction: 'flat' }
                }
                totalLabel={formatSessionTotalWeightLabel(row.totalKg, units)}
                type="session"
              />
            );
          })}
        </ScrollFadeView>
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
    paddingTop: spacing['s-8'],
  },
});
