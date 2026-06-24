import { colors, spacing } from './tokens';

export const SCROLL_FADE_HEIGHT = spacing['s-16'];

export const scrollFadeGradients = {
  top: [colors['bg-1'], colors['content-trans-dark']],
  bottom: [colors['content-trans-dark'], colors['bg-1']],
} as const;

export interface ScrollFadeMetrics {
  scrollY: number;
  viewportHeight: number;
  contentHeight: number;
  threshold?: number;
}

export function getScrollFadeVisibility({
  scrollY,
  viewportHeight,
  contentHeight,
  threshold = 1,
}: ScrollFadeMetrics): { showTop: boolean; showBottom: boolean } {
  const hasOverflow = contentHeight > viewportHeight + threshold;
  if (!hasOverflow) {
    return { showTop: false, showBottom: false };
  }

  const atTop = scrollY <= threshold;
  const atBottom = scrollY + viewportHeight >= contentHeight - threshold;

  if (atTop) {
    return { showTop: false, showBottom: true };
  }
  if (atBottom) {
    return { showTop: true, showBottom: false };
  }
  return { showTop: true, showBottom: true };
}
