import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';

export type MainTabKey = 'workout' | 'history' | 'settings';

interface MainNavigationProps {
  selected: MainTabKey;
  onSelect: (tab: MainTabKey) => void;
}

const TABS: { key: MainTabKey; label: string }[] = [
  { key: 'workout', label: 'Work Out' },
  { key: 'history', label: 'History' },
  { key: 'settings', label: 'Settings' },
];

export function MainNavigation({ selected, onSelect }: MainNavigationProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing['s-5']) }]}>
      <LinearGradient
        colors={[colors['content-trans-dark'], colors['bg-1']]}
        style={styles.gradient}
      />
      <View style={styles.row}>
        {TABS.map((tab) => {
          const isSelected = tab.key === selected;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelect(tab.key)}
              style={[styles.tab, isSelected && styles.tabSelected]}
            >
              <Text
                style={[
                  typography.labelS,
                  isSelected ? styles.labelSelected : styles.label,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors['bg-1'],
    borderTopWidth: 1,
    borderTopColor: colors['border-2'],
    paddingTop: spacing['s-5'],
    paddingHorizontal: spacing['s-5'],
  },
  gradient: {
    position: 'absolute',
    top: -spacing['s-8'],
    left: 0,
    right: 0,
    height: spacing['s-8'],
  },
  row: {
    flexDirection: 'row',
    gap: spacing['s-4'],
  },
  tab: {
    flex: 1,
    minHeight: spacing['s-11'],
    borderRadius: radii['r-h-48'],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors['bg-trans-1'],
  },
  tabSelected: {
    backgroundColor: colors['bg-5'],
  },
  label: {
    color: colors['content-2'],
  },
  labelSelected: {
    color: colors['content-5'],
  },
});
