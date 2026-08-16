import type { LayoutRectangle } from 'react-native';

/** Which end of a horizontal filter row a scroll should park at. */
export type FilterScrollEdge = 'start' | 'end';

/** Furthest offset the row can reach; 0 while the content fits the viewport. */
export function getMaxFilterScrollOffset(
  contentWidth: number,
  viewportWidth: number,
): number {
  return Math.max(0, contentWidth - viewportWidth);
}

/** Offset that parks the row at `edge`. */
export function getFilterScrollOffset(
  edge: FilterScrollEdge,
  contentWidth: number,
  viewportWidth: number,
): number {
  switch (edge) {
    case 'start':
      return 0;
    case 'end':
      return getMaxFilterScrollOffset(contentWidth, viewportWidth);
    default: {
      const _exhaustive: never = edge;
      return _exhaustive;
    }
  }
}

/** True when either viewport edge cuts off the measured trigger. */
export function isTriggerClipped(
  anchor: LayoutRectangle,
  viewportWidth: number,
): boolean {
  return anchor.x < 0 || anchor.x + anchor.width > viewportWidth;
}

/**
 * Where the trigger lands once a requested scroll completes. A menu opened in
 * the same press measures the trigger before the row moves, so its anchor has
 * to travel with the row or the panel hangs off the old position.
 */
export function getAnchorAfterScroll(
  anchor: LayoutRectangle,
  fromOffset: number,
  toOffset: number,
): LayoutRectangle {
  return { ...anchor, x: anchor.x - (toOffset - fromOffset) };
}
