import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';
import { CheckmarkIcon } from './icons/CheckmarkIcon';

interface InputOptionProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function InputOption({ label, selected, onPress }: InputOptionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          selected ? typography.para1 : typography.para2,
          styles.labelBase,
          selected ? styles.labelSelected : styles.label,
        ]}
      >
        {label}
      </Text>
      <CheckmarkIcon
        color={selected ? colors['content-1'] : colors['border-2']}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: spacing['s-12'],
    borderRadius: radii['r-pill'],
    borderWidth: spacing['s-1'],
    borderColor: colors['border-2'],
    backgroundColor: colors['bg-2'],
    paddingHorizontal: spacing['s-8'],
    gap: spacing['s-5'],
  },
  selected: {
    borderColor: colors['border-1'],
  },
  pressed: {
    backgroundColor: colors['bg-1'],
    borderColor: colors['content-3'],
  },
  labelBase: {
    flex: 1,
    ...textCase.lower,
  },
  label: {
    color: colors['content-2'],
  },
  labelSelected: {
    color: colors['content-1'],
  },
});
