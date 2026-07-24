import { StyleSheet } from 'react-native';
import { colors, radii, spacing, tokens } from '../theme/tokens';
import { textCase } from '../theme/textCase';

/**
 * One shared line box for label / value / unit.
 * Figma `input-text` pairs Para-1 (M-H 22) with Para-2 (M-P 25); that
 * mismatch lifts the filled value ~2px. Use M-P for the whole row so ink
 * centers with the labels. Explicit input height also stops iOS TextInput
 * from using a taller intrinsic box that top-aligns glyphs.
 */
const PILL_LINE_HEIGHT = tokens.font.height['M-P'];

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
  leadingLabel: {
    color: colors['content-3'],
    flexShrink: 0,
    lineHeight: PILL_LINE_HEIGHT,
    ...textCase.lower,
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: PILL_LINE_HEIGHT,
    lineHeight: PILL_LINE_HEIGHT,
    color: colors['content-3'],
    padding: 0,
    margin: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
    ...textCase.none,
  },
  inputFilled: {
    color: colors['content-1'],
  },
  unit: {
    color: colors['content-2'],
    flexShrink: 0,
    lineHeight: PILL_LINE_HEIGHT,
    ...textCase.lower,
  },
  unitFocused: {
    color: colors['content-1'],
  },
});
