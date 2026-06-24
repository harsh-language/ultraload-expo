import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';

interface IconButtonProps {
  onPress: () => void;
  children: ReactNode;
  accessibilityLabel: string;
  size?: 'large' | 'small';
}

export function IconButton({
  onPress,
  children,
  accessibilityLabel,
  size = 'large',
}: IconButtonProps) {
  const dimension = size === 'large' ? spacing['s-12'] : spacing['s-11'];

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { width: dimension, height: dimension },
        pressed && styles.pressed,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii['r-pill'],
    borderWidth: spacing['s-1'],
    borderColor: colors['border-2'],
    backgroundColor: colors['bg-2'],
  },
  pressed: {
    backgroundColor: colors['bg-1'],
  },
});
