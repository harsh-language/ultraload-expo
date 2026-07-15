import { type ReactElement } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';
import type { AppIconProps } from './icons/createIcon';
import {
  cloneIconWithColor,
  pressedIconColor,
} from './icons/pressedIconColor';

interface IconButtonProps {
  onPress: () => void;
  children: ReactElement<AppIconProps>;
  accessibilityLabel: string;
  size?: 'large' | 'small';
  /** Figma pressed state — e.g. while a anchored menu is open */
  pressed?: boolean;
}

export function IconButton({
  onPress,
  children,
  accessibilityLabel,
  size = 'large',
  pressed: pressedActive = false,
}: IconButtonProps) {
  const dimension = size === 'large' ? spacing['s-12'] : spacing['s-11'];

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ expanded: pressedActive }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { width: dimension, height: dimension },
        (pressed || pressedActive) && styles.pressed,
      ]}
    >
      {({ pressed }) =>
        cloneIconWithColor(
          children,
          pressedIconColor(pressed || pressedActive),
        )
      }
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
