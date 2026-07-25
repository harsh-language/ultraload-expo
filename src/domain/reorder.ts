/**
 * Move one item in a list by index. No-ops when indices are equal or out of range.
 */
export function moveItemInList<T>(
  items: readonly T[],
  fromIndex: number,
  toIndex: number,
): T[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length
  ) {
    return [...items];
  }

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

/** Vertical stride between InputTag row centers (height + gap). */
export function planExerciseRowStride(
  rowHeight: number,
  rowGap: number,
): number {
  return rowHeight + rowGap;
}

/** Index delta from a drag translation, snapped to whole rows. */
export function dragTranslationToIndexDelta(
  translationY: number,
  rowStride: number,
): number {
  'worklet';
  if (rowStride <= 0) {
    return 0;
  }
  return Math.round(translationY / rowStride);
}

/** Target index while dragging, clamped to the list. */
export function clampDragToIndex(
  fromIndex: number,
  translationY: number,
  rowStride: number,
  count: number,
): number {
  'worklet';
  if (count <= 0) {
    return 0;
  }
  const delta = dragTranslationToIndexDelta(translationY, rowStride);
  const max = count - 1;
  return Math.min(max, Math.max(0, fromIndex + delta));
}

/**
 * Vertical offset for a non-dragged row while another row is mid-drag.
 * Opens a gap under the finger by shifting crossed siblings one stride.
 */
export function siblingDragOffset(
  index: number,
  fromIndex: number,
  toIndex: number,
  rowStride: number,
): number {
  'worklet';
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex === toIndex ||
    index === fromIndex ||
    rowStride <= 0
  ) {
    return 0;
  }

  if (fromIndex < toIndex) {
    if (index > fromIndex && index <= toIndex) {
      return -rowStride;
    }
    return 0;
  }

  if (index >= toIndex && index < fromIndex) {
    return rowStride;
  }
  return 0;
}
