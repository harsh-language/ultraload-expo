import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { colors, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';
import { useEnterRevealAnimation } from './useEnterRevealAnimation';

interface SessionTitleBarProps {
  dateLabel: string;
  totalLabel?: string;
}

export function SessionTitleBar({ dateLabel, totalLabel }: SessionTitleBarProps) {
  const showTotal = totalLabel != null;
  const { mounted, animatedStyle } = useEnterRevealAnimation(showTotal);

  return (
    <View style={styles.row}>
      <Text style={styles.date}>{dateLabel}</Text>
      {mounted ? (
        <Animated.View style={animatedStyle}>
          <Text numberOfLines={1} style={styles.total}>
            {totalLabel}
          </Text>
        </Animated.View>
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
