import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type GestureResponderEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { DisplayUnit } from '../data/exercise-catalogue';
import type { ChartPoint } from '../domain/history-filter';
import { formatHistoryDateLabel } from '../domain/history-date';
import { formatSessionTotalWeightLabel } from '../domain/session-totals';
import { ForwardIcon } from './icons';
import {
  CHART_HEIGHT,
  CHART_POINT_CORE,
  CHART_POINT_OUTER,
  CHART_TIMELINE_MARK_WIDTH,
  CHART_TOOLTIP_GAP,
  getChartInitialSpacing,
  getChartMonthMarks,
  getChartPointSpacing,
  getChartTapPointIndex,
  getChartPointY,
  getChartVisiblePoints,
  isChartPointInViewport,
} from '../theme/chartGeometry';
import { resolveColorToken } from '../theme/resolveColorToken';
import { colors, radii, spacing } from '../theme/tokens';
import { shadowBelow } from '../theme/shadow';
import { textCase } from '../theme/textCase';
import { typography } from '../theme/typography';
import { clampSafeInset } from '../theme/safeAreaInset';

interface HistoryChartViewProps {
  onOpenSession: (date: string) => void;
  points: ChartPoint[];
  selectionResetKey: number;
  units: DisplayUnit;
}

/** Figma `gradient` fill — white 20% at the line fading to transparent. */
const areaTop = resolveColorToken('bg-trans-2');
const areaBottom = resolveColorToken('content-trans-light');

/**
 * Half-width of the invisible box that centres the tooltip over its point.
 * Wider than any expected pill so the label stays centred without measuring.
 */
const TOOLTIP_ANCHOR_REACH = spacing['s-19'];
const TOOLTIP_HEIGHT = spacing['s-10'];

/** Matches gifted-charts' maxValue headroom so Y lines up with the drawn curve. */
const VALUE_HEADROOM = 1.15;

/** Finger travel that still counts as a tap rather than a scroll of the chart. */
const TAP_SLOP = spacing['s-5'];

function monthAbbrev(calendarDate: string): string {
  const [year, month] = calendarDate.split('-').map(Number);
  if (year == null || month == null) {
    return '';
  }
  const date = new Date(year, month - 1, 1);
  return date
    .toLocaleDateString('en-GB', { month: 'short' })
    .replace('.', '')
    .toLowerCase();
}

/**
 * History chart tab — curved area line, tap-to-read point pill, month
 * timeline. Figma frames `2468:4895` (chart) and `2104:8625` (chart-point).
 *
 * The focused point + pill live in an overlay outside the SVG: gifted-charts
 * mounts custom data points as RN Views inside `<Svg>`, which do not paint on
 * native.
 */
