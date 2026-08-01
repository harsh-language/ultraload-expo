import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { LogRow } from '../components/LogRow';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenTitleBar } from '../components/ScreenTitleBar';
import { ScrollFadeView } from '../components/ScrollFadeView';
import { BackIcon } from '../components/icons/BackIcon';
import { ArrowPathDownIcon } from '../components/icons/ArrowPathDownIcon';
import { ArrowPathUpIcon } from '../components/icons/ArrowPathUpIcon';
import { PencilIcon } from '../components/icons/PencilIcon';
import { getDatabase } from '../db/client';
import { loadStandardSetsForExercise } from '../db/workoutRepository';
import { getExerciseLabel } from '../domain/catalogue';
import { formatHistoryDateLabel } from '../domain/history-date';
import {
  buildSessionExerciseStats,
  filterWorkoutByPlan,
  formatPercentChange,
  formatSessionTotalWeightLabel,
  getDayPercentChange,
  getPercentDirection,
  getSessionTotalWeightMoved,
  hasStandardSets,
} from '../domain/progress';
import { getUnitLabel, kgToDisplay } from '../domain/units';
import { getReferenceWeightFromHistory } from '../domain/warmup';
import type { MainStackParamList } from '../navigation/types';
import {
  useHistoryStore,
  usePlanStore,
  useProfileStore,
} from '../stores';
import type { TodaySet } from '../stores/todaySlice';
import { colors, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';
import { SCROLL_FADE_HEIGHT } from '../theme/scrollFade';

type Props = NativeStackScreenProps<MainStackParamList, 'SessionDetail'>;

const TITLE_TOP_GAP = spacing['s-8'];
const FOOTER_BOTTOM_GAP = spacing['s-8'];
const PINNED_FOOTER_HEIGHT = spacing['s-12'];
/** Figma title-main arrow-path-up instance size. */
const SUMMARY_STAT_ICON_SIZE = spacing['s-9'];

function clampSafeInset(value: number): number {
  return Math.max(value, spacing['s-5']);
}

function toDeletableSet(set: TodaySet, setIndex?: number): DeletableSet {
  if (set.warmUp) {
    return {
      id: set.id,
      weight: set.weight,
      reps: set.reps,
      warmUp: true,
    };
  }

  return {
    id: set.id,
    weight: set.weight,
    reps: set.reps,
    warmUp: false,
    setIndex,
  };
}

async function loadReferenceWeightByExerciseId(
  exerciseIds: string[],
): Promise<Record<string, number | null>> {
  const db = getDatabase();
  const weights: Record<string, number | null> = {};

  await Promise.all(
    exerciseIds.map(async (exerciseId) => {
      const standardSets = await loadStandardSetsForExercise(db, exerciseId);
      weights[exerciseId] = getReferenceWeightFromHistory(standardSets);
    }),
  );

  return weights;
}

export function SessionDetailScreen({ navigation, route }: Props) {
  const { date } = route.params;
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<AddSetSheetHandle>(null);
  const deleteSheetRef = useRef<DeleteSetSheetHandle>(null);

  const [editing, setEditing] = useState(false);
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
    const weights = await loadReferenceWeightByExerciseId(exerciseIds);
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

  useEffect(() => {
    if (workout == null) {
      navigation.goBack();
    }
  }, [navigation, workout]);

  if (!visibleWorkout || !hasSets) {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.header,
            { paddingTop: clampSafeInset(insets.top) + TITLE_TOP_GAP },
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
          </ScreenTitleBar>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        pointerEvents={sheetChromeHidden ? 'none' : 'box-none'}
        style={[
          styles.header,
          { paddingTop: clampSafeInset(insets.top) + TITLE_TOP_GAP },
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
            accessibilityLabel={editing ? 'done editing' : 'edit session'}
            onPress={() => {
              setEditing((value) => !value);
            }}
            pressed={editing}
            size="small"
          >
            <PencilIcon />
          </IconButton>
        </ScreenTitleBar>
      </View>

      <ScrollFadeView
        bottomFadeHeight={SCROLL_FADE_HEIGHT}
        bottomOffset={
          editing ? FOOTER_BOTTOM_GAP + PINNED_FOOTER_HEIGHT : 0
        }
        contentContainerStyle={[
          styles.scrollContent,
          {
            // Figma: section gap (s-8) + bottom-space (safe-area + s-8)
            paddingBottom: editing
              ? FOOTER_BOTTOM_GAP +
                PINNED_FOOTER_HEIGHT +
                clampSafeInset(insets.bottom) +
                spacing['s-8']
              : spacing['s-8'] +
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
                <Text
                  style={[
                    styles.summaryPercent,
                    getPercentDirection(dayPercent) === 'down' &&
                      styles.summaryPercentDown,
                  ]}
                >
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
                    color={colors['content-3']}
                    size={SUMMARY_STAT_ICON_SIZE}
                  />
                ) : null}
              </View>
            ) : dayPercent == null ? (
              <Text style={[styles.summaryPercent, styles.summaryPercentDown]}>
                —
              </Text>
            ) : null}
          </View>
        ) : null}

        <View style={styles.session}>
          {visibleWorkout.loggedExercises.map((loggedExercise, exerciseIndex) => {
            let standardSetIndex = 0;
            const exerciseStat = statsByExerciseId.get(
              loggedExercise.exerciseId,
            );
            const showExerciseStat =
              exerciseStat?.percentChange != null &&
              exerciseStat.percentChange !== 0;
            const isLastExercise =
              exerciseIndex === visibleWorkout.loggedExercises.length - 1;

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
                <View style={styles.logStack}>
                  {loggedExercise.sets.map((set) => {
                    if (set.warmUp) {
                      return (
                        <LogRow
                          key={set.id}
                          onDelete={
                            editing
                              ? () => {
                                  handleRequestDelete(toDeletableSet(set));
                                }
                              : undefined
                          }
                          onEdit={
                            editing
                              ? () => {
                                  void handleEditSet(
                                    set,
                                    loggedExercise.exerciseId,
                                  );
                                }
                              : undefined
                          }
                          onPress={
                            editing
                              ? () => {
                                  void handleEditSet(
                                    set,
                                    loggedExercise.exerciseId,
                                  );
                                }
                              : undefined
                          }
                          reps={set.reps}
                          showActions={editing}
                          type="set"
                          unit={unitLabel}
                          warmUp
                          weight={kgToDisplay(set.weight, units)}
                        />
                      );
                    }

                    standardSetIndex += 1;
                    const setIndex = standardSetIndex;
                    return (
                      <LogRow
                        key={set.id}
                        onDelete={
                          editing
                            ? () => {
                                handleRequestDelete(
                                  toDeletableSet(set, setIndex),
                                );
                              }
                            : undefined
                        }
                        onEdit={
                          editing
                            ? () => {
                                void handleEditSet(
                                  set,
                                  loggedExercise.exerciseId,
                                  setIndex,
                                );
                              }
                            : undefined
                        }
                        onPress={
                          editing
                            ? () => {
                                void handleEditSet(
                                  set,
                                  loggedExercise.exerciseId,
                                  setIndex,
                                );
                              }
                            : undefined
                        }
                        reps={set.reps}
                        setIndex={setIndex}
                        showActions={editing}
                        type="set"
                        unit={unitLabel}
                        weight={kgToDisplay(set.weight, units)}
                      />
                    );
                  })}
                </View>
                {isLastExercise ? null : <LogRow type="space" />}
              </View>
            );
          })}
        </View>
      </ScrollFadeView>

      {editing ? (
        <View
          pointerEvents={sheetChromeHidden ? 'none' : 'box-none'}
          style={[
            styles.footer,
            {
              bottom: clampSafeInset(insets.bottom) + FOOTER_BOTTOM_GAP,
            },
          ]}
        >
          <PrimaryButton
            label="add set"
            leadingIcon="plus"
            onPress={() => {
              void openAddSheet();
            }}
            trailingIcon="none"
          />
        </View>
      ) : null}

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
    ...textCase.upper,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing['s-8'],
    paddingTop: spacing['s-8'],
    gap: spacing['s-8'],
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['s-5'],
    height: spacing['s-12'],
  },
  summaryTotal: {
    ...typography.brand2,
    color: colors['content-2'],
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
  summaryPercentDown: {
    color: colors['content-3'],
  },
  session: {
    width: '100%',
  },
  logStack: {
    width: '100%',
  },
  footer: {
    position: 'absolute',
    left: spacing['s-8'],
    right: spacing['s-8'],
  },
});
