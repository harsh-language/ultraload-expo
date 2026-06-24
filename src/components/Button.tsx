import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';

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
        pressed && !disabled && (variant === 'primary' ? styles.primaryPressed : styles.secondaryPressed),
        disabled && styles.disabled,
        style,
      ]}
    >
      {({ pressed }) => (
        <Text
          style={[
            typography.para1,
            variant === 'primary' ? styles.primaryLabel : styles.secondaryLabel,
            pressed && !disabled && variant === 'secondary' && styles.secondaryPressedLabel,
            disabled && styles.disabledLabel,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: spacing['s-12'],
    borderRadius: radii['r-pill'],
    paddingHorizontal: spacing['s-8'],
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  primary: {
    backgroundColor: colors['bg-5'],
  },
  primaryPressed: {
    backgroundColor: colors['bg-4'],
  },
  secondary: {
    backgroundColor: colors['bg-2'],
    borderWidth: spacing['s-1'],
    borderColor: colors['border-1'],
  },
  secondaryPressed: {
    borderColor: colors['content-2'],
  },
  disabled: {
    backgroundColor: colors['bg-3'],
    borderColor: colors['bg-3'],
  },
  primaryLabel: {
    color: colors['content-5'],
    ...textCase.lower,
  },
  secondaryLabel: {
    color: colors['content-1'],
    ...textCase.lower,
  },
  secondaryPressedLabel: {
    color: colors['content-2'],
  },
  disabledLabel: {
    color: colors['content-5'],
  },
});
