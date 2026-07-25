import {
  moveItemInList,
  dragTranslationToIndexDelta,
  clampDragToIndex,
  siblingDragOffset,
} from '../../src/domain/reorder';

describe('moveItemInList', () => {
  it('moves an item forward and backward', () => {
    expect(moveItemInList(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
    expect(moveItemInList(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
  });

  it('returns a copy when indices are equal or out of range', () => {
    const items = ['a', 'b'];
    expect(moveItemInList(items, 1, 1)).toEqual(['a', 'b']);
    expect(moveItemInList(items, -1, 0)).toEqual(['a', 'b']);
    expect(moveItemInList(items, 0, 9)).toEqual(['a', 'b']);
  });
});

describe('dragTranslationToIndexDelta', () => {
  it('snaps translation to whole row steps', () => {
    expect(dragTranslationToIndexDelta(0, 72)).toBe(0);
    expect(dragTranslationToIndexDelta(40, 72)).toBe(1);
    expect(dragTranslationToIndexDelta(-40, 72)).toBe(-1);
    expect(dragTranslationToIndexDelta(100, 72)).toBe(1);
    expect(dragTranslationToIndexDelta(110, 72)).toBe(2);
  });

  it('returns 0 when stride is invalid', () => {
    expect(dragTranslationToIndexDelta(40, 0)).toBe(0);
  });
});

describe('clampDragToIndex', () => {
  it('clamps the hover index inside the list', () => {
    expect(clampDragToIndex(2, -80, 72, 4)).toBe(1);
    expect(clampDragToIndex(0, -80, 72, 4)).toBe(0);
    expect(clampDragToIndex(3, 200, 72, 4)).toBe(3);
  });
});

describe('siblingDragOffset', () => {
  it('shifts crossed siblings down when dragging up', () => {
    // from 2 → 1: index 1 moves down one stride
    expect(siblingDragOffset(1, 2, 1, 72)).toBe(72);
    expect(siblingDragOffset(0, 2, 1, 72)).toBe(0);
    expect(siblingDragOffset(2, 2, 1, 72)).toBe(0);
  });

  it('shifts crossed siblings up when dragging down', () => {
    // from 0 → 2: indices 1 and 2 move up one stride
    expect(siblingDragOffset(1, 0, 2, 72)).toBe(-72);
    expect(siblingDragOffset(2, 0, 2, 72)).toBe(-72);
    expect(siblingDragOffset(0, 0, 2, 72)).toBe(0);
  });

  it('returns 0 when indices match or drag is inactive', () => {
    expect(siblingDragOffset(1, 1, 1, 72)).toBe(0);
    expect(siblingDragOffset(1, -1, 2, 72)).toBe(0);
  });
});
