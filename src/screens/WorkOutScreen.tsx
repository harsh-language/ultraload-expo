import { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, type ScrollView } from 'react-native';
import { ScrollFadeView } from '../components/ScrollFadeView';
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
import { LogRow } from '../components/LogRow';
import { PrimaryButton } from '../components/PrimaryButton';
import { RestTimer } from '../components/RestTimer';
import { SecondaryButton } from '../components/SecondaryButton';
import { TodaySessionTitleBar } from '../components/TodaySessionTitleBar';
import { useHomepageOptionsMenu } from '../components/useHomepageOptionsMenu';
import { getDatabase } from '../db/client';
import { loadStandardSetsForExercise } from '../db/workoutRepository';
import { getExerciseLabel } from '../domain/catalogue';
import { getReferenceWeightFromHistory } from '../domain/warmup';
import { useRestTimer } from '../hooks/useRestTimer';
import {
  usePlanStore,
  useProfileStore,
  useTodayStore,
} from '../stores';
import type { TodaySet } from '../stores/todaySlice';
import { colors, spacing } from '../theme/tokens';
import { SCROLL_FADE_HEIGHT } from '../theme/scrollFade';

/** Figma — gap between footer buttons and screen bottom / title bar and status bar. */
const FOOTER_BOTTOM_GAP = spacing['s-8'];
const TITLE_TOP_GAP = spacing['s-8'];
/** Matches `SessionTitleBar` minHeight. */
const TITLE_BAR_HEIGHT = spacing['s-11'];
/** Figma — horizontal inset for empty-state centred button stack. */
const EMPTY_STATE_BUTTON_INSET = spacing['s-11'];
/** Figma — horizontal inset for logged-in footer button row. */
const FOOTER_HORIZONTAL_INSET = spacing['s-8'];
/** Matches primary/secondary button minHeight (`ButtonShell`). */
const PINNED_FOOTER_HEIGHT = spacing['s-12'];
/** Figma timer bar: top border + s-8 vertical padding + 60px controls. */
const REST_TIMER_HEIGHT = spacing['s-1'] + spacing['s-8'] * 2 + spacing['s-12'];
/** Figma gap between the add-set button and the started timer bar. */
const REST_TIMER_BUTTON_GAP = spacing['s-8'];
/** Lifts scroll bottom fade above pinned footer row. */
const SCROLL_FADE_BOTTOM_OFFSET = FOOTER_BOTTOM_GAP + PINNED_FOOTER_HEIGHT;

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

function clampSafeInset(value: number): number {
  return Math.max(value, spacing['s-5']);
}

/** Figma section gap (title→session) + session paddingTop — both s-8. */
const TITLE_TO_SESSION_GAP = spacing['s-8'];
const SESSION_TOP_PADDING = spacing['s-8'];

/** Scroll content clears sticky title + Figma title→session gap + session top pad. */
function getScrollTopInset(insets: { top: number }): number {
  return (
    clampSafeInset(insets.top) +
    TITLE_TOP_GAP +
    TITLE_BAR_HEIGHT +
    TITLE_TO_SESSION_GAP +
    SESSION_TOP_PADDING
  );
}

/** Scroll content clears sticky footer: home indicator + bottom gap + buttons + list gap. */
function getScrollBottomInset(insets: { bottom: number }): number {
  return (
    clampSafeInset(insets.bottom) +
    FOOTER_BOTTOM_GAP +
    PINNED_FOOTER_HEIGHT +
    spacing['s-8']
  );
}

