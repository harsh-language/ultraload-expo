import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';

interface SessionTitleBarProps {
  dateLabel: string;
  totalLabel?: string;
}

export function SessionTitleBar({ dateLabel, totalLabel }: SessionTitleBarProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.date}>{dateLabel}</Text>
      {totalLabel ? (
        <Text style={styles.total}>{totalLabel}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: spacing['s-11'],
    gap: spacing['s-5'],
  },
  date: {
    ...typography.brand1,
    flex: 1,
    ...textCase.upper,
  },
  total: {
    ...typography.brand2,
    color: colors['content-3'],
    ...textCase.none,
  },
});
