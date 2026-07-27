import type { ReactNode } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import { colors, spacing } from '../../theme/tokens';
import { ScaledPressable } from '../ScaledPressable';
import {
  cloneIconWithColor,
  pressedIconColor,
} from './pressedIconColor';

export type IconLinkSize = 'narrow' | 'square';

interface IconLinkProps {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel: string;
  /** `narrow` = 30×60 (LogRow); `square` = 60×60 (InputTag). Default narrow. */
  size?: IconLinkSize;
  /** Resting tint when the parent control is in a pressed/selected state. */
  muted?: boolean;
  style?: ViewStyle;
}

/** Figma icon-link — pressed icon uses content-2 */
export function IconLink({
  children,
  onPress,
  accessibilityLabel,
  size = 'narrow',
  muted = false,
  style,
}: IconLinkProps) {
  const dimensionStyle =
    size === 'square' ? styles.hitSquare : styles.hitNarrow;

  return (
    <ScaledPressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={[dimensionStyle, style]}
    >
      {({ pressed }) =>
        cloneIconWithColor(
          children,
          muted
            ? colors['content-2']
            : pressedIconColor(Boolean(pressed && onPress)),
        )
      }
    </ScaledPressable>
  );
}

const styles = StyleSheet.create({
  hitNarrow: {
    width: spacing['s-9'],
    height: spacing['s-12'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  hitSquare: {
    width: spacing['s-12'],
    height: spacing['s-12'],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
