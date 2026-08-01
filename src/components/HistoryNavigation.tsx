import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconButton } from './IconButton';
import { BackIcon } from './icons/BackIcon';
import { shadowBelow } from '../theme/shadow';
import { titleBarGradientColors } from '../theme/titleBar';
import { colors, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';

export type HistoryTab = 'list' | 'chart';

export const HISTORY_TABS = ['list', 'chart'] as const satisfies readonly HistoryTab[];

interface HistoryNavigationProps {
  activeTab: HistoryTab;
  onTabChange: (tab: HistoryTab) => void;
  onBack: () => void;
}

export function HistoryNavigation({
  activeTab,
  onTabChange,
  onBack,
}: HistoryNavigationProps) {
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
        <View style={styles.tabs}>
          <TabLabel
            active={activeTab === 'list'}
            label="list"
            onPress={() => {
              onTabChange('list');
            }}
          />
          <TabLabel
            active={activeTab === 'chart'}
            label="chart"
            onPress={() => {
              onTabChange('chart');
            }}
          />
        </View>
      </View>
    </View>
  );
}

function TabLabel({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={styles.tab}
    >
      <Text style={[styles.tabLabel, !active && styles.tabLabelInactive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    borderBottomWidth: spacing['s-1'],
    borderBottomColor: colors['border-2'],
    paddingTop: spacing['s-8'],
    paddingHorizontal: spacing['s-8'],
    paddingBottom: spacing['s-8'],
    backgroundColor: colors['bg-1'],
    zIndex: 1,
    ...shadowBelow,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['s-8'],
  },
  tabs: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['s-7'],
    overflow: 'hidden',
  },
  tab: {
    height: spacing['s-11'],
    justifyContent: 'center',
  },
  tabLabel: {
    ...typography.brand1,
    color: colors['content-1'],
    ...textCase.upper,
  },
  tabLabelInactive: {
    color: colors['content-3'],
  },
});
