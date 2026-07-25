import { type ReactElement } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';
import type { AppIconProps } from './icons/createIcon';
import {
  cloneIconWithColor,
  pressedIconColor,
} from './icons/pressedIconColor';

/** Figma `button-icon-2` (default) / `button-icon-1` (primary). */
export type IconButtonVariant = 'default' | 'primary';

interface IconButtonProps {
  onPress: () => void;
  children: ReactElement<AppIconProps>;
  accessibilityLabel: string;
  size?: 'large' | 'small';
  variant?: IconButtonVariant;
  /** Figma pressed state — e.g. while a anchored menu is open */
  pressed?: boolean;
}

export function IconButton({
  onPress,
  children,
  accessibilityLabel,
  size = 'large',
  variant = 'default',
  pressed: pressedActive = false,
}: IconButtonProps) {
  const dimension = size === 'large' ? spacing['s-12'] : spacing['s-11'];
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ expanded: pressedActive }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.default,
        { width: dimension, height: dimension },
        (pressed || pressedActive) &&
          (isPrimary ? styles.primaryPressed : styles.defaultPressed),
      ]}
    >
      {({ pressed }) =>
        cloneIconWithColor(
          children,
          isPrimary
            ? colors['content-5']
            : pressedIconColor(pressed || pressedActive),
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
    overflow: 'hidden',
  },
  default: {
    borderWidth: spacing['s-1'],
    borderColor: colors['border-2'],
    backgroundColor: colors['bg-2'],
  },
  defaultPressed: {
    backgroundColor: colors['bg-1'],
  },
  primary: {
    borderWidth: 0,
    backgroundColor: colors['bg-5'],
  },
  primaryPressed: {
    backgroundColor: colors['bg-4'],
  },
});
