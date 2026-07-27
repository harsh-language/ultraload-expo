import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  clampDragToIndex,
  planExerciseRowStride,
  siblingDragOffset,
} from '../domain/reorder';
import { animateWithMotionPreference } from '../theme/animateWithMotionPreference';
import {
  ENTER_STAGGER_MS,
  panelSpringConfig,
  projectMomentum,
  REDUCED_MOTION_FADE_MS,
} from '../theme/motion';
import { spacing } from '../theme/tokens';
import { commitHaptic } from './commitHaptic';
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
  /** First-paint stagger delay (ms). 0 skips stagger. */
  enterDelayMs?: number;
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
  enterDelayMs = 0,
  onDragStart,
  onDragMove,
  onDragEnd,
  style,
}: PlanExerciseTagRowProps) {
  const translateY = useSharedValue(0);
  const zIndex = useSharedValue(0);
  const enterOpacity = useSharedValue(enterDelayMs > 0 ? 0 : 1);
  const indexSV = useSharedValue(index);
  const countSV = useSharedValue(count);
  const hoverIndexSV = useSharedValue(index);
  const reduceMotion = useReducedMotion();
  const reduceMotionSV = useSharedValue(reduceMotion === true);
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

  useEffect(() => {
    reduceMotionSV.value = reduceMotion === true;
  }, [reduceMotion, reduceMotionSV]);

  useEffect(() => {
    if (enterDelayMs <= 0) {
      enterOpacity.value = 1;
      return;
    }
    if (reduceMotion === true) {
      enterOpacity.value = withDelay(
        enterDelayMs,
        withTiming(1, { duration: REDUCED_MOTION_FADE_MS }),
      );
      return;
    }
    enterOpacity.value = withDelay(
      enterDelayMs,
      withSpring(1, panelSpringConfig),
    );
  }, [enterDelayMs, enterOpacity, reduceMotion]);

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
      translateY.value = 0;
      zIndex.value = 0;
      return;
    }
    if (translateY.value === siblingOffset) {
      return;
    }
    translateY.value = animateWithMotionPreference(
      siblingOffset,
      reduceMotion === true,
    );
  }, [
    dragFromIndex,
    isDragSource,
    reduceMotion,
    siblingOffset,
    translateY,
    zIndex,
  ]);

  const handleDragStart = (fromIndex: number) => {
    onDragStartRef.current(fromIndex);
  };

  const handleDragMove = (fromIndex: number, toIndex: number) => {
    onDragMoveRef.current(fromIndex, toIndex);
  };

  const finishDrag = (fromIndex: number, toIndex: number) => {
    commitHaptic();
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
          const projectedTranslation =
            event.translationY + projectMomentum(event.velocityY);
          const toIndex = clampDragToIndex(
            indexSV.value,
            projectedTranslation,
            ROW_STRIDE,
            countSV.value,
          );
          const targetY = (toIndex - indexSV.value) * ROW_STRIDE;
          const fromIndex = indexSV.value;

          if (reduceMotionSV.value) {
            translateY.value = 0;
            zIndex.value = 0;
            runOnJS(finishDrag)(fromIndex, toIndex);
            return;
          }

          translateY.value = withSpring(
            targetY,
            { ...panelSpringConfig, velocity: event.velocityY },
            (finished) => {
              'worklet';
              if (!finished) {
                return;
              }
              translateY.value = 0;
              zIndex.value = 0;
              runOnJS(finishDrag)(fromIndex, toIndex);
            },
          );
        }),
    [
      countSV,
      hoverIndexSV,
      indexSV,
      reduceMotionSV,
      translateY,
      zIndex,
    ],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: enterOpacity.value,
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
