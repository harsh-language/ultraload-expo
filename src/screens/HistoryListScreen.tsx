import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HistoryChartView } from '../components/HistoryChartView';
import { HistoryEmptyState } from '../components/HistoryEmptyState';
import { HistoryFilterBar } from '../components/HistoryFilterBar';
import {
  HistoryNavigation,
  type HistoryView,
} from '../components/HistoryNavigation';
import { LogRow } from '../components/LogRow';
import { ScrollFadeView } from '../components/ScrollFadeView';
import { getDatabase } from '../db/client';
import { getLocalCalendarDate } from '../domain/day-record';
import { formatHistoryDateLabel } from '../domain/history-date';
import {
  buildChartSeries,
  buildHistoryListRows,
  DEFAULT_HISTORY_FILTER,
  listHistoryPeriods,
  type HistoryFilter,
} from '../domain/history-filter';
import {
  formatPercentChange,
  getPercentDirection,
  groupHistoryListRows,
} from '../domain/progress';
import { formatSessionTotalWeightLabel } from '../domain/session-totals';
import type { MainStackParamList } from '../navigation/types';
import { useHistoryStore, usePlanStore, useProfileStore } from '../stores';
import { animateWithMotionPreference } from '../theme/animateWithMotionPreference';
import { INTERACTIVE_SCALE } from '../theme/motion';
import { clampSafeInset } from '../theme/safeAreaInset';
import { colors, spacing } from '../theme/tokens';
import { SCROLL_FADE_HEIGHT } from '../theme/scrollFade';
import { textCase } from '../theme/textCase';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<MainStackParamList, 'HistoryList'>;

export function HistoryListScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const units = useProfileStore((state) => state.units);
  const exerciseIds = usePlanStore((state) => state.exerciseIds);
  const workouts = useHistoryStore((state) => state.workouts);
  const refresh = useHistoryStore((state) => state.refresh);
  const [activeView, setActiveView] = useState<HistoryView>('list');
  const [filter, setFilter] = useState<HistoryFilter>(DEFAULT_HISTORY_FILTER);
  const [chartSelectionResetKey, setChartSelectionResetKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      void refresh(getDatabase());
    }, [refresh]),
  );

  const today = getLocalCalendarDate();
  const periodOptions = useMemo(
    () => listHistoryPeriods(workouts, today),
    [today, workouts],
  );

  const rows = useMemo(
    () => buildHistoryListRows(workouts, exerciseIds, today, filter),
    [exerciseIds, filter, today, workouts],
  );
  const groups = useMemo(() => groupHistoryListRows(rows), [rows]);
  const chartPoints = useMemo(
    () => buildChartSeries(workouts, filter, exerciseIds),
    [exerciseIds, filter, workouts],
  );

  // Shared empty only when there is no active history at all (unfiltered).
  const isEmpty = useMemo(
    () => buildHistoryListRows(workouts, exerciseIds, today).length === 0,
    [exerciseIds, today, workouts],
  );

  const handleBack = useCallback(() => {
    setFilter(DEFAULT_HISTORY_FILTER);
    navigation.goBack();
  }, [navigation]);

  const handleOpenSession = useCallback(
    (date: string) => {
      navigation.navigate('SessionDetail', { date });
    },
    [navigation],
  );

  const dismissChartSelection = useCallback(() => {
    setChartSelectionResetKey((current) => current + 1);
  }, []);

  const handleViewChange = useCallback(
    (view: HistoryView) => {
      dismissChartSelection();
      setActiveView(view);
    },
    [dismissChartSelection],
  );

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
      {groups.length === 0 ? (
        <View style={styles.filterEmpty}>
          <Text style={styles.filterEmptyCopy}>
            no sessions for this filter.
          </Text>
        </View>
      ) : (
        groups.map((group, groupIndex) => {
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
                    handleOpenSession(rest.date);
                  }}
                  type="session"
                />
              ))}
              <LogRow
                dateLabel={formatHistoryDateLabel(session.date)}
                isBestRecord={session.isBestRecord}
                onPress={() => {
                  handleOpenSession(session.date);
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
        })
      )}
    </ScrollFadeView>
  );

  const chartContent = (
    <HistoryChartView
      onOpenSession={handleOpenSession}
      points={chartPoints}
      selectionResetKey={chartSelectionResetKey}
      units={units}
    />
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {isEmpty ? (
        <HistoryEmptyState onStartWorkout={handleBack} />
      ) : (
        <>
          <View style={styles.header}>
            <HistoryNavigation
              activeView={activeView}
              filters={
                <HistoryFilterBar
                  exerciseIds={exerciseIds}
                  filter={filter}
                  onChange={setFilter}
                  onInteraction={dismissChartSelection}
                  periodOptions={periodOptions}
                />
              }
              onBack={handleBack}
              onViewChange={handleViewChange}
            />
          </View>
          <View style={styles.body}>
            <HistoryViewPane active={activeView === 'list'}>
              {listContent}
            </HistoryViewPane>
            <HistoryViewPane active={activeView === 'chart'}>
              {chartContent}
            </HistoryViewPane>
          </View>
        </>
      )}
    </View>
  );
}

/**
 * Incoming-only view switch: the leaving pane hides immediately so the two
 * never overlap, and the arriving pane fades in from `INTERACTIVE_SCALE`
 * on the house spring. Reduce Motion drops the scale and keeps the 150ms fade.
 */
function HistoryViewPane({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(active ? 1 : 0);
  const scale = useSharedValue(1);
  const hasInitialized = useRef(false);

  useEffect(() => {
    const reduced = reduceMotion === true;

    if (!hasInitialized.current) {
      hasInitialized.current = true;
      opacity.value = active ? 1 : 0;
      scale.value = 1;
      return;
    }

    if (!active) {
      opacity.value = 0;
      scale.value = 1;
      return;
    }

    opacity.value = 0;
    scale.value = reduced ? 1 : INTERACTIVE_SCALE;
    opacity.value = animateWithMotionPreference(1, reduced);
    if (!reduced) {
      scale.value = animateWithMotionPreference(1, false);
    }
  }, [active, opacity, reduceMotion, scale]);

  const paneStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      pointerEvents={active ? 'auto' : 'none'}
      style={[styles.pane, paneStyle]}
    >
      {children}
    </Animated.View>
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
  body: {
    flex: 1,
  },
  pane: {
    ...StyleSheet.absoluteFill,
  },
  scroll: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing['s-8'],
    flexGrow: 1,
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
  filterEmpty: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['s-16'],
  },
  filterEmptyCopy: {
    ...typography.para2,
    color: colors['content-2'],
    ...textCase.lower,
  },
});
