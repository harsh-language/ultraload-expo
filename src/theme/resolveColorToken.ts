import { colors } from './tokens';

export type ColorToken = keyof typeof colors;

export interface ResolvedColorToken {
  token: ColorToken;
  color: string;
  opacity: number;
}

function parseHexColor(hex: string): Pick<ResolvedColorToken, 'color' | 'opacity'> {
  if (!hex.startsWith('#')) {
    throw new Error(`Expected hex color, got "${hex}"`);
  }

  if (hex.length === 9) {
    return {
      color: `#${hex.slice(1, 7)}`,
      opacity: parseInt(hex.slice(7, 9), 16) / 255,
    };
  }

  if (hex.length === 7) {
    return { color: hex, opacity: 1 };
  }

  throw new Error(`Unsupported hex format "${hex}"`);
}

/** Split a Figma color token into 6-digit RGB + opacity (for SVG stops and similar APIs). */
export function resolveColorToken(token: ColorToken): ResolvedColorToken {
  const hex = colors[token];
  const { color, opacity } = parseHexColor(hex);
  return { token, color, opacity };
}
