import { StyleSheet } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';
import { textCase } from '../theme/textCase';

export const inputPillStyles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: spacing['s-12'],
    borderRadius: radii['r-pill'],
    borderWidth: spacing['s-1'],
    borderColor: colors['border-2'],
    backgroundColor: colors['bg-2'],
    paddingHorizontal: spacing['s-8'],
    gap: spacing['s-5'],
  },
  pillFocused: {
    borderColor: colors['border-1'],
  },
  input: {
    flex: 1,
    color: colors['content-3'],
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
    ...textCase.none,
  },
  inputFilled: {
    color: colors['content-1'],
  },
  unit: {
    color: colors['content-2'],
    ...textCase.lower,
  },
  unitFocused: {
    color: colors['content-1'],
  },
});
