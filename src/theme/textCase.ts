import type { TextStyle } from 'react-native';

export const textCase = {
  upper: { textTransform: 'uppercase' } satisfies TextStyle,
  lower: { textTransform: 'lowercase' } satisfies TextStyle,
  none: { textTransform: 'none' } satisfies TextStyle,
} as const;
