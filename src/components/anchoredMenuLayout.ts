import { spacing } from '../theme/tokens';

/**
 * Left edge for an anchor-aligned dropdown, kept inside the page gutters.
 * Figma places the panel just left of its trigger; clamping wins over the
 * inset when the menu would otherwise overhang either edge.
 */
export function getAnchoredMenuLeft(
  anchorX: number,
  menuWidth: number,
  windowWidth: number,
): number {
  const gutter = spacing['s-8'];
  const trailingLimit = Math.max(gutter, windowWidth - menuWidth - gutter);

  return Math.min(Math.max(gutter, anchorX - spacing['s-4']), trailingLimit);
}
