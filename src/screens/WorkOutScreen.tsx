import { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, type ScrollView } from 'react-native';
import { ScrollFadeView } from '../components/ScrollFadeView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddSetSheet, type AddSetSheetHandle } from '../components/AddSetSheet';
import { LogRow } from '../components/LogRow';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { TodaySessionTitleBar } from '../components/TodaySessionTitleBar';
import { useHomepageOptionsMenu } from '../components/useHomepageOptionsMenu';
import { getDatabase } from '../db/client';
import { getExerciseLabel } from '../domain/catalogue';
import {
  usePlanStore,
  useProfileStore,
  useTodayStore,
} from '../stores';
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
/** Lifts scroll bottom fade above pinned footer row. */
const SCROLL_FADE_BOTTOM_OFFSET = FOOTER_BOTTOM_GAP + PINNED_FOOTER_HEIGHT;

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

export function WorkOutScreen() {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<AddSetSheetHandle>(null);
  const scrollRef = useRef<ScrollView>(null);
  const scrollToEndOnContentChangeRef = useRef(false);
  const { menuButtonRef, handleMenuPress, menu, menuVisible } = useHomepageOptionsMenu();
  const [addSetSheetVisible, setAddSetSheetVisible] = useState(false);

  const bodyweight = useProfileStore((state) => state.bodyweight);
  const warmUpAutoTagEnabled = useProfileStore(
    (state) => state.warmUpAutoTagEnabled,
  );
  const warmUpPercent = useProfileStore((state) => state.warmUpPercent);
  const exerciseIds = usePlanStore((state) => state.exerciseIds);
  const workout = useTodayStore((state) => state.workout);
  const recordSet = useTodayStore((state) => state.recordSet);

  const openSheet = useCallback(() => {
    setAddSetSheetVisible(true);
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
        paddingBottom: getScrollBottomInset(insets),
      },
    ],
    [insets],
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
        <PrimaryButton
          label={hasSets ? 'add set' : 'add new set'}
          leadingIcon="plus"
          onPress={openSheet}
          style={
            !hasSets ? styles.footerButtonStacked : styles.footerAction
          }
          trailingIcon="none"
        />
      </>
    ),
    [handleStartTimer, hasSets, openSheet],
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
      ) : null}

      <View
        pointerEvents={addSetSheetVisible ? 'none' : 'box-none'}
        style={[styles.titleOverlay, overlayInsets.titleTop]}
      >
        {titleBar}
      </View>

      {hasSets ? (
        <View
          pointerEvents={addSetSheetVisible ? 'none' : 'box-none'}
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
          pointerEvents={addSetSheetVisible ? 'none' : 'auto'}
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

      {menu}

      <AddSetSheet
        ref={sheetRef}
        bodyweight={bodyweight}
        exerciseIds={exerciseIds}
        onRecord={handleRecord}
        onVisibilityChange={setAddSetSheetVisible}
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
  footerButtonStacked: {
    alignSelf: 'stretch',
    flex: 0,
    width: '100%',
  },
});
