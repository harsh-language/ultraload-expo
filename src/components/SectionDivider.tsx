import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';

interface SectionDividerProps {
  label: string;
}

export function SectionDivider({ label }: SectionDividerProps) {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing['s-5'],
  },
  line: {
    width: spacing['s-8'],
    height: spacing['s-1'],
    backgroundColor: colors['border-2'],
  },
  label: {
    ...typography.label,
    color: colors['content-2'],
    ...textCase.upper,
  },
});
