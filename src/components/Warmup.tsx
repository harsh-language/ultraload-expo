import { StyleSheet, Text } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { ScaledPressable } from './ScaledPressable';

interface WarmupProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

/** Figma `input-option-unit` — off (border-2 / content-2) ↔ on (border-1 / content-1). */
export function Warmup({ value, onValueChange }: WarmupProps) {
  return (
    <ScaledPressable
      accessibilityLabel="warmup"
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      style={[styles.pill, value && styles.on]}
    >
      <Text
        style={[
          value ? typography.para1 : typography.para2,
          value ? styles.labelOn : styles.labelOff,
        ]}
      >
        W
      </Text>
    </ScaledPressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: spacing['s-12'],
    minWidth: spacing['s-12'],
    paddingHorizontal: spacing['s-8'],
    borderRadius: radii['r-pill'],
    borderWidth: spacing['s-1'],
    borderColor: colors['border-2'],
    backgroundColor: colors['bg-2'],
  },
  on: {
    borderColor: colors['border-1'],
  },
  labelOff: {
    color: colors['content-2'],
  },
  labelOn: {
    color: colors['content-1'],
  },
});
