import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type LayoutRectangle,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, {
  scrollTo,
  useAnimatedReaction,
  useAnimatedRef,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  applyHistoryExerciseFilter,
  applyHistoryMuscleFilter,
  FILTERABLE_MUSCLE_GROUPS,
  getActiveHistoryMuscle,
  getDirectExerciseIdsForMuscle,
  historyRangesEqual,
  type FilterableMuscleGroup,
  type HistoryDimension,
  type HistoryFilter,
  type HistoryPeriodOption,
  type HistoryRange,
} from '../domain/history-filter';
import { getExerciseLabel } from '../domain/catalogue';
import { interactiveContentColor } from '../theme/interactiveContentColor';
import { autoScrollTiming } from '../theme/motion';
import { colors, spacing } from '../theme/tokens';
import { textCase } from '../theme/textCase';
import { typography } from '../theme/typography';
import { AnchoredMenu } from './AnchoredMenu';
import {
  getAnchorAfterScroll,
  getFilterScrollOffset,
  isTriggerClipped,
  type FilterScrollEdge,
} from './historyFilterScroll';
import {
  BathManIcon,
  CalendarDaysIcon,
  ChevronBottomIcon,
  ChevronTopIcon,
  HorizontalAlignmentCenterIcon,
  type AppIconProps,
} from './icons';
import { ScaledPressable } from './ScaledPressable';

type OpenFilter = 'period' | 'muscle' | 'exercise' | null;
type FilterKey = Exclude<OpenFilter, null>;

/**
 * Shared width for all three menus (Figma sizes the unit, container adds s-4 padding).
 * Smallest token that fits the longest label — `dumbbell leaning step up` — unwrapped.
 */
const MENU_ITEM_WIDTH = spacing['s-16'];

interface HistoryFilterBarProps {
  filter: HistoryFilter;
  periodOptions: HistoryPeriodOption[];
  exerciseIds: readonly string[];
  onChange: (next: HistoryFilter) => void;
  onInteraction: () => void;
}

interface MenuOption {
  key: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
}

function periodAppliedLabel(
  range: HistoryRange,
  periodOptions: HistoryPeriodOption[],
): string | null {
  if (range.kind === 'all') {
    return null;
  }
  const match = periodOptions.find((option) =>
    historyRangesEqual(option.range, range),
  );
  return match?.appliedLabel ?? null;
}

function muscleAppliedLabel(dimension: HistoryDimension): string | null {
  return getActiveHistoryMuscle(dimension)?.toLowerCase() ?? null;
}

function exerciseAppliedLabel(dimension: HistoryDimension): string | null {
  return dimension.kind === 'exercise'
    ? getExerciseLabel(dimension.exerciseId)
    : null;
}

/**
 * Figma `filter-dropdown` row, adapted to duration / muscle group /
 * subordinate exercise. Shared across History list + chart.
 */
