import type { ReactNode } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { spacing } from '../../theme/tokens';
import {
  cloneIconWithColor,
  pressedIconColor,
} from './pressedIconColor';

interface IconLinkProps {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel: string;
  style?: ViewStyle;
}

/** Figma icon-link — 30×60 touch target; pressed icon uses content-2 */
export function IconLink({
  children,
  onPress,
  accessibilityLabel,
  style,
}: IconLinkProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={[styles.hitArea, style]}
    >
      {({ pressed }) =>
        cloneIconWithColor(
          children,
          pressedIconColor(Boolean(pressed && onPress)),
        )
      }
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hitArea: {
    width: spacing['s-9'],
    height: spacing['s-12'],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
