import { Platform, type ViewStyle } from 'react-native';
import { tokens } from './tokens';

const shadow = tokens.layout.shadow;

/** Figma `below` drop shadow — menus, dropdowns. */
export const shadowBelow: ViewStyle =
  Platform.select({
    ios: {
      shadowColor: shadow.color,
      shadowOffset: { width: 0, height: shadow.below },
      shadowOpacity: 1,
      shadowRadius: shadow.blur / 2,
    },
    android: {
      elevation: shadow.blur,
    },
    default: {},
  }) ?? {};

/** Figma effect style `above` — upward drop shadow (sheets, sticky footers). */
export const shadowAbove: ViewStyle =
  Platform.select({
    ios: {
      shadowColor: shadow.color,
      shadowOffset: { width: 0, height: shadow.above },
      shadowOpacity: 1,
      shadowRadius: shadow.blur,
    },
    android: {
      elevation: 12,
    },
    default: {},
  }) ?? {};
