import { TextStyle } from 'react-native';
import { tokens } from './tokens';

export const fontFamilies = {
  medium: 'Geist-Medium',
  semiBold: 'Geist-SemiBold',
  extraBold: 'Geist-ExtraBold',
} as const;

type TypographyVariant =
  | 'brandXL'
  | 'titleL'
  | 'bodyM'
  | 'bodyS'
  | 'labelS'
  | 'captionXS';

export const typography: Record<TypographyVariant, TextStyle> = {
  brandXL: {
    fontFamily: fontFamilies.extraBold,
    fontSize: tokens.font.size.XL,
    lineHeight: tokens.font.height['XL-H'],
    letterSpacing: tokens.font.props.extra,
    color: tokens.color.tokens['content-1'],
  },
  titleL: {
    fontFamily: fontFamilies.semiBold,
    fontSize: tokens.font.size.L,
    lineHeight: tokens.font.height['L-H'],
    letterSpacing: tokens.font.props.std,
    color: tokens.color.tokens['content-1'],
  },
  bodyM: {
    fontFamily: fontFamilies.medium,
    fontSize: tokens.font.size.M,
    lineHeight: tokens.font.height['M-P'],
    letterSpacing: tokens.font.props.std,
    color: tokens.color.tokens['content-1'],
  },
  bodyS: {
    fontFamily: fontFamilies.medium,
    fontSize: tokens.font.size.S,
    lineHeight: tokens.font.height['S-P'],
    letterSpacing: tokens.font.props.std,
    color: tokens.color.tokens['content-2'],
  },
  labelS: {
    fontFamily: fontFamilies.semiBold,
    fontSize: tokens.font.size.S,
    lineHeight: tokens.font.height['S-H'],
    letterSpacing: tokens.font.props.std,
    color: tokens.color.tokens['content-1'],
  },
  captionXS: {
    fontFamily: fontFamilies.medium,
    fontSize: tokens.font.size.XS,
    lineHeight: tokens.font.height['XS-P'],
    letterSpacing: tokens.font.props.std,
    color: tokens.color.tokens['content-3'],
  },
};
