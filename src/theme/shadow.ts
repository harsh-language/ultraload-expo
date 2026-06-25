import { Platform, type ViewStyle } from 'react-native';
import { tokens } from './tokens';

const shadow = tokens.layout.shadow;

/** Figma effect style `above` — upward drop shadow (tab bar, buttons, footer overlays). */
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
