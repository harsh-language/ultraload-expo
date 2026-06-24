import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';
import { TAB_LABELS, type MainTabKey } from '../navigation/mainTabs';

interface TabPlaceholderScreenProps {
  tab: MainTabKey;
}

export function TabPlaceholderScreen({ tab }: TabPlaceholderScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing['s-7'] }]}>
      <Text style={styles.title}>{TAB_LABELS[tab]}</Text>
      <Text style={styles.subtitle}>coming in a later stage</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors['bg-1'],
    paddingHorizontal: spacing['s-7'],
    gap: spacing['s-5'],
  },
  title: {
    ...typography.brand1,
    ...textCase.upper,
  },
  subtitle: {
    ...typography.para4,
    ...textCase.lower,
  },
});