function getTimerScrollBottomInset(insets: { bottom: number }): number {
  return (
    clampSafeInset(insets.bottom) +
    REST_TIMER_HEIGHT +
    REST_TIMER_BUTTON_GAP +
    PINNED_FOOTER_HEIGHT +
    spacing['s-8']
  );
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

export function WorkOutScreen() {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<AddSetSheetHandle>(null);
  const deleteSheetRef = useRef<DeleteSetSheetHandle>(null);
  const scrollRef = useRef<ScrollView>(null);
  const scrollToEndOnContentChangeRef = useRef(false);
  const { menuButtonRef, handleMenuPress, menu, menuVisible } = useHomepageOptionsMenu();
  const [addSetSheetVisible, setAddSetSheetVisible] = useState(false);
  const [deleteSetSheetVisible, setDeleteSetSheetVisible] = useState(false);
  const [referenceWeightByExerciseId, setReferenceWeightByExerciseId] = useState<
    Record<string, number | null>
  >({});

  const bodyweight = useProfileStore((state) => state.bodyweight);
  const restTimerSeconds = useProfileStore((state) => state.restTimerSeconds);
  const warmUpAutoTagEnabled = useProfileStore(
    (state) => state.warmUpAutoTagEnabled,
  );
  const warmUpPercent = useProfileStore((state) => state.warmUpPercent);
  const exerciseIds = usePlanStore((state) => state.exerciseIds);
  const workout = useTodayStore((state) => state.workout);
  const recordSet = useTodayStore((state) => state.recordSet);
  const updateSet = useTodayStore((state) => state.updateSet);
  const deleteSet = useTodayStore((state) => state.deleteSet);

  const {
    remainingSeconds,
    totalSeconds,
    isRunning: timerRunning,
    startTimer,
    toggleTimer,
    dismissTimer,
  } = useRestTimer();

  const refreshReferenceWeights = useCallback(async () => {
    const weights = await loadReferenceWeightByExerciseId(exerciseIds);
    setReferenceWeightByExerciseId(weights);
  }, [exerciseIds]);

  const openSheet = useCallback(async () => {
    await refreshReferenceWeights();
    setAddSetSheetVisible(true);
    sheetRef.current?.present();
  }, [refreshReferenceWeights]);

  const handleEditSet = useCallback((set: TodaySet, exerciseId: string) => {
    setAddSetSheetVisible(true);
    const editableSet: EditableSet = {
      id: set.id,
      exerciseId,
      weight: set.weight,
      reps: set.reps,
      warmUp: set.warmUp,
    };
    sheetRef.current?.presentForEdit(editableSet);
  }, []);

  const handleRecord = useCallback(
    async (payload: {
      exerciseId: string;
      weight: number;
      reps: number;
      warmUp: boolean;
    }) => {
      const db = getDatabase();
      await recordSet(db, payload);
      scrollToEndOnContentChangeRef.current = true;
    },
    [recordSet],
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
      const db = getDatabase();
      await updateSet(db, {
        setId,
        weight: payload.weight,
        reps: payload.reps,
        warmUp: payload.warmUp,
      });
    },
    [updateSet],
  );

  const handleRequestDelete = useCallback((set: DeletableSet) => {
    deleteSheetRef.current?.present(set);
  }, []);

  const handleConfirmDelete = useCallback(
    async (setId: number) => {
      const db = getDatabase();
      await deleteSet(db, setId);
    },
    [deleteSet],
  );

  const handleScrollContentSizeChange = useCallback(() => {
    if (!scrollToEndOnContentChangeRef.current) {
      return;
    }

    scrollToEndOnContentChangeRef.current = false;
    scrollRef.current?.scrollToEnd({ animated: false });
  }, []);

  const hasSets = (workout?.loggedExercises.length ?? 0) > 0;
  const sheetChromeHidden = addSetSheetVisible || deleteSetSheetVisible;
  const timerBarVisible =
    remainingSeconds != null && totalSeconds != null;

  const handleStartTimer = useCallback(() => {
    void startTimer(restTimerSeconds);
  }, [restTimerSeconds, startTimer]);

  const titleBar = (
    <TodaySessionTitleBar
      menuButtonRef={menuButtonRef}
      menuOpen={menuVisible}
      onMenuPress={handleMenuPress}
      workout={workout}
    />
  );

  const scrollContentStyle = useMemo(
    () => [
      styles.scrollContent,
      {
        paddingTop: getScrollTopInset(insets),
        paddingBottom: timerBarVisible
          ? getTimerScrollBottomInset(insets)
          : getScrollBottomInset(insets),
      },
    ],
    [insets, timerBarVisible],
  );

  const overlayInsets = useMemo(
    () => ({
      titleTop: { top: TITLE_TOP_GAP + clampSafeInset(insets.top) },
      footerBottom: { bottom: FOOTER_BOTTOM_GAP + clampSafeInset(insets.bottom) },
    }),
    [insets],
  );

  const footerButtons = useMemo(
    () => (
      <>
        {!timerBarVisible ? (
          <SecondaryButton
            label={hasSets ? 'start timer' : 'start rest timer'}
            leadingIcon="clock"
            onPress={handleStartTimer}
            style={
              !hasSets
                ? styles.footerButtonStacked
                : styles.footerAction
            }
          />
        ) : null}
        <PrimaryButton
          label={hasSets ? 'add set' : 'add new set'}
          leadingIcon="plus"
          onPress={() => {
            void openSheet();
          }}
          style={
            !hasSets ? styles.footerButtonStacked : styles.footerAction
          }
          trailingIcon="none"
        />
      </>
    ),
    [handleStartTimer, hasSets, openSheet, timerBarVisible],
  );

  return (
    <View style={styles.container}>
      {hasSets ? (
        <ScrollFadeView
          ref={scrollRef}
          alwaysShowBottomFade
          topFadeHeight={SCROLL_FADE_HEIGHT}
          bottomFadeHeight={SCROLL_FADE_HEIGHT}
          topOffset={overlayInsets.titleTop.top + TITLE_BAR_HEIGHT}
          bottomOffset={SCROLL_FADE_BOTTOM_OFFSET}
          contentContainerStyle={scrollContentStyle}
          onContentSizeChange={handleScrollContentSizeChange}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
        >
          <View style={styles.session}>
            {workout?.loggedExercises.map((loggedExercise) => {
              let standardSetIndex = 0;

              return (
                <View key={loggedExercise.id}>
                  <LogRow
                    title={getExerciseLabel(loggedExercise.exerciseId)}
                    type="exercise"
                  />
                  <View style={styles.logStack}>
                    {loggedExercise.sets.map((set) => {
                      if (set.warmUp) {
                        return (
                          <LogRow
                            key={set.id}
                            onDelete={() => {
                              handleRequestDelete(toDeletableSet(set));
                            }}
                            onEdit={() => {
                              void handleEditSet(set, loggedExercise.exerciseId);
                            }}
                            reps={set.reps}
                            showActions
                            type="set"
                            warmUp
                            weight={set.weight}
                          />
                        );
                      }

                      standardSetIndex += 1;
                      const setIndex = standardSetIndex;
                      return (
                        <LogRow
                          key={set.id}
                          onDelete={() => {
                            handleRequestDelete(toDeletableSet(set, setIndex));
                          }}
                          onEdit={() => {
                            void handleEditSet(set, loggedExercise.exerciseId);
                          }}
                          reps={set.reps}
                          setIndex={setIndex}
                          showActions
                          type="set"
                          weight={set.weight}
                        />
                      );
                    })}
                  </View>
                  <LogRow type="space" />
                </View>
              );
            })}
          </View>
        </ScrollFadeView>
      ) : null}

      <View
        pointerEvents={sheetChromeHidden ? 'none' : 'box-none'}
        style={[styles.titleOverlay, overlayInsets.titleTop]}
      >
        {titleBar}
      </View>

      {hasSets && timerBarVisible ? (
        <>
          <View
            pointerEvents={sheetChromeHidden ? 'none' : 'box-none'}
            style={[
              styles.timerAddSetOverlay,
              {
                bottom:
                  clampSafeInset(insets.bottom) +
                  REST_TIMER_HEIGHT +
                  REST_TIMER_BUTTON_GAP,
              },
            ]}
          >
            <PrimaryButton
              label="add set"
              leadingIcon="plus"
              onPress={() => {
                void openSheet();
              }}
              trailingIcon="none"
            />
          </View>
          <View
            pointerEvents={sheetChromeHidden ? 'none' : 'box-none'}
            style={[
              styles.timerFooterOverlay,
              { bottom: clampSafeInset(insets.bottom) },
            ]}
          >
            <RestTimer
              isRunning={timerRunning}
              onDismiss={() => {
                void dismissTimer();
              }}
              onToggle={() => {
                void toggleTimer();
              }}
              remainingSeconds={remainingSeconds}
              totalSeconds={totalSeconds}
            />
          </View>
        </>
      ) : hasSets ? (
        <View
          pointerEvents={sheetChromeHidden ? 'none' : 'box-none'}
          style={[
            styles.footerOverlay,
            styles.footerRow,
            overlayInsets.footerBottom,
          ]}
        >
          {footerButtons}
        </View>
      ) : (
        <View
          pointerEvents={sheetChromeHidden ? 'none' : 'auto'}
          style={[
            styles.footerEmpty,
            {
              paddingTop:
                overlayInsets.titleTop.top + TITLE_BAR_HEIGHT,
              paddingBottom: overlayInsets.footerBottom.bottom,
            },
          ]}
        >
          <View style={styles.footerEmptyButtons}>{footerButtons}</View>
        </View>
      )}

      {!hasSets && timerBarVisible ? (
        <View
          pointerEvents={sheetChromeHidden ? 'none' : 'box-none'}
          style={[
            styles.timerFooterOverlay,
            { bottom: clampSafeInset(insets.bottom) },
          ]}
        >
          <RestTimer
            isRunning={timerRunning}
            onDismiss={() => {
              void dismissTimer();
            }}
            onToggle={() => {
              void toggleTimer();
            }}
            remainingSeconds={remainingSeconds}
            totalSeconds={totalSeconds}
          />
        </View>
      ) : null}

      {menu}

      <AddSetSheet
        ref={sheetRef}
        bodyweight={bodyweight}
        exerciseIds={exerciseIds}
        onRecord={handleRecord}
        onUpdate={handleUpdate}
        onVisibilityChange={setAddSetSheetVisible}
        referenceWeightByExerciseId={referenceWeightByExerciseId}
        todayWorkout={workout}
        warmUpAutoTagEnabled={warmUpAutoTagEnabled}
        warmUpPercent={warmUpPercent}
      />

      <DeleteSetSheet
        ref={deleteSheetRef}
        onConfirm={(setId) => {
          void handleConfirmDelete(setId);
        }}
        onVisibilityChange={setDeleteSetSheetVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors['bg-1'],
  },
  scroll: {
    flex: 1,
    paddingHorizontal: FOOTER_HORIZONTAL_INSET,
  },
  scrollContent: {
    gap: spacing['s-8'],
  },
  session: {
    paddingBottom: spacing['s-8'],
  },
  logStack: {
    gap: 0,
  },
  titleOverlay: {
    position: 'absolute',
    left: FOOTER_HORIZONTAL_INSET,
    right: FOOTER_HORIZONTAL_INSET,
    zIndex: 10,
  },
  footerOverlay: {
    position: 'absolute',
    left: FOOTER_HORIZONTAL_INSET,
    right: FOOTER_HORIZONTAL_INSET,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['s-8'],
  },
  footerEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  footerEmptyButtons: {
    marginHorizontal: EMPTY_STATE_BUTTON_INSET,
    flexDirection: 'column',
    gap: spacing['s-8'],
  },
  footerAction: {
    flex: 1,
    minWidth: 0,
    flexBasis: 0,
  },
  timerAddSetOverlay: {
    position: 'absolute',
    left: FOOTER_HORIZONTAL_INSET,
    right: FOOTER_HORIZONTAL_INSET,
  },
  timerFooterOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  footerButtonStacked: {
    alignSelf: 'stretch',
    flex: 0,
    width: '100%',
  },
});
