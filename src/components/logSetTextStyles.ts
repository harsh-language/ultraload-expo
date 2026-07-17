import { Platform, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';

const textVerticalCenter = Platform.select({
  android: { includeFontPadding: false, textAlignVertical: 'center' as const },
  default: {},
});

/** Shared set-row text: prefix / weight / reps — used by LogRow and DeleteSetSheet. */
export const logSetTextStyles = StyleSheet.create({
  setPrefix: {
    ...typography.para2,
    color: colors['content-2'],
    width: spacing['s-8'],
    textAlign: 'center',
    ...textVerticalCenter,
  },
  weight: {
    ...typography.para1,
    color: colors['content-1'],
    ...textCase.none,
    ...textVerticalCenter,
  },
  reps: {
    ...typography.para2,
    color: colors['content-2'],
    ...textCase.lower,
    ...textVerticalCenter,
  },
});
