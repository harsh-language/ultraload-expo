import { colors, spacing } from '../../src/theme/tokens';
import {
  getScrollFadeVisibility,
  SCROLL_FADE_HEIGHT,
  scrollFadeGradients,
} from '../../src/theme/scrollFade';

describe('scrollFade', () => {
  const viewportHeight = 400;
  const contentHeight = 1000;

  it('uses s-16 as the default fade height', () => {
    expect(SCROLL_FADE_HEIGHT).toBe(spacing['s-16']);
  });

  it('maps Figma top-scroll and bottom-scroll gradients to tokens', () => {
    expect(scrollFadeGradients.top).toEqual([
      colors['bg-1'],
      colors['content-trans-dark'],
    ]);
    expect(scrollFadeGradients.bottom).toEqual([
      colors['content-trans-dark'],
      colors['bg-1'],
    ]);
  });

  it('hides both fades when content does not overflow', () => {
    expect(
      getScrollFadeVisibility({
        scrollY: 0,
        viewportHeight: 400,
        contentHeight: 400,
      }),
    ).toEqual({ showTop: false, showBottom: false });
  });

  it('shows only the bottom fade at scroll top', () => {
    expect(
      getScrollFadeVisibility({
        scrollY: 0,
        viewportHeight,
        contentHeight,
      }),
    ).toEqual({ showTop: false, showBottom: true });
  });

  it('shows both fades in the middle of the list', () => {
    expect(
      getScrollFadeVisibility({
        scrollY: 300,
        viewportHeight,
        contentHeight,
      }),
    ).toEqual({ showTop: true, showBottom: true });
  });

  it('shows only the top fade at scroll bottom', () => {
    expect(
      getScrollFadeVisibility({
        scrollY: contentHeight - viewportHeight,
        viewportHeight,
        contentHeight,
      }),
    ).toEqual({ showTop: true, showBottom: false });
  });
});
