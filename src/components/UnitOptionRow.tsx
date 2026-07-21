import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';

interface InputOptionUnitProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function InputOptionUnit({
  label,
  selected,
  onPress,
}: InputOptionUnitProps) {
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
          styles.label,
          selected ? styles.labelSelected : styles.labelIdle,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

interface UnitOptionRowProps<T extends string> {
  caption: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function UnitOptionRow<T extends string>({
  caption,
  options,
  value,
  onChange,
}: UnitOptionRowProps<T>) {
  return (
    <View style={styles.stack}>
      <Text style={styles.caption}>{caption}</Text>
      <View style={styles.row}>
        {options.map((option) => (
          <InputOptionUnit
            key={option.value}
            label={option.label}
            onPress={() => onChange(option.value)}
            selected={option.value === value}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing['s-5'],
    alignSelf: 'stretch',
  },
  caption: {
    ...typography.para2,
    color: colors['content-2'],
    ...textCase.lower,
  },
  row: {
    flexDirection: 'row',
    gap: spacing['s-5'],
    alignSelf: 'stretch',
  },
  pill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: spacing['s-12'],
    borderRadius: radii['r-pill'],
    borderWidth: spacing['s-1'],
    borderColor: colors['border-2'],
    backgroundColor: colors['bg-2'],
    paddingHorizontal: spacing['s-8'],
  },
  selected: {
    borderColor: colors['border-1'],
  },
  pressed: {
    backgroundColor: colors['bg-1'],
    borderColor: colors['content-3'],
  },
  label: {
    ...textCase.lower,
  },
  labelIdle: {
    color: colors['content-2'],
  },
  labelSelected: {
    color: colors['content-1'],
  },
});
