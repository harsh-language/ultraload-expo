import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  clampDragToIndex,
  planExerciseRowStride,
  siblingDragOffset,
} from '../domain/reorder';
import { PANEL_TRANSITION_MS } from '../theme/motion';
import { spacing } from '../theme/tokens';
import { InputTag } from './InputTag';

const ROW_HEIGHT = spacing['s-12'];
const ROW_GAP = spacing['s-5'];
const ROW_STRIDE = planExerciseRowStride(ROW_HEIGHT, ROW_GAP);

interface PlanExerciseTagRowProps {
  label: string;
  index: number;
  count: number;
  dragFromIndex: number | null;
  dragHoverIndex: number | null;
  onRemove: () => void;
  removeDisabled?: boolean;
  onDragStart: (index: number) => void;
  onDragMove: (fromIndex: number, toIndex: number) => void;
  onDragEnd: (fromIndex: number, toIndex: number) => void;
  style?: ViewStyle;
}

export function PlanExerciseTagRow({
  label,
  index,
  count,
  dragFromIndex,
  dragHoverIndex,
  onRemove,
  removeDisabled = false,
  onDragStart,
  onDragMove,
  onDragEnd,
  style,
}: PlanExerciseTagRowProps) {
  const translateY = useSharedValue(0);
  const zIndex = useSharedValue(0);
  const indexSV = useSharedValue(index);
  const countSV = useSharedValue(count);
  const hoverIndexSV = useSharedValue(index);
  const onDragStartRef = useRef(onDragStart);
  const onDragMoveRef = useRef(onDragMove);
  const onDragEndRef = useRef(onDragEnd);
  onDragStartRef.current = onDragStart;
  onDragMoveRef.current = onDragMove;
  onDragEndRef.current = onDragEnd;

  useEffect(() => {
    indexSV.value = index;
    countSV.value = count;
  }, [count, countSV, index, indexSV]);

  const isDragSource = dragFromIndex === index;
  const siblingOffset =
    dragFromIndex == null ||
    dragHoverIndex == null ||
    isDragSource
      ? 0
      : siblingDragOffset(index, dragFromIndex, dragHoverIndex, ROW_STRIDE);

  useLayoutEffect(() => {
    if (isDragSource) {
      return;
    }
    if (dragFromIndex == null) {
      // Instant reset on commit so layout reorder and transform clear align.
      translateY.value = 0;
      zIndex.value = 0;
      return;
    }
    translateY.value = withTiming(siblingOffset, {
      duration: PANEL_TRANSITION_MS,
    });
  }, [dragFromIndex, isDragSource, siblingOffset, translateY, zIndex]);

  const handleDragStart = (fromIndex: number) => {
    onDragStartRef.current(fromIndex);
  };

  const handleDragMove = (fromIndex: number, toIndex: number) => {
    onDragMoveRef.current(fromIndex, toIndex);
  };

  const handleDragEnd = (
    fromIndex: number,
    translationY: number,
    itemCount: number,
  ) => {
    const toIndex = clampDragToIndex(
      fromIndex,
      translationY,
      ROW_STRIDE,
      itemCount,
    );
    onDragEndRef.current(fromIndex, toIndex);
  };

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .activeOffsetY([-2, 2])
        .failOffsetX([-24, 24])
        .onBegin(() => {
          zIndex.value = 2;
          hoverIndexSV.value = indexSV.value;
          runOnJS(handleDragStart)(indexSV.value);
        })
        .onUpdate((event) => {
          translateY.value = event.translationY;
          const nextHover = clampDragToIndex(
            indexSV.value,
            event.translationY,
            ROW_STRIDE,
            countSV.value,
          );
          if (nextHover !== hoverIndexSV.value) {
            hoverIndexSV.value = nextHover;
            runOnJS(handleDragMove)(indexSV.value, nextHover);
          }
        })
        .onFinalize((event) => {
          // Clear the drag transform before React commits the reordered layout.
          translateY.value = 0;
          zIndex.value = 0;
          runOnJS(handleDragEnd)(
            indexSV.value,
            event.translationY,
            countSV.value,
          );
        }),
    [countSV, hoverIndexSV, indexSV, translateY, zIndex],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    zIndex: zIndex.value,
    elevation: zIndex.value,
  }));

  return (
    <Animated.View style={[styles.row, style, animatedStyle]}>
      <InputTag
        label={label}
        onRemove={onRemove}
        removeDisabled={removeDisabled}
        renderDragHandle={(handle) => (
          <GestureDetector gesture={pan}>
            <Animated.View collapsable={false}>{handle}</Animated.View>
          </GestureDetector>
        )}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    position: 'relative',
  },
});
