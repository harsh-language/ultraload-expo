import { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View, type ScrollView } from 'react-native';
import { ScrollFadeView } from '../components/ScrollFadeView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddSetSheet, type AddSetSheetHandle } from '../components/AddSetSheet';
import { LogRow } from '../components/LogRow';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { getMainNavigationHomeInset } from '../components/MainNavigation';
import { TodaySessionTitleBar } from '../components/TodaySessionTitleBar';
import { getDatabase } from '../db/client';
import { getExerciseLabel } from '../domain/catalogue';
import {
  usePlanStore,
  useProfileStore,
  useTodayStore,
} from '../stores';
import { colors, spacing } from '../theme/tokens';
import { SCROLL_FADE_HEIGHT } from '../theme/scrollFade';

/** Figma — gap between footer buttons and main navigation. */
const FOOTER_BOTTOM_GAP = spacing['s-8'];
/** Figma — horizontal inset for empty-state centred button stack. */
const EMPTY_STATE_BUTTON_INSET = spacing['s-11'];
/** Figma — horizontal inset for logged-in footer button row. */
const FOOTER_HORIZONTAL_INSET = spacing['s-8'];
/** Figma `bottom-space` — scroll content clears the overlay button row. */
const SCROLL_BOTTOM_INSET =
  FOOTER_BOTTOM_GAP + spacing['s-12'] + spacing['s-8'];

export function WorkOutScreen() {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<AddSetSheetHandle>(null);
  const scrollRef = useRef<ScrollView>(null);
  const scrollToEndOnContentChangeRef = useRef(false);

  const bodyweight = useProfileStore((state) => state.bodyweight);
  const warmUpAutoTagEnabled = useProfileStore(
    (state) => state.warmUpAutoTagEnabled,
  );
  const warmUpPercent = useProfileStore((state) => state.warmUpPercent);
  const exerciseIds = usePlanStore((state) => state.exerciseIds);
  const workout = useTodayStore((state) => state.workout);
  const recordSet = useTodayStore((state) => state.recordSet);

  const openSheet = useCallback(() => {
    sheetRef.current?.present();
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

  const handleScrollContentSizeChange = useCallback(() => {
    // Only scroll after a new set is recorded — ref resets so layout reflows do not jump the list.
    if (!scrollToEndOnContentChangeRef.current) {
      return;
    }

    scrollToEndOnContentChangeRef.current = false;
    scrollRef.current?.scrollToEnd({ animated: false });
  }, []);

  const hasSets = (workout?.loggedExercises.length ?? 0) > 0;

  const handleStartTimer = useCallback(() => {
    // U2: rest timer countdown + notifications
  }, []);

  const footerButtons = useMemo(
    () => (
      <>
        <SecondaryButton
          label={hasSets ? 'start timer' : 'start rest timer'}
          leadingIcon="clock"
          onPress={handleStartTimer}
          style={
            !hasSets
              ? styles.footerButtonStacked
              : styles.footerSecondaryAction
          }
        />
        <PrimaryButton
          label={hasSets ? 'add set' : 'add new set'}
          leadingIcon="plus"
          onPress={openSheet}
          style={
            !hasSets ? styles.footerButtonStacked : styles.footerPrimaryAction
          }
          trailingIcon="none"
        />
      </>
    ),
    [handleStartTimer, hasSets, openSheet],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing['s-7'] }]}>
      {hasSets ? (
        <ScrollFadeView
          ref={scrollRef}
          alwaysShowBottomFade
          topFadeHeight={spacing['s-14']}
          bottomFadeHeight={SCROLL_FADE_HEIGHT}
          bottomOffset={0}
          contentContainerStyle={styles.scrollContent}
          onContentSizeChange={handleScrollContentSizeChange}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
        >
          <TodaySessionTitleBar workout={workout} />

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
                            reps={set.reps}
                            type="set"
                            warmUp
                            weight={set.weight}
                          />
                        );
                      }

                      standardSetIndex += 1;
                      return (
                        <LogRow
                          key={set.id}
                          reps={set.reps}
                          setIndex={standardSetIndex}
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
      ) : (
        <View style={styles.emptyHeader}>
          <TodaySessionTitleBar workout={workout} />
        </View>
      )}

      {hasSets ? (
        <View pointerEvents="box-none" style={[styles.footerOverlay, styles.footerRow]}>
          {footerButtons}
        </View>
      ) : (
        <View style={styles.footerEmpty}>
          <View
            style={[
              styles.footerEmptyButtons,
              { paddingBottom: getMainNavigationHomeInset(insets) },
            ]}
          >
            {footerButtons}
          </View>
        </View>
      )}

      <AddSetSheet
        ref={sheetRef}
        bodyweight={bodyweight}
        exerciseIds={exerciseIds}
        onRecord={handleRecord}
        todayWorkout={workout}
        warmUpAutoTagEnabled={warmUpAutoTagEnabled}
        warmUpPercent={warmUpPercent}
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
  emptyHeader: {
    paddingHorizontal: FOOTER_HORIZONTAL_INSET,
  },
  scrollContent: {
    gap: spacing['s-8'],
    paddingBottom: SCROLL_BOTTOM_INSET,
  },
  session: {
    paddingVertical: spacing['s-8'],
  },
  logStack: {
    gap: 0,
  },
  footerOverlay: {
    position: 'absolute',
    left: FOOTER_HORIZONTAL_INSET,
    right: FOOTER_HORIZONTAL_INSET,
    bottom: FOOTER_BOTTOM_GAP,
    zIndex: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['s-5'],
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
  footerSecondaryAction: {
    flexShrink: 0,
  },
  footerPrimaryAction: {
    flex: 1,
    minWidth: 0,
  },
  footerButtonStacked: {
    alignSelf: 'stretch',
    flex: 0,
    width: '100%',
  },
});
