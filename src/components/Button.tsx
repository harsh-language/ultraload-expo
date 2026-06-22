import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.secondary,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          typography.labelS,
          variant === 'primary' ? styles.primaryLabel : styles.secondaryLabel,
          disabled && styles.disabledLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: spacing['s-11'],
    borderRadius: radii['r-h-48'],
    paddingHorizontal: spacing['s-8'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors['bg-5'],
  },
  secondary: {
    backgroundColor: colors['bg-trans-1'],
    borderWidth: 1,
    borderColor: colors['border-2'],
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    backgroundColor: colors['bg-3'],
  },
  primaryLabel: {
    color: colors['content-5'],
  },
  secondaryLabel: {
    color: colors['content-1'],
  },
  disabledLabel: {
    color: colors['content-3'],
  },
});
