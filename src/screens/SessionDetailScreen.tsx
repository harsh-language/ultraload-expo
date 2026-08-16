import { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AddSetSheet,
  type AddSetSheetHandle,
  type EditableSet,
} from '../components/AddSetSheet';
import {
  DeleteSetSheet,
  type DeletableSet,
  type DeleteSetSheetHandle,
} from '../components/DeleteSetSheet';
import { IconButton } from '../components/IconButton';
import { LoggedSetRows } from '../components/LoggedSetRows';
import { LogRow } from '../components/LogRow';
import { ScreenTitleBar } from '../components/ScreenTitleBar';
import { ScrollFadeView } from '../components/ScrollFadeView';
import { BackIcon } from '../components/icons/BackIcon';
import { ArrowPathDownIcon } from '../components/icons/ArrowPathDownIcon';
import { ArrowPathUpIcon } from '../components/icons/ArrowPathUpIcon';
import { PlusIcon } from '../components/icons/PlusIcon';
import { getDatabase } from '../db/client';
import { loadReferenceWeightByExerciseId } from '../db/referenceWeights';
import { getExerciseLabel } from '../domain/catalogue';
import { formatHistoryDateLabel } from '../domain/history-date';
import {
  buildSessionExerciseStats,
  filterWorkoutByPlan,
  formatPercentChange,
  getDayPercentChange,
  getPercentDirection,
} from '../domain/progress';
import {
  formatSessionTotalWeightLabel,
  getSessionTotalWeightMoved,
  hasStandardSets,
} from '../domain/session-totals';
import { getUnitLabel } from '../domain/units';
import type { MainStackParamList } from '../navigation/types';
import {
  useHistoryStore,
  usePlanStore,
  useProfileStore,
} from '../stores';
import type { TodaySet } from '../stores/todaySlice';
import { clampSafeInset } from '../theme/safeAreaInset';
import { colors, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';

type Props = NativeStackScreenProps<MainStackParamList, 'SessionDetail'>;

/** Figma `title-main` height (2468:4714 / 2470:10433). */
const TITLE_MAIN_HEIGHT = spacing['s-14'];
/** Figma bottom-fade on session detail. */
const SESSION_BOTTOM_FADE_HEIGHT = spacing['s-14'];
/** Figma title-main arrow-path-up instance size. */
const SUMMARY_STAT_ICON_SIZE = spacing['s-9'];

export function SessionDetailScreen({ navigation, route }: Props) {
  const { date } = route.params;
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<AddSetSheetHandle>(null);
  const deleteSheetRef = useRef<DeleteSetSheetHandle>(null);

  const [addSetSheetVisible, setAddSetSheetVisible] = useState(false);
  const [deleteSetSheetVisible, setDeleteSetSheetVisible] = useState(false);
  const [referenceWeightByExerciseId, setReferenceWeightByExerciseId] = useState<
    Record<string, number | null>
  >({});

  const units = useProfileStore((state) => state.units);
  const warmUpAutoTagEnabled = useProfileStore(
    (state) => state.warmUpAutoTagEnabled,
  );
  const warmUpPercent = useProfileStore((state) => state.warmUpPercent);
  const exerciseIds = usePlanStore((state) => state.exerciseIds);
  const workouts = useHistoryStore((state) => state.workouts);
  const recordSet = useHistoryStore((state) => state.recordSet);
  const updateSet = useHistoryStore((state) => state.updateSet);
  const deleteSet = useHistoryStore((state) => state.deleteSet);
  const unitLabel = getUnitLabel(units);

  const workout = useMemo(
    () => workouts.find((entry) => entry.date === date) ?? null,
    [date, workouts],
  );

  const visibleWorkout = useMemo(() => {
    if (!workout) {
      return null;
    }
    return filterWorkoutByPlan(workout, exerciseIds);
  }, [exerciseIds, workout]);

  const exerciseStats = useMemo(
    () => buildSessionExerciseStats(workouts, date, exerciseIds),
    [date, exerciseIds, workouts],
  );

  const statsByExerciseId = useMemo(() => {
    const map = new Map(
      exerciseStats.map((stat) => [stat.exerciseId, stat] as const),
    );
    return map;
  }, [exerciseStats]);

  const dayPercent = useMemo(() => {
    return getDayPercentChange(
      exerciseStats.map((stat) => stat.percentChange),
    );
  }, [exerciseStats]);

  const sessionTotal = visibleWorkout
    ? getSessionTotalWeightMoved(visibleWorkout)
    : 0;
  const showTotal = hasStandardSets(visibleWorkout);
  const hasSets = (visibleWorkout?.loggedExercises.length ?? 0) > 0;
  const sheetChromeHidden = addSetSheetVisible || deleteSetSheetVisible;

  const refreshReferenceWeights = useCallback(async () => {
    const weights = await loadReferenceWeightByExerciseId(
      getDatabase(),
      exerciseIds,
    );
    setReferenceWeightByExerciseId(weights);
  }, [exerciseIds]);

  const openAddSheet = useCallback(async () => {
    await refreshReferenceWeights();
    setAddSetSheetVisible(true);
    sheetRef.current?.present();
  }, [refreshReferenceWeights]);

  const handleEditSet = useCallback(
    (set: TodaySet, exerciseId: string, setIndex?: number) => {
      setAddSetSheetVisible(true);
      const editableSet: EditableSet = {
        id: set.id,
        exerciseId,
        weight: set.weight,
        reps: set.reps,
        warmUp: set.warmUp,
        setIndex,
      };
      sheetRef.current?.presentForEdit(editableSet);
    },
    [],
  );

  const handleRequestDelete = useCallback((set: DeletableSet) => {
    setDeleteSetSheetVisible(true);
    deleteSheetRef.current?.present(set);
  }, []);

  const handleRecord = useCallback(
    async (payload: {
      exerciseId: string;
      weight: number;
      reps: number;
      warmUp: boolean;
    }) => {
      await recordSet(getDatabase(), date, payload);
    },
    [date, recordSet],
  );

  const handleUpdate = useCallback(
    async (
      setId: number,
      payload: {
        exerciseId: string;
        weight: number;
        reps: number;
        warmUp: boolean;
      },
    ) => {
      await updateSet(getDatabase(), {
        setId,
        weight: payload.weight,
        reps: payload.reps,
        warmUp: payload.warmUp,
      });
    },
    [updateSet],
  );

  const handleDelete = useCallback(
    async (setId: number) => {
      await deleteSet(getDatabase(), setId);
    },
    [deleteSet],
  );

  return (
    <View style={styles.container}>
      <View
        pointerEvents={sheetChromeHidden ? 'none' : 'box-none'}
        style={[
          styles.header,
          { paddingTop: clampSafeInset(insets.top) },
        ]}
      >
        <ScreenTitleBar>
          <IconButton
            accessibilityLabel="back"
            onPress={() => {
              navigation.goBack();
            }}
            size="small"
          >
            <BackIcon />
          </IconButton>
          <Text style={styles.dateTitle}>
            {formatHistoryDateLabel(date)}
          </Text>
          <IconButton
            accessibilityLabel="add set"
            onPress={() => {
              void openAddSheet();
            }}
            size="small"
            variant="primary"
          >
            <PlusIcon />
          </IconButton>
        </ScreenTitleBar>
      </View>

      {hasSets && visibleWorkout ? (
        <>
          <ScrollFadeView
            bottomFadeHeight={SESSION_BOTTOM_FADE_HEIGHT}
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingBottom:
                  spacing['s-8'] +
                  spacing['s-8'] +
                  clampSafeInset(insets.bottom),
              },
            ]}
            showsVerticalScrollIndicator={false}
            style={styles.scroll}
            topFadeEnabled={false}
          >
            {showTotal ? (
              <View style={styles.summary}>
                <Text style={styles.summaryTotal}>
                  {formatSessionTotalWeightLabel(sessionTotal, units)}
                </Text>
                {dayPercent != null && dayPercent !== 0 ? (
                  <View style={styles.summaryStat}>
                    <Text style={styles.summaryPercent}>
                      {formatPercentChange(dayPercent)}
                    </Text>
                    {getPercentDirection(dayPercent) === 'up' ? (
                      <ArrowPathUpIcon
                        color={colors['content-1']}
                        size={SUMMARY_STAT_ICON_SIZE}
                      />
                    ) : null}
                    {getPercentDirection(dayPercent) === 'down' ? (
                      <ArrowPathDownIcon
                        color={colors['content-1']}
                        size={SUMMARY_STAT_ICON_SIZE}
                      />
                    ) : null}
                  </View>
                ) : dayPercent == null ? (
                  <Text style={styles.summaryPercentMissing}>—</Text>
                ) : null}
              </View>
            ) : null}

            <View style={styles.session}>
              {visibleWorkout.loggedExercises.map(
                (loggedExercise, exerciseIndex) => {
                  const exerciseStat = statsByExerciseId.get(
                    loggedExercise.exerciseId,
                  );
                  const showExerciseStat =
                    exerciseStat?.percentChange != null &&
                    exerciseStat.percentChange !== 0;
                  const isLastExercise =
                    exerciseIndex ===
                    visibleWorkout.loggedExercises.length - 1;

                  return (
                    <View key={loggedExercise.id}>
                      <LogRow
                        showStat={showExerciseStat}
                        stat={
                          showExerciseStat
                            ? {
                                label: formatPercentChange(
                                  exerciseStat.percentChange!,
                                ),
                                direction: getPercentDirection(
                                  exerciseStat.percentChange!,
                                ),
                              }
                            : undefined
                        }
                        title={getExerciseLabel(loggedExercise.exerciseId)}
                        type="exercise"
                      />
                      <LoggedSetRows
                        exerciseId={loggedExercise.exerciseId}
                        onDelete={handleRequestDelete}
                        onEdit={handleEditSet}
                        sets={loggedExercise.sets}
                        unitLabel={unitLabel}
                        units={units}
                      />
                      {isLastExercise ? null : <LogRow type="space" />}
                    </View>
                  );
                },
              )}
            </View>
          </ScrollFadeView>
        </>
      ) : (
        <View style={styles.emptyBody}>
          <Text style={styles.emptyCopy}>no sets recorded</Text>
        </View>
      )}

      <AddSetSheet
        exerciseIds={exerciseIds}
        onRecord={handleRecord}
        onUpdate={handleUpdate}
        onVisibilityChange={setAddSetSheetVisible}
        ref={sheetRef}
        referenceWeightByExerciseId={referenceWeightByExerciseId}
        todayWorkout={visibleWorkout}
        units={units}
        warmUpAutoTagEnabled={warmUpAutoTagEnabled}
        warmUpPercent={warmUpPercent}
      />
      <DeleteSetSheet
        onConfirm={(setId) => {
          void handleDelete(setId);
        }}
        onVisibilityChange={setDeleteSetSheetVisible}
        ref={deleteSheetRef}
        units={units}
      />
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
  dateTitle: {
    ...typography.brand1,
    color: colors['content-1'],
    flex: 1,
    ...textCase.lower,
  },
  scroll: {
    flex: 1,
  },
  /** No horizontal pad — `title-main` is full-bleed; session supplies inset. */
  scrollContent: {
    paddingTop: 0,
  },
  /** Figma `title-main` (2470:10433) — scrolls with session content. */
  summary: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['s-5'],
    height: TITLE_MAIN_HEIGHT,
    paddingHorizontal: spacing['s-8'],
    borderBottomWidth: spacing['s-1'],
    borderBottomColor: colors['border-2'],
    backgroundColor: colors['bg-1'],
  },
  summaryTotal: {
    ...typography.brand2,
    color: colors['content-3'],
    flex: 1,
    ...textCase.none,
  },
  summaryStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['s-4'],
  },
  summaryPercent: {
    ...typography.brand2,
    color: colors['content-1'],
    ...textCase.none,
  },
  summaryPercentMissing: {
    ...typography.brand2,
    color: colors['content-3'],
    ...textCase.none,
  },
  /** Figma `section` pad s-8 around session log. */
  session: {
    width: '100%',
    paddingHorizontal: spacing['s-8'],
    paddingTop: spacing['s-8'],
  },
  emptyBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['s-11'],
  },
  emptyCopy: {
    ...typography.para2,
    color: colors['content-2'],
    ...textCase.lower,
  },
});
