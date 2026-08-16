import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { colors, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';
import { useEnterRevealAnimation } from './useEnterRevealAnimation';

const AnimatedText = Animated.createAnimatedComponent(Text);

interface SessionTitleBarProps {
  dateLabel: string;
  totalLabel?: string;
  trailing?: ReactNode;
}

export function SessionTitleBar({
  dateLabel,
  totalLabel,
  trailing,
}: SessionTitleBarProps) {
  const showTotal = totalLabel != null;
  const { mounted, animatedStyle } = useEnterRevealAnimation(showTotal);

  return (
    <View style={styles.row}>
      <View style={styles.leading}>
        <Text style={styles.date}>{dateLabel}</Text>
        {mounted ? (
          <AnimatedText
            numberOfLines={1}
            style={[styles.total, animatedStyle]}
          >
            {totalLabel}
          </AnimatedText>
        ) : null}
      </View>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: spacing['s-11'],
  },
  leading: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing['s-7'],
    minWidth: 0,
  },
  date: {
    ...typography.brand1,
    ...textCase.lower,
  },
  total: {
    ...typography.brand3,
    color: colors['content-3'],
    ...textCase.none,
    flexShrink: 1,
  },
});
