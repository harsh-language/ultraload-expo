import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../../theme/tokens';
import type { AppIconProps } from './createIcon';

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
      {({ pressed }) => {
        const iconColor =
          pressed && onPress ? colors['content-2'] : colors['content-1'];

        if (isValidElement<AppIconProps>(children)) {
          return cloneElement(children as ReactElement<AppIconProps>, {
            color: iconColor,
          });
        }

        return children;
      }}
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
