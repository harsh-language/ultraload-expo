import { spacing } from './tokens';

/**
 * History chart geometry — Figma `chart` (2468:4895) and `chart-point` (2104:8625).
 * The chart spans the viewport edge to edge; every value below is token-bound.
 */

/** Figma annotation: at most 12 items in one viewport, older via horizontal scroll. */
export const CHART_VISIBLE_POINTS = 12;

/** Paper `timeline` shows three month marks (oct / nov / dec) across one viewport. */
export const CHART_MAX_VISIBLE_MONTHS = 3;

/** Paper `timeline` label box — sets the lane the month marks are spaced within. */
export const CHART_TIMELINE_LABEL_WIDTH = spacing['s-10'];

/**
 * Rendered box for a mark. Wider than the Paper label so four-letter
 * abbreviations (`sept`) stay on one line; the extra width is transparent and
 * centred, so it does not move the text.
 */
export const CHART_TIMELINE_MARK_WIDTH = spacing['s-12'];

/** Page gutter the first and last month marks stop against. */
export const CHART_TIMELINE_INSET = spacing['s-8'];

/** `gradient` block height. */
export const CHART_HEIGHT = spacing['s-17'];

/** `dot` ellipse diameter. */
export const CHART_POINT_CORE = spacing['s-5'];

/** `dot` outside stroke width. */
export const CHART_POINT_HALO = spacing['s-4'];

/** Core plus halo on both sides — the tappable point's rendered box. */
export const CHART_POINT_OUTER = CHART_POINT_CORE + CHART_POINT_HALO * 2;

/** Half-width of the line's touch band; total target stays above 44pt. */
export const CHART_LINE_TAP_RANGE = spacing['s-8'];

/** Distance from the tooltip's bottom edge to the point centre. */
export const CHART_TOOLTIP_GAP = spacing['s-9'];

function calendarMonthSpan(from: string, to: string): number {
  const [fromYear, fromMonth] = from.split('-').map(Number);
  const [toYear, toMonth] = to.split('-').map(Number);
  if (
    fromYear == null ||
    fromMonth == null ||
    toYear == null ||
    toMonth == null
  ) {
    return 1;
  }
  return (toYear - fromYear) * 12 + (toMonth - fromMonth) + 1;
}

/**
 * How many points fit one viewport: 12, or fewer when 12 would stretch past
 * `CHART_MAX_VISIBLE_MONTHS`. Sparse series (a session every few weeks) would
 * otherwise crowd the timeline with a month mark per point.
 *
 * `dates` must be ascending. Two points is the floor — a line needs both ends.
 * A series shorter than one viewport is left uncapped: it cannot scroll, so
 * every point has to be drawn whatever range it covers.
 */
export function getChartVisiblePoints(dates: readonly string[]): number {
  const spansTooManyMonths = (windowSize: number): boolean => {
    for (let start = 0; start + windowSize <= dates.length; start += 1) {
      const from = dates[start];
      const to = dates[start + windowSize - 1];
      if (
        from != null &&
        to != null &&
        calendarMonthSpan(from, to) > CHART_MAX_VISIBLE_MONTHS
      ) {
        return true;
      }
    }
    return false;
  };

  let visible = CHART_VISIBLE_POINTS;
  while (visible > 2 && spansTooManyMonths(visible)) {
    visible -= 1;
  }
  return visible;
}

/**
 * Gap between points so `visiblePoints` fill the width edge to edge.
 * Series shorter than one viewport stretch to fit; longer ones scroll.
 */
export function getChartPointSpacing(
  chartWidth: number,
  pointCount: number,
  visiblePoints: number = CHART_VISIBLE_POINTS,
): number {
  if (pointCount <= 1) {
    return chartWidth;
  }
  return chartWidth / Math.min(visiblePoints - 1, pointCount - 1);
}

/**
 * Where gifted-charts draws a zero value, measured from the frame's top.
 *
 * The library sizes its plot box as `CHART_HEIGHT + yAxisExtraHeight + 60` and
 * anchors the baseline 61pt above that box's bottom, so with
 * `yAxisExtraHeight={0}` the curve sits 1pt higher than the frame. Without that
 * prop it would also drop by `CHART_HEIGHT / 20`.
 */
const CHART_BASELINE_Y = CHART_HEIGHT - 1;

/**
 * Y of a value inside the plotted band, measured from the frame's top so the
 * focused point overlay lands on the drawn curve. Values outside the range
 * clamp onto the plot rather than floating off it.
 */
