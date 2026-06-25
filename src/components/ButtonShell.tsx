import type { ReactNode } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { radii, spacing } from '../theme/tokens';
import { shadowAbove } from '../theme/shadow';

export interface ButtonShellVariantStyles {
  base: ViewStyle;
  pressed?: ViewStyle;
  disabled?: ViewStyle;
}

interface ButtonShellProps {
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  variantStyles: ButtonShellVariantStyles;
  children: ReactNode | ((pressed: boolean) => ReactNode);
}

export function ButtonShell({
  onPress,
  disabled = false,
  style,
  variantStyles,
  children,
}: ButtonShellProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.shell,
        variantStyles.base,
        pressed && !disabled && variantStyles.pressed,
        disabled && variantStyles.disabled,
        style,
      ]}
    >
      {typeof children === 'function'
        ? ({ pressed }) => children(pressed)
        : children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignSelf: 'stretch',
    minHeight: spacing['s-12'],
    borderRadius: radii['r-pill'],
    paddingHorizontal: spacing['s-8'],
    ...shadowAbove,
  },
});
