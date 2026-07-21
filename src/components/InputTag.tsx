import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';
import { CloseIcon } from './icons/CloseIcon';
import { pressedIconColor } from './icons/pressedIconColor';

interface InputTagProps {
  label: string;
  onPress?: () => void;
  onRemove: () => void;
  removeDisabled?: boolean;
  selected?: boolean;
}

export function InputTag({
  label,
  onPress,
  onRemove,
  removeDisabled = false,
  selected = false,
}: InputTagProps) {
  return (
    <View style={[styles.pill, selected && styles.selected]}>
      <Pressable
        accessibilityRole={onPress ? 'button' : undefined}
        disabled={onPress == null}
        onPress={onPress}
        style={styles.labelPressable}
      >
        <Text style={styles.label}>{label}</Text>
      </Pressable>
      <Pressable
        accessibilityLabel={`remove ${label}`}
        accessibilityRole="button"
        accessibilityState={{ disabled: removeDisabled }}
        disabled={removeDisabled}
        hitSlop={spacing['s-5']}
        onPress={onRemove}
        style={({ pressed }) => [
          styles.remove,
          removeDisabled && styles.removeDisabled,
          pressed && styles.removePressed,
        ]}
      >
        {({ pressed }) => <CloseIcon color={pressedIconColor(pressed)} />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: spacing['s-12'],
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
  labelPressable: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  label: {
    ...typography.para1,
    ...textCase.lower,
  },
  remove: {
    flexShrink: 0,
  },
  removePressed: {
    opacity: 0.7,
  },
  removeDisabled: {
    opacity: 0.4,
  },
});
