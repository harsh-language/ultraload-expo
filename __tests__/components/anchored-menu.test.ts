import { getAnchoredMenuLeft } from '../../src/components/anchoredMenuLayout';
import { spacing } from '../../src/theme/tokens';

const GUTTER = spacing['s-8'];
const INSET = spacing['s-4'];
const WINDOW = 390;
const MENU = spacing['s-18'] + INSET * 2;

describe('getAnchoredMenuLeft', () => {
  it('insets the menu slightly left of its trigger', () => {
    expect(getAnchoredMenuLeft(200, spacing['s-14'], WINDOW)).toBe(200 - INSET);
  });

  it('never crosses the leading page gutter', () => {
    expect(getAnchoredMenuLeft(GUTTER, spacing['s-14'], WINDOW)).toBe(GUTTER);
    expect(getAnchoredMenuLeft(0, spacing['s-14'], WINDOW)).toBe(GUTTER);
  });

  it('never crosses the trailing page gutter', () => {
    expect(getAnchoredMenuLeft(360, MENU, WINDOW)).toBe(
      WINDOW - MENU - GUTTER,
    );
  });

  it('falls back to the leading gutter when the menu cannot fit', () => {
    expect(getAnchoredMenuLeft(200, WINDOW, WINDOW)).toBe(GUTTER);
  });
});
