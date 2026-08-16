import {
  getAnchorAfterScroll,
  getFilterScrollOffset,
  getMaxFilterScrollOffset,
  isTriggerClipped,
} from '../../src/components/historyFilterScroll';

const VIEWPORT = 390;
/** Three filters overflow the frame; two fit. */
const THREE_FILTERS = 446;
const TWO_FILTERS = 320;
const MAX_OFFSET = THREE_FILTERS - VIEWPORT;

function trigger(x: number, width = 100) {
  return { x, y: 0, width, height: 48 };
}

describe('history filter row scrolling', () => {
  describe('getMaxFilterScrollOffset', () => {
    it('is zero while the row fits its viewport', () => {
      expect(getMaxFilterScrollOffset(TWO_FILTERS, VIEWPORT)).toBe(0);
    });

    it('is the overflow once the row is wider than the viewport', () => {
      expect(getMaxFilterScrollOffset(THREE_FILTERS, VIEWPORT)).toBe(MAX_OFFSET);
    });
  });

  describe('getFilterScrollOffset', () => {
    it('parks duration at the start', () => {
      expect(getFilterScrollOffset('start', THREE_FILTERS, VIEWPORT)).toBe(0);
    });

    it('parks muscle group and exercise at the end', () => {
      expect(getFilterScrollOffset('end', THREE_FILTERS, VIEWPORT)).toBe(
        MAX_OFFSET,
      );
    });

    it('cannot move a row that fits', () => {
      expect(getFilterScrollOffset('end', TWO_FILTERS, VIEWPORT)).toBe(0);
    });
  });

  describe('isTriggerClipped', () => {
    it('is false for a fully visible trigger', () => {
      expect(isTriggerClipped(trigger(16), VIEWPORT)).toBe(false);
    });

    it('is false when the trigger ends exactly on the trailing edge', () => {
      expect(isTriggerClipped(trigger(290), VIEWPORT)).toBe(false);
    });

    it('is true past the trailing edge', () => {
      expect(isTriggerClipped(trigger(320), VIEWPORT)).toBe(true);
    });

    it('is true past the leading edge', () => {
      expect(isTriggerClipped(trigger(-8), VIEWPORT)).toBe(true);
    });
  });

  describe('getAnchorAfterScroll', () => {
    it('follows the trigger left when the row scrolls right', () => {
      expect(getAnchorAfterScroll(trigger(300), 0, MAX_OFFSET).x).toBe(
        300 - MAX_OFFSET,
      );
    });

    it('follows the trigger right when the row returns to the start', () => {
      expect(getAnchorAfterScroll(trigger(-10), MAX_OFFSET, 0).x).toBe(
        -10 + MAX_OFFSET,
      );
    });

    it('leaves the anchor alone when the row does not move', () => {
      expect(getAnchorAfterScroll(trigger(120), MAX_OFFSET, MAX_OFFSET)).toEqual(
        trigger(120),
      );
    });
  });
});