export function HistoryFilterBar({
  filter,
  periodOptions,
  exerciseIds,
  onChange,
  onInteraction,
}: HistoryFilterBarProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [open, setOpen] = useState<OpenFilter>(null);
  const [menuAnchor, setMenuAnchor] = useState<LayoutRectangle | null>(null);
  const reduceMotion = useReducedMotion();
  const barRef = useAnimatedRef<Animated.ScrollView>();
  const barOffset = useSharedValue(0);
  const liveOffsetRef = useRef(0);
  const manualScrollRef = useRef(false);
  const contentWidthRef = useRef(0);
  const pendingEdgeRef = useRef<FilterScrollEdge | null>(null);

  const close = useCallback(() => {
    setOpen(null);
  }, []);

  const openMenu = useCallback((key: FilterKey, anchor: LayoutRectangle) => {
    setOpen(key);
    setMenuAnchor(anchor);
  }, []);

  // Driving the offset from the UI thread keeps the 90ms park off the JS queue.
  useAnimatedReaction(
    () => barOffset.value,
    (offset) => {
      scrollTo(barRef, offset, 0, false);
    },
  );

  const periodLabel = periodAppliedLabel(filter.range, periodOptions);
  const muscleLabel = muscleAppliedLabel(filter.dimension);
  const exerciseLabel = exerciseAppliedLabel(filter.dimension);
  const activeMuscle = getActiveHistoryMuscle(filter.dimension);
  /** Only the three-filter row overflows, so only it may scroll at all. */
  const canScroll = activeMuscle != null;
  const directExerciseIds = useMemo(
    () =>
      activeMuscle == null
        ? []
        : getDirectExerciseIdsForMuscle(exerciseIds, activeMuscle),
    [activeMuscle, exerciseIds],
  );

  const scrollBarTo = useCallback(
    (offset: number) => {
      if (manualScrollRef.current) {
        // A drag moves the row without going through the driver, so resync
        // first — otherwise the park starts from a stale position, or is
        // skipped entirely when the stale value already equals the target.
        manualScrollRef.current = false;
        barOffset.value = liveOffsetRef.current;
      }
      barOffset.value =
        reduceMotion === true ? offset : withTiming(offset, autoScrollTiming);
    },
    [barOffset, reduceMotion],
  );

  /**
   * Park the row at `edge` after a filter is applied. Applying changes a
   * trigger's label width — and choosing a muscle group adds the exercise
   * trigger outright — so the final width is only known at the next content
   * measure: move now with what we have, then re-park once it settles.
   */
  const parkBarAt = useCallback(
    (edge: FilterScrollEdge) => {
      pendingEdgeRef.current = edge;
      if (canScroll) {
        scrollBarTo(
          getFilterScrollOffset(edge, contentWidthRef.current, windowWidth),
        );
      }
    },
    [canScroll, scrollBarTo, windowWidth],
  );

  const handleBarScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      liveOffsetRef.current = event.nativeEvent.contentOffset.x;
    },
    [],
  );

  const handleBarDragStart = useCallback(() => {
    manualScrollRef.current = true;
  }, []);

  const handleBarContentSizeChange = useCallback(
    (contentWidth: number) => {
      contentWidthRef.current = contentWidth;
      const edge = pendingEdgeRef.current;
      if (edge == null) {
        return;
      }
      pendingEdgeRef.current = null;
      scrollBarTo(getFilterScrollOffset(edge, contentWidth, windowWidth));
    },
    [scrollBarTo, windowWidth],
  );

  useEffect(() => {
    if (canScroll) {
      return;
    }
    // Back to two filters: the row is inert, so it has to sit at the start
    // rather than keep an offset the user can no longer undo by hand.
    pendingEdgeRef.current = null;
    manualScrollRef.current = false;
    liveOffsetRef.current = 0;
    barOffset.value = 0;
  }, [barOffset, canScroll]);

  /**
   * Tapping a trigger that either edge cuts off pulls the row to that trigger's
   * side, since the user aimed at it deliberately. The menu opens against the
   * post-scroll position so panel and trigger stay together.
   */
  const handleTriggerPress = useCallback(
    (key: FilterKey, anchor: LayoutRectangle) => {
      onInteraction();
      if (open === key) {
        close();
        return;
      }

      const edge: FilterScrollEdge = key === 'period' ? 'start' : 'end';
      const target = getFilterScrollOffset(
        edge,
        contentWidthRef.current,
        windowWidth,
      );
      const from = liveOffsetRef.current;

      if (
        !canScroll ||
        target === from ||
        !isTriggerClipped(anchor, windowWidth)
      ) {
        openMenu(key, anchor);
        return;
      }

      scrollBarTo(target);
      openMenu(key, getAnchorAfterScroll(anchor, from, target));
    },
    [
      canScroll,
      close,
      onInteraction,
      open,
      openMenu,
      scrollBarTo,
      windowWidth,
    ],
  );

  const menuOptions: MenuOption[] = useMemo(() => {
    switch (open) {
      case 'period':
        return periodOptions.map((option) => ({
          key:
            option.range.kind === 'all'
              ? 'all'
              : option.range.kind === 'year'
                ? `year-${option.range.year}`
                : `month-${option.range.year}-${option.range.month}`,
          label: option.label,
          selected: historyRangesEqual(option.range, filter.range),
          onSelect: () => {
            onChange({ ...filter, range: option.range });
            parkBarAt('start');
            close();
          },
        }));
      case 'muscle':
        return [
          {
            key: 'all',
            label: 'all',
            selected: activeMuscle == null,
            onSelect: () => {
              onChange(applyHistoryMuscleFilter(filter, null));
              close();
            },
          },
          ...FILTERABLE_MUSCLE_GROUPS.map((muscle: FilterableMuscleGroup) => ({
            key: muscle,
            label: muscle.toLowerCase(),
            selected: activeMuscle === muscle,
            onSelect: () => {
              onChange(applyHistoryMuscleFilter(filter, muscle));
              parkBarAt('end');
              close();
            },
          })),
        ];
      case 'exercise':
        return [
          {
            key: 'all',
            label: 'all',
            selected: filter.dimension.kind === 'muscle',
            onSelect: () => {
              onChange(applyHistoryExerciseFilter(filter, null));
              parkBarAt('end');
              close();
            },
          },
          ...directExerciseIds.map((exerciseId) => ({
            key: exerciseId,
            label: getExerciseLabel(exerciseId),
            selected:
              filter.dimension.kind === 'exercise' &&
              filter.dimension.exerciseId === exerciseId,
            onSelect: () => {
              onChange(applyHistoryExerciseFilter(filter, exerciseId));
              parkBarAt('end');
              close();
            },
          })),
        ];
      case null:
        return [];
      default: {
        const _exhaustive: never = open;
        return _exhaustive;
      }
    }
  }, [
    activeMuscle,
    close,
    directExerciseIds,
    filter,
    onChange,
    open,
    parkBarAt,
    periodOptions,
  ]);
  const menuWidth = Math.min(
    MENU_ITEM_WIDTH + spacing['s-4'] * 2,
    windowWidth - spacing['s-8'] * 2,
  );
  const menuTop =
    (menuAnchor?.y ?? 0) +
    (menuAnchor?.height ?? 0) +
    spacing['s-5'];
  const maxMenuViewportHeight = Math.max(
    0,
    Math.min(spacing['s-20'], windowHeight - menuTop - spacing['s-8']) -
      spacing['s-4'] * 2,
  );

  return (
    <>
      <Animated.ScrollView
        contentContainerStyle={styles.barContent}
        horizontal
        onContentSizeChange={handleBarContentSizeChange}
        onScroll={handleBarScroll}
        onScrollBeginDrag={handleBarDragStart}
        ref={barRef}
        scrollEnabled={canScroll}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        style={styles.bar}
      >
        <FilterTrigger
          Icon={CalendarDaysIcon}
          applied={periodLabel != null}
          label={periodLabel ?? 'duration'}
          open={open === 'period'}
          onPress={(anchor) => {
            handleTriggerPress('period', anchor);
          }}
        />
        <FilterTrigger
          Icon={BathManIcon}
          applied={muscleLabel != null}
          label={muscleLabel ?? 'muscle group'}
          open={open === 'muscle'}
          onPress={(anchor) => {
            handleTriggerPress('muscle', anchor);
          }}
        />
        {canScroll ? (
          <FilterTrigger
            Icon={HorizontalAlignmentCenterIcon}
            applied={exerciseLabel != null}
            label={exerciseLabel ?? 'exercise'}
            open={open === 'exercise'}
            onPress={(anchor) => {
              handleTriggerPress('exercise', anchor);
            }}
          />
        ) : null}
      </Animated.ScrollView>
      <AnchoredMenu
        align="anchor-left"
        anchorLayout={menuAnchor}
        closeLabel="close filter"
        items={menuOptions}
        maxViewportHeight={maxMenuViewportHeight}
        onClose={close}
        visible={open != null && menuAnchor != null}
        width={menuWidth}
      />
    </>
  );
}