export function getChartPointY(value: number, maxValue: number): number {
  if (maxValue <= 0) {
    return CHART_BASELINE_Y;
  }
  const ratio = Math.min(1, Math.max(0, value / maxValue));
  return CHART_BASELINE_Y - ratio * CHART_HEIGHT;
}

/**
 * Selects the workout nearest a tap when that tap lands inside the line's
 * touch band. Segment distance makes the full line tappable, not only its
 * visible session dots.
 */
export function getChartTapPointIndex(
  values: readonly number[],
  tapX: number,
  tapY: number,
  scrollX: number,
  initialSpacing: number,
  pointSpacing: number,
  maxValue: number,
): number | null {
  if (values.length === 0 || pointSpacing <= 0) {
    return null;
  }

  const positions = values.map((value, index) => ({
    x: initialSpacing + index * pointSpacing - scrollX,
    y: getChartPointY(value, maxValue),
  }));

  if (positions.length === 1) {
    const only = positions[0];
    if (only == null) {
      return null;
    }
    return Math.hypot(tapX - only.x, tapY - only.y) <= CHART_LINE_TAP_RANGE
      ? 0
      : null;
  }

  let closestDistance = Number.POSITIVE_INFINITY;
  let closestIndex: number | null = null;

  for (let index = 0; index < positions.length - 1; index += 1) {
    const from = positions[index];
    const to = positions[index + 1];
    if (from == null || to == null) {
      continue;
    }

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const lengthSquared = dx * dx + dy * dy;
    if (lengthSquared === 0) {
      continue;
    }

    const projection = Math.min(
      1,
      Math.max(
        0,
        ((tapX - from.x) * dx + (tapY - from.y) * dy) / lengthSquared,
      ),
    );
    const closestX = from.x + projection * dx;
    const closestY = from.y + projection * dy;
    const distance = Math.hypot(tapX - closestX, tapY - closestY);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex =
        Math.abs(tapX - from.x) <= Math.abs(tapX - to.x)
          ? index
          : index + 1;
    }
  }

  return closestDistance <= CHART_LINE_TAP_RANGE ? closestIndex : null;
}

export interface ChartMonthMark {
  /** `YYYY-MM`, stable across re-renders. */
  key: string;
  /** First point in the month — the component formats the label from it. */
  date: string;
  /** Centre of the mark within the viewport, already offset by the scroll. */
  centerX: number;
}

function listChartMonths(
  dates: readonly string[],
): { key: string; date: string }[] {
  const months: { key: string; date: string }[] = [];

  dates.forEach((date) => {
    const key = date.slice(0, 7);
    if (months[months.length - 1]?.key !== key) {
      months.push({ key, date });
    }
  });

  return months;
}

/**
 * Evenly spaced month marks. Up to `CHART_MAX_VISIBLE_MONTHS` fill the width
 * between the page gutters — one centres, two take the ends — and any further
 * months wait offscreen, sliding in as `scrollProgress` runs 0 → 1.
 *
 * Spacing is fixed rather than anchored to each month's points, so the marks
 * stay equidistant while the chart scrolls under them.
 */
export function getChartMonthMarks(
  dates: readonly string[],
  chartWidth: number,
  scrollProgress: number,
): ChartMonthMark[] {
  const months = listChartMonths(dates);

  if (months.length === 0) {
    return [];
  }

  if (months.length === 1) {
    const [only] = months;
    return only == null ? [] : [{ ...only, centerX: chartWidth / 2 }];
  }

  const firstCenter = CHART_TIMELINE_INSET + CHART_TIMELINE_LABEL_WIDTH / 2;
  const lastCenter = chartWidth - firstCenter;
  const visibleMonths = Math.min(CHART_MAX_VISIBLE_MONTHS, months.length);
  const pitch = (lastCenter - firstCenter) / (visibleMonths - 1);
  const offset =
    Math.min(1, Math.max(0, scrollProgress)) *
    (months.length - visibleMonths) *
    pitch;

  return months.map((month, index) => ({
    ...month,
    centerX: firstCenter + index * pitch - offset,
  }));
}

/**
 * Whether a point still sits inside the viewport at the current scroll offset.
 * A selected reading is dropped once its point scrolls off, rather than pinning
 * the pill to an edge it no longer points at.
 */
export function isChartPointInViewport(
  x: number,
  chartWidth: number,
): boolean {
  return x >= 0 && x <= chartWidth;
}

/**
 * Leading offset. Zero keeps the line flush to the left edge; a lone point has
 * no line to span, so it centres instead of pinning to the edge.
 */
export function getChartInitialSpacing(
  chartWidth: number,
  pointCount: number,
): number {
  return pointCount === 1 ? chartWidth / 2 : 0;
}
