import { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HistoryEmptyState } from '../components/HistoryEmptyState';
import { HistoryNavigation } from '../components/HistoryNavigation';
import { useHistoryStore, usePlanStore } from '../stores';
import { buildHistoryListRows } from '../domain/progress';
import type { MainStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<MainStackParamList, 'HistoryChart'>;

const TITLE_TOP_GAP = spacing['s-8'];

function clampSafeInset(value: number): number {
  return Math.max(value, spacing['s-5']);
}

/** U4 stub — chart content ships in U5. */
export function HistoryChartScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const exerciseIds = usePlanStore((state) => state.exerciseIds);
  const workouts = useHistoryStore((state) => state.workouts);

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
          activeTab="chart"
          onBack={handleBack}
          onTabChange={(tab) => {
            if (tab === 'list') {
              navigation.replace('HistoryList');
            }
          }}
          showTabs={!isEmpty}
        />
      </View>
      {isEmpty ? (
        <HistoryEmptyState onStartWorkout={handleStartWorkout} />
      ) : (
        <View style={styles.stub} />
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
  stub: {
    flex: 1,
  },
});
