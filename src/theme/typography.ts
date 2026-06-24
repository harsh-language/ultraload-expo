import { TextStyle } from 'react-native';
import { tokens } from './tokens';

/** Static Geist cuts — one file per weight (RN ignores fontWeight on custom fonts). */
export const fontFamilies = {
  medium: 'Geist-Medium',
  semiBold: 'Geist-SemiBold',
  /** Static Geist-ExtraBold.ttf (wght 800) — matches Figma Brand-1 */
  extraBold: 'Geist-ExtraBold',
} as const;

const content1 = tokens.color.tokens['content-1'];
const content2 = tokens.color.tokens['content-2'];

/**
 * Figma text styles (v1-components) — font metrics only.
 * Case is applied per component via `textCase` from `src/theme/textCase.ts`.
 * Author UI copy in lowercase; components enforce upper/lower/none at render time.
 */
export const typography = {
  /** Brand-1 — 36px ExtraBold */
  brand1: {
    fontFamily: fontFamilies.extraBold,
    fontSize: tokens.font.size.XL,
    lineHeight: tokens.font.height['XL-H'],
    letterSpacing: tokens.font.props.std,
    color: content1,
  } satisfies TextStyle,

  /** Brand-2 — 36px Medium */
  brand2: {
    fontFamily: fontFamilies.medium,
    fontSize: tokens.font.size.XL,
    lineHeight: tokens.font.height['XL-H'],
    letterSpacing: tokens.font.props.std,
    color: content1,
  } satisfies TextStyle,

  /** Brand-3 — 24px SemiBold, modal / section titles */
  brand3: {
    fontFamily: fontFamilies.semiBold,
    fontSize: tokens.font.size.L,
    lineHeight: tokens.font.height['L-H'],
    letterSpacing: tokens.font.props.std,
    color: content1,
  } satisfies TextStyle,

  /** Para-1 — 18px SemiBold, button labels & emphasis */
  para1: {
    fontFamily: fontFamilies.semiBold,
    fontSize: tokens.font.size.M,
    lineHeight: tokens.font.height['M-H'],
    letterSpacing: tokens.font.props.std,
    color: content1,
  } satisfies TextStyle,

  /** Para-2 — 18px Medium, body */
  para2: {
    fontFamily: fontFamilies.medium,
    fontSize: tokens.font.size.M,
    lineHeight: tokens.font.height['M-P'],
    letterSpacing: tokens.font.props.std,
    color: content1,
  } satisfies TextStyle,

  /** Para-3 — 15px Medium, tab labels */
  para3: {
    fontFamily: fontFamilies.medium,
    fontSize: tokens.font.size.S,
    lineHeight: tokens.font.height['S-H'],
    letterSpacing: tokens.font.props.std,
    color: content1,
  } satisfies TextStyle,

  /** Para-4 — 15px Medium, secondary body */
  para4: {
    fontFamily: fontFamilies.medium,
    fontSize: tokens.font.size.S,
    lineHeight: tokens.font.height['S-P'],
    letterSpacing: tokens.font.props.std,
    color: content2,
  } satisfies TextStyle,

  /** Label — 12px SemiBold, +3 letter-spacing */
  label: {
    fontFamily: fontFamilies.semiBold,
    fontSize: tokens.font.size.XS,
    lineHeight: tokens.font.height['XS-H'],
    letterSpacing: tokens.font.props.extra,
    color: content1,
  } satisfies TextStyle,
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
