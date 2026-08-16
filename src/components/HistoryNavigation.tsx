import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconButton } from './IconButton';
import { BackIcon } from './icons/BackIcon';
import { ChartIcon } from './icons/ChartIcon';
import { ListIcon } from './icons/ListIcon';
import { shadowBelow } from '../theme/shadow';
import { titleBarGradientColors } from '../theme/titleBar';
import { colors, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';

export type HistoryView = 'list' | 'chart';

interface HistoryNavigationProps {
  activeView: HistoryView;
  onViewChange: (view: HistoryView) => void;
  onBack: () => void;
  /** Filter row under the title (Paper History `# design`). */
  filters?: ReactNode;
}

export function HistoryNavigation({
  activeView,
  onViewChange,
  onBack,
  filters,
}: HistoryNavigationProps) {
  const showingList = activeView === 'list';

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[...titleBarGradientColors]}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
        start={{ x: 0.5, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.titleRow}>
        <IconButton
          accessibilityLabel="back"
          onPress={onBack}
          size="small"
        >
          <BackIcon />
        </IconButton>
        <Text style={styles.title}>history</Text>
        <IconButton
          accessibilityLabel={showingList ? 'show chart' : 'show list'}
          onPress={() => {
            onViewChange(showingList ? 'chart' : 'list');
          }}
          size="small"
        >
          {showingList ? <ChartIcon /> : <ListIcon />}
        </IconButton>
      </View>
      {filters}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderBottomWidth: spacing['s-1'],
    borderBottomColor: colors['border-2'],
    paddingTop: spacing['s-8'],
    backgroundColor: colors['bg-1'],
    zIndex: 1,
    gap: spacing['s-8'],
    ...shadowBelow,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['s-8'],
    paddingHorizontal: spacing['s-8'],
  },
  title: {
    ...typography.brand1,
    ...textCase.upper,
    flex: 1,
    minWidth: 0,
  },
});