function FilterTrigger({
  Icon,
  label,
  applied,
  open,
  onPress,
}: {
  Icon: FC<AppIconProps>;
  label: string;
  applied: boolean;
  open: boolean;
  onPress: (anchor: LayoutRectangle) => void;
}) {
  const triggerRef = useRef<View>(null);
  const active = open || applied;
  const Chevron = open ? ChevronTopIcon : ChevronBottomIcon;

  return (
    <ScaledPressable
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      onPress={() => {
        triggerRef.current?.measureInWindow((x, y, width, height) => {
          onPress({ x, y, width, height });
        });
      }}
      style={styles.trigger}
    >
      {({ pressed }) => {
        const color = active
          ? interactiveContentColor(pressed, 'dim')
          : interactiveContentColor(pressed, 'brighten');
        return (
          <View ref={triggerRef} style={styles.triggerInner}>
            <Icon color={color} />
            <Text
              numberOfLines={1}
              style={[styles.triggerLabel, { color }]}
            >
              {label}
            </Text>
            <Chevron color={color} />
          </View>
        );
      }}
    </ScaledPressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexGrow: 0,
  },
  /** Figma row overflows the frame (396 in 342) — scroll it, keep the s-8 page inset. */
  barContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['s-8'],
    paddingHorizontal: spacing['s-8'],
  },
  trigger: {
    height: spacing['s-12'],
    justifyContent: 'center',
  },
  triggerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['s-4'],
  },
  triggerLabel: {
    ...typography.para1,
    ...textCase.lower,
  },
});