export function HistoryChartView({
  onOpenSession,
  points,
  selectionResetKey,
  units,
}: HistoryChartViewProps) {
  const insets = useSafeAreaInsets();
  const { width: chartWidth } = useWindowDimensions();

  const chartData = useMemo(
    () => points.map((point) => ({ value: point.value })),
    [points],
  );

  const dates = useMemo(() => points.map((point) => point.date), [points]);
  const visiblePoints = useMemo(() => getChartVisiblePoints(dates), [dates]);

  const pointSpacing = getChartPointSpacing(
    chartWidth,
    points.length,
    visiblePoints,
  );
  const initialSpacing = getChartInitialSpacing(chartWidth, points.length);
  const maxValue =
    Math.max(...points.map((point) => point.value), 1) * VALUE_HEADROOM;
  const contentWidth = (points.length - 1) * pointSpacing + initialSpacing;
  const scrolls = points.length > visiblePoints && points.length > 1;
  /** Gifted-charts scrolls to the end on mount; match that until onScroll fires. */
  const endScrollX = scrolls ? Math.max(0, contentWidth - chartWidth) : 0;

  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [scrollX, setScrollX] = useState(endScrollX);

  useEffect(() => {
    setScrollX(endScrollX);
  }, [endScrollX]);

  useEffect(() => {
    setFocusedIndex(null);
  }, [points, selectionResetKey]);

  const maxScrollX = Math.max(0, contentWidth - chartWidth);
  const scrollProgress = maxScrollX > 0 ? scrollX / maxScrollX : 0;
  const monthMarks = useMemo(
    () => getChartMonthMarks(dates, chartWidth, scrollProgress),
    [chartWidth, dates, scrollProgress],
  );

  const handleDismiss = useCallback(() => {
    setFocusedIndex(null);
  }, []);

  /**
   * The chart's own horizontal ScrollView takes the touch responder, so a
   * wrapping Pressable never fires. Raw touch events still reach the frame:
   * a release that has not travelled past `TAP_SLOP` is a tap, not a scroll.
   *
   * The frame is measured per touch because the pager translates this whole
   * tab horizontally, so a layout-time origin would be a screen width out.
   */
  const frameRef = useRef<View>(null);
  const frameOrigin = useRef({ x: 0, y: 0 });
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const pillPressed = useRef(false);

  const measureFrame = useCallback(() => {
    frameRef.current?.measureInWindow((x, y) => {
      frameOrigin.current = { x, y };
    });
  }, []);

  const handleTouchStart = useCallback(
    (event: GestureResponderEvent) => {
      measureFrame();
      const { pageX, pageY } = event.nativeEvent;
      touchStart.current = { x: pageX, y: pageY };
    },
    [measureFrame],
  );

  const handleTouchEnd = useCallback(
    (event: GestureResponderEvent) => {
      const start = touchStart.current;
      touchStart.current = null;

      if (pillPressed.current) {
        pillPressed.current = false;
        return;
      }

      const { pageX, pageY } = event.nativeEvent;
      if (
        start == null ||
        Math.hypot(pageX - start.x, pageY - start.y) > TAP_SLOP
      ) {
        return;
      }

      setFocusedIndex(
        getChartTapPointIndex(
          points.map((point) => point.value),
          pageX - frameOrigin.current.x,
          pageY - frameOrigin.current.y,
          {
            scrollX,
            initialSpacing,
            pointSpacing,
            maxValue,
          },
        ),
      );
    },
    [initialSpacing, maxValue, pointSpacing, points, scrollX],
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      setScrollX(offsetX);
      setFocusedIndex((current) => {
        if (current == null) {
          return current;
        }
        const pointX = initialSpacing + current * pointSpacing - offsetX;
        return isChartPointInViewport(pointX, chartWidth) ? current : null;
      });
    },
    [chartWidth, initialSpacing, pointSpacing],
  );

  if (points.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyCopy}>no sessions for this filter.</Text>
      </View>
    );
  }

  const focused =
    focusedIndex != null ? (points[focusedIndex] ?? null) : null;
  const focusedX =
    focusedIndex != null
      ? initialSpacing + focusedIndex * pointSpacing - scrollX
      : 0;
  const focusedY = focused != null ? getChartPointY(focused.value, maxValue) : 0;
  const tooltipTop =
    focusedY - CHART_TOOLTIP_GAP - TOOLTIP_HEIGHT >= 0
      ? focusedY - CHART_TOOLTIP_GAP - TOOLTIP_HEIGHT
      : Math.min(
          CHART_HEIGHT - TOOLTIP_HEIGHT,
          focusedY + CHART_TOOLTIP_GAP,
        );

  return (
    <View
      style={[
        styles.root,
        { paddingBottom: clampSafeInset(insets.bottom) + spacing['s-8'] },
      ]}
    >
      <View style={styles.chartArea}>
        <Pressable
          accessible={false}
          onPress={handleDismiss}
          style={styles.dismissArea}
        />
        <View
          onLayout={measureFrame}
          onTouchCancel={() => {
            touchStart.current = null;
          }}
          onTouchEnd={handleTouchEnd}
          onTouchStart={handleTouchStart}
          ref={frameRef}
          style={[styles.chartFrame, { width: chartWidth }]}
        >
          <LineChart
            areaChart
            curved
            data={chartData}
            startFillColor={areaTop.color}
            endFillColor={areaBottom.color}
            startOpacity={areaTop.opacity}
            endOpacity={areaBottom.opacity}
            color={colors['content-1']}
            thickness={spacing['s-1']}
            hideAxesAndRules
            hideYAxisText
            hideDataPoints
            // hideYAxisText still reserves a 10pt gutter; zero it to reach the edge.
            yAxisLabelWidth={0}
            // Drop the library's top headroom so maxValue lands on the frame top.
            yAxisExtraHeight={0}
            yAxisThickness={0}
            xAxisThickness={0}
            rulesThickness={0}
            initialSpacing={initialSpacing}
            endSpacing={0}
            spacing={pointSpacing}
            width={chartWidth}
            height={CHART_HEIGHT}
            maxValue={maxValue}
            mostNegativeValue={0}
            disableScroll={!scrolls}
            // Rubber-banding drags empty space in beside the line at either end.
            bounces={false}
            scrollToEnd
            isAnimated={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          />
          {focused != null && focusedIndex != null ? (
            <>
              <View
                pointerEvents="none"
                style={[
                  styles.pointOverlay,
                  {
                    left: focusedX - CHART_POINT_OUTER / 2,
                    top: focusedY - CHART_POINT_OUTER / 2,
                  },
                ]}
              >
                <View style={styles.point}>
                  <View style={styles.pointCore} />
                </View>
              </View>
              <View
                style={[
                  styles.tooltipAnchor,
                  {
                    left: focusedX - TOOLTIP_ANCHOR_REACH,
                    top: tooltipTop,
                  },
                ]}
              >
                <Pressable
                  accessibilityLabel={`open workout session ${formatHistoryDateLabel(focused.date)}`}
                  accessibilityRole="button"
                  hitSlop={spacing['s-4']}
                  onPress={() => {
                    onOpenSession(focused.date);
                  }}
                  onPressIn={() => {
                    pillPressed.current = true;
                  }}
                  style={styles.tooltip}
                >
                  <Text style={styles.tooltipDate}>
                    {formatHistoryDateLabel(focused.date)}
                  </Text>
                  <Text style={styles.tooltipColon}>:</Text>
                  <Text style={styles.tooltipValue}>
                    {formatSessionTotalWeightLabel(focused.value, units)}
                  </Text>
                  <View style={styles.tooltipIconSlot}>
                    <ForwardIcon
                      color={colors['content-5']}
                      size={spacing.icon}
                    />
                  </View>
                </Pressable>
              </View>
            </>
          ) : null}
        </View>
        <Pressable
          accessible={false}
          onPress={handleDismiss}
          style={styles.dismissArea}
        />
      </View>
      <Pressable
        accessible={false}
        onPress={handleDismiss}
        style={styles.timeline}
      >
        {monthMarks.map((mark) => (
          <View
            key={mark.key}
            style={[
              styles.timelineMark,
              { left: mark.centerX - CHART_TIMELINE_MARK_WIDTH / 2 },
            ]}
          >
            <Text numberOfLines={1} style={styles.timelineLabel}>
              {monthAbbrev(mark.date)}
            </Text>
          </View>
        ))}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  chartArea: {
    flex: 1,
  },
  dismissArea: {
    flex: 1,
  },
  chartFrame: {
    height: CHART_HEIGHT,
    overflow: 'visible',
  },
  pointOverlay: {
    position: 'absolute',
    width: CHART_POINT_OUTER,
    height: CHART_POINT_OUTER,
    zIndex: 2,
  },
  point: {
    width: CHART_POINT_OUTER,
    height: CHART_POINT_OUTER,
    borderRadius: CHART_POINT_OUTER / 2,
    backgroundColor: colors['bg-trans-2'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointCore: {
    width: CHART_POINT_CORE,
    height: CHART_POINT_CORE,
    borderRadius: CHART_POINT_CORE / 2,
    backgroundColor: colors['content-1'],
  },
  tooltipAnchor: {
    position: 'absolute',
    width: TOOLTIP_ANCHOR_REACH * 2,
    height: TOOLTIP_HEIGHT,
    alignItems: 'center',
    zIndex: 3,
  },
  tooltip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['s-4'],
    height: TOOLTIP_HEIGHT,
    paddingLeft: spacing['s-5'],
    paddingRight: spacing['s-4'],
    borderRadius: radii['r-pill'],
    backgroundColor: colors['bg-5'],
    ...shadowBelow,
  },
  tooltipDate: {
    ...typography.para2,
    color: colors['content-3'],
    ...textCase.lower,
  },
  tooltipColon: {
    ...typography.para2,
    color: colors['content-3'],
  },
  tooltipValue: {
    ...typography.para2,
    color: colors['content-5'],
  },
  tooltipIconSlot: {
    width: spacing['s-9'],
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Months past the third sit outside the viewport until scrolled in. */
  timeline: {
    height: spacing['s-12'],
    borderTopWidth: spacing['s-1'],
    borderTopColor: colors['border-2'],
    overflow: 'hidden',
    backgroundColor: colors['bg-1'],
  },
  timelineMark: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: CHART_TIMELINE_MARK_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLabel: {
    ...typography.para1,
    color: colors['content-1'],
    ...textCase.lower,
    textAlign: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['s-11'],
  },
  emptyCopy: {
    ...typography.para2,
    color: colors['content-2'],
    ...textCase.lower,
  },
});
