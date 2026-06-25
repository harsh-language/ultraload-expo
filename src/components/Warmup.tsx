import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';
import { CircleCheckIcon, CirclePlaceholderOnIcon } from './icons';

interface WarmupProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function warmupColor(value: boolean, pressed: boolean) {
  if (value && !pressed) {
    return colors['content-1'];
  }
  if (value && pressed) {
    return colors['content-2'];
  }
  if (!value && pressed) {
    return colors['content-3'];
  }
  return colors['content-2'];
}

export function Warmup({ value, onValueChange }: WarmupProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
    >
      {({ pressed }) => {
        const color = warmupColor(value, pressed);
        const Icon = value ? CircleCheckIcon : CirclePlaceholderOnIcon;

        return (
          <View style={styles.row}>
            <Icon color={color} />
            <Text style={[typography.para2, styles.label, { color }]}>
              warmup
            </Text>
          </View>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['s-4'],
    minHeight: spacing['s-10'],
    flexShrink: 0,
  },
  label: {
    ...textCase.lower,
  },
});
