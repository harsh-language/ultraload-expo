import { useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { ScrollFadeView } from '../components/ScrollFadeView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddSetSheet, type AddSetSheetHandle } from '../components/AddSetSheet';
import { LogRow } from '../components/LogRow';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { TodaySessionTitleBar } from '../components/TodaySessionTitleBar';
import { getDatabase } from '../db/client';
import { getExerciseLabel } from '../domain/catalogue';
import {
  usePlanStore,
  useProfileStore,
  useTodayStore,
} from '../stores';
import { colors, spacing } from '../theme/tokens';

export function WorkOutScreen() {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<AddSetSheetHandle>(null);

  const bodyweight = useProfileStore((state) => state.bodyweight);
  const warmUpAutoTagEnabled = useProfileStore(
    (state) => state.warmUpAutoTagEnabled,
  );
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
    },
    [recordSet],
  );

  const hasSets = (workout?.loggedExercises.length ?? 0) > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing['s-7'] }]}>
      <TodaySessionTitleBar />

      {hasSets ? (
        <ScrollFadeView
          contentContainerStyle={styles.logContent}
          showsVerticalScrollIndicator={false}
          style={styles.logScroll}
        >
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
        </ScrollFadeView>
      ) : (
        <View style={styles.emptyState} />
      )}

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, spacing['s-5']) },
        ]}
      >
        <SecondaryButton
          label="start rest timer"
          leadingIcon="clock"
          onPress={() => {
            // U2: rest timer countdown + notifications
          }}
          style={styles.footerSecondary}
        />
        <PrimaryButton
          label="add new set"
          leadingIcon="plus"
          onPress={openSheet}
          style={styles.footerPrimary}
          trailingIcon="none"
        />
      </View>

      <AddSetSheet
        ref={sheetRef}
        bodyweight={bodyweight}
        exerciseIds={exerciseIds}
        onRecord={handleRecord}
        warmUpAutoTagEnabled={warmUpAutoTagEnabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors['bg-1'],
    paddingHorizontal: spacing['s-7'],
    gap: spacing['s-8'],
  },
  logScroll: {
    flex: 1,
  },
  logContent: {
    paddingBottom: spacing['s-10'],
  },
  logStack: {
    gap: 0,
  },
  emptyState: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['s-8'],
    paddingTop: spacing['s-8'],
  },
  footerSecondary: {
    flex: 1,
  },
  footerPrimary: {
    flex: 1,
  },
});
