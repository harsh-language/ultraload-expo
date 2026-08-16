import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type LayoutRectangle,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, {
  runOnJS,
  scrollTo,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedStyle,
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
  type FilterableMuscleGroup,
  type HistoryDimension,
  type HistoryFilter,
  type HistoryPeriodOption,
  type HistoryRange,
} from '../domain/history-filter';
import { getExerciseLabel } from '../domain/catalogue';
import { animateWithMotionPreference } from '../theme/animateWithMotionPreference';
import { interactiveContentColor } from '../theme/interactiveContentColor';
import {
  autoScrollTiming,
  INTERACTIVE_SCALE,
  menuSpringConfig,
} from '../theme/motion';
import { shadowAbove } from '../theme/shadow';
import { colors, radii, spacing } from '../theme/tokens';
import { textCase } from '../theme/textCase';
import { typography } from '../theme/typography';
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

function rangesEqual(a: HistoryRange, b: HistoryRange): boolean {
  switch (a.kind) {
    case 'all':
      return b.kind === 'all';
    case 'year':
      return b.kind === 'year' && b.year === a.year;
    case 'month':
      return (
        b.kind === 'month' && b.year === a.year && b.month === a.month
      );
    default: {
      const _exhaustive: never = a;
      return _exhaustive;
    }
  }
}

function periodAppliedLabel(
  range: HistoryRange,
  periodOptions: HistoryPeriodOption[],
): string | null {
  if (range.kind === 'all') {
    return null;
  }
  const match = periodOptions.find((option) =>
    rangesEqual(option.range, range),
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
    setMenuAnchor(null);
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
          selected: rangesEqual(option.range, filter.range),
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
      <FilterMenu
        options={menuOptions}
        visible={open != null && menuAnchor != null}
        anchor={menuAnchor}
        windowHeight={windowHeight}
        windowWidth={windowWidth}
        onClose={close}
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

function FilterMenu({
  visible,
  anchor,
  options,
  windowWidth,
  windowHeight,
  onClose,
}: {
  visible: boolean;
  anchor: LayoutRectangle | null;
  options: MenuOption[];
  windowWidth: number;
  windowHeight: number;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const wasVisibleRef = useRef(false);
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(INTERACTIVE_SCALE);

  useEffect(() => {
    const wasVisible = wasVisibleRef.current;
    const shouldShow = visible && anchor != null;
    wasVisibleRef.current = shouldShow;
    const reduced = reduceMotion === true;

    if (shouldShow && !wasVisible) {
      setMounted(true);
      opacity.value = 0;
      scale.value = reduced ? 1 : INTERACTIVE_SCALE;
      opacity.value = animateWithMotionPreference(
        1,
        reduced,
        menuSpringConfig,
      );
      if (!reduced) {
        scale.value = animateWithMotionPreference(1, false, menuSpringConfig);
      }
      return;
    }

    if (!shouldShow && wasVisible) {
      opacity.value = animateWithMotionPreference(
        0,
        reduced,
        menuSpringConfig,
        (finished) => {
          'worklet';
          if (finished) {
            runOnJS(setMounted)(false);
          }
        },
      );
      if (!reduced) {
        scale.value = animateWithMotionPreference(
          INTERACTIVE_SCALE,
          false,
          menuSpringConfig,
        );
      }
    }
  }, [anchor, opacity, reduceMotion, scale, visible]);

  const menuStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!mounted || anchor == null) {
    return null;
  }

  const menuWidth = Math.min(
    MENU_ITEM_WIDTH + spacing['s-4'] * 2,
    windowWidth - spacing['s-8'] * 2,
  );
  // Figma: menu left-aligned under trigger with slight inset (-6).
  const menuLeft = Math.min(
    Math.max(spacing['s-8'], anchor.x - spacing['s-4']),
    windowWidth - menuWidth - spacing['s-8'],
  );
  const menuTop = anchor.y + anchor.height + spacing['s-5'];
  const maxHeight = Math.min(spacing['s-20'], windowHeight - menuTop - spacing['s-8']);

  return (
    <Modal
      animationType="none"
      onRequestClose={onClose}
      transparent
      visible={mounted}
    >
      <View
        pointerEvents="box-none"
        style={[styles.overlay, { width: windowWidth, height: windowHeight }]}
      >
        <Pressable
          accessibilityLabel="close filter"
          onPress={onClose}
          style={styles.backdrop}
        />
        <Animated.View
          style={[
            styles.menu,
            menuStyle,
            {
              top: menuTop,
              left: menuLeft,
              width: menuWidth,
              maxHeight,
            },
          ]}
        >
          <ScrollView
            bounces={options.length > 6}
            showsVerticalScrollIndicator={false}
          >
            {options.map((option) => (
              <ScaledPressable
                key={option.key}
                accessibilityRole="button"
                accessibilityState={{ selected: option.selected }}
                onPress={option.onSelect}
                style={({ pressed }) => [
                  styles.menuItem,
                  (option.selected || pressed) && styles.menuItemActive,
                ]}
              >
                {({ pressed }) => {
                  const color =
                    option.selected || pressed
                      ? colors['content-1']
                      : colors['content-2'];
                  return (
                    <Text style={[styles.menuItemLabel, { color }]} numberOfLines={1}>
                      {option.label}
                    </Text>
                  );
                }}
              </ScaledPressable>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 30,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  menu: {
    position: 'absolute',
    backgroundColor: colors['bg-2'],
    borderWidth: spacing['s-1'],
    borderColor: colors['border-2'],
    borderRadius: radii['r-h-60'],
    padding: spacing['s-4'],
    gap: spacing['s-4'],
    transformOrigin: 'top left',
    overflow: 'hidden',
    ...shadowAbove,
  },
  /** Figma `dropdown-unit` size M — 48 tall so `r-pill` (24) nests inside the container's 30. */
  menuItem: {
    height: spacing['s-11'],
    justifyContent: 'center',
    paddingHorizontal: spacing['s-7'],
    borderRadius: radii['r-pill'],
    backgroundColor: colors['bg-2'],
  },
  menuItemActive: {
    backgroundColor: colors['bg-trans-1'],
  },
  menuItemLabel: {
    ...typography.para2,
    ...textCase.lower,
  },
});
