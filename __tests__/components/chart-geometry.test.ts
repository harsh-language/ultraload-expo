import { spacing } from '../../src/theme/tokens';
import {
  CHART_HEIGHT,
  CHART_LINE_TAP_RANGE,
  CHART_MAX_VISIBLE_MONTHS,
  CHART_POINT_CORE,
  CHART_POINT_HALO,
  CHART_POINT_OUTER,
  CHART_TIMELINE_INSET,
  CHART_TIMELINE_LABEL_WIDTH,
  CHART_TOOLTIP_GAP,
  CHART_VISIBLE_POINTS,
  getChartInitialSpacing,
  getChartMonthMarks,
  getChartPointSpacing,
  getChartTapPointIndex,
  getChartPointY,
  getChartVisiblePoints,
  isChartPointInViewport,
} from '../../src/theme/chartGeometry';

describe('chartGeometry', () => {
  const width = 390;

  it('binds every dimension to a Figma token', () => {
    expect(CHART_HEIGHT).toBe(spacing['s-17']);
    expect(CHART_POINT_CORE).toBe(spacing['s-5']);
    expect(CHART_POINT_HALO).toBe(spacing['s-4']);
    expect(CHART_POINT_OUTER).toBe(spacing['s-5'] + spacing['s-4'] * 2);
    expect(CHART_LINE_TAP_RANGE).toBe(spacing['s-8']);
    expect(CHART_TOOLTIP_GAP).toBe(spacing['s-9']);
    expect(CHART_TIMELINE_LABEL_WIDTH).toBe(spacing['s-10']);
    expect(CHART_TIMELINE_INSET).toBe(spacing['s-8']);
  });

  it('shows at most 12 points and 3 months in one viewport', () => {
    expect(CHART_VISIBLE_POINTS).toBe(12);
    expect(CHART_MAX_VISIBLE_MONTHS).toBe(3);
  });

  describe('getChartPointSpacing', () => {
    it('stretches a short series edge to edge', () => {
      expect(getChartPointSpacing(width, 2)).toBe(width);
      expect(getChartPointSpacing(width, 3)).toBe(width / 2);
      expect(getChartPointSpacing(width, 12)).toBe(width / 11);
    });

    it('caps spacing once the series overflows the viewport', () => {
      expect(getChartPointSpacing(width, 13)).toBe(width / 11);
      expect(getChartPointSpacing(width, 40)).toBe(width / 11);
    });

    it('falls back to the full width for a single point', () => {
      expect(getChartPointSpacing(width, 1)).toBe(width);
      expect(getChartPointSpacing(width, 0)).toBe(width);
    });
  });

  describe('getChartVisiblePoints', () => {
    function everyNthDay(count: number, step: number): string[] {
      const dates: string[] = [];
      const start = new Date(2026, 3, 1);
      for (let index = 0; index < count; index += 1) {
        const date = new Date(start);
        date.setDate(start.getDate() + index * step);
        dates.push(date.toISOString().slice(0, 10));
      }
      return dates;
    }

    it('keeps all 12 points when they fit inside three months', () => {
      expect(getChartVisiblePoints(everyNthDay(30, 2))).toBe(12);
    });

    it('shows fewer points when 12 would stretch past three months', () => {
      // 12 weekly points cover 77 days, which can touch four calendar months.
      expect(getChartVisiblePoints(everyNthDay(30, 7))).toBe(9);
      expect(getChartVisiblePoints(everyNthDay(24, 30))).toBe(3);
    });

    it('never drops below the two points a line needs', () => {
      expect(getChartVisiblePoints(everyNthDay(24, 90))).toBe(2);
    });

    it('leaves series shorter than one viewport uncapped', () => {
      expect(getChartVisiblePoints([])).toBe(12);
      expect(getChartVisiblePoints(['2026-04-01'])).toBe(12);
      expect(getChartVisiblePoints(['2026-01-01', '2027-12-01'])).toBe(12);
    });
  });

  describe('getChartMonthMarks', () => {
    const firstCenter = CHART_TIMELINE_INSET + CHART_TIMELINE_LABEL_WIDTH / 2;
    const lastCenter = width - firstCenter;

    function datesAcross(months: number): string[] {
      return Array.from({ length: months }, (_, index) =>
        `2026-${String(index + 1).padStart(2, '0')}-01`,
      );
    }

    it('centres a lone month', () => {
      const marks = getChartMonthMarks(['2026-04-01', '2026-04-20'], width, 0);

      expect(marks).toHaveLength(1);
      expect(marks[0]?.centerX).toBe(width / 2);
      expect(marks[0]?.date).toBe('2026-04-01');
    });

    it('spreads two months across the full width', () => {
      const marks = getChartMonthMarks(datesAcross(2), width, 0);

      expect(marks.map((mark) => mark.centerX)).toEqual([
        firstCenter,
        lastCenter,
      ]);
    });

    it('spaces three months equidistantly between the gutters', () => {
      const marks = getChartMonthMarks(datesAcross(3), width, 0);
      const centers = marks.map((mark) => mark.centerX);

      expect(centers[0]).toBe(firstCenter);
      expect(centers[2]).toBe(lastCenter);
      expect(centers[1]! - centers[0]!).toBe(centers[2]! - centers[1]!);
    });

    it('keeps the same pitch and holds extra months offscreen', () => {
      const marks = getChartMonthMarks(datesAcross(5), width, 0);
      const centers = marks.map((mark) => mark.centerX);
      const pitch = (lastCenter - firstCenter) / 2;

      expect(centers).toEqual([
        firstCenter,
        firstCenter + pitch,
        firstCenter + pitch * 2,
        firstCenter + pitch * 3,
        firstCenter + pitch * 4,
      ]);
      expect(centers[3]).toBeGreaterThan(width);
    });

    it('scrolls the last three months into the lane at full progress', () => {
      const marks = getChartMonthMarks(datesAcross(5), width, 1);
      const centers = marks.map((mark) => mark.centerX);

      expect(centers.slice(2)).toEqual([
        firstCenter,
        (firstCenter + lastCenter) / 2,
        lastCenter,
      ]);
      expect(centers[1]).toBeLessThan(firstCenter);
    });

    it('names each mark by the first point of its month', () => {
      const marks = getChartMonthMarks(
        ['2026-04-10', '2026-04-28', '2026-05-03'],
        width,
        0,
      );

      expect(marks.map((mark) => mark.date)).toEqual([
        '2026-04-10',
        '2026-05-03',
      ]);
    });

    it('has nothing to place without points', () => {
      expect(getChartMonthMarks([], width, 0)).toEqual([]);
    });
  });

  describe('getChartPointY', () => {
    it('lands the top and bottom of the range on the plot edges', () => {
      expect(getChartPointY(100, 100)).toBe(-1);
      expect(getChartPointY(0, 100)).toBe(CHART_HEIGHT - 1);
      expect(getChartPointY(50, 100)).toBe(CHART_HEIGHT / 2 - 1);
    });

    it('clamps values outside the range onto the plot', () => {
      expect(getChartPointY(150, 100)).toBe(-1);
      expect(getChartPointY(-20, 100)).toBe(CHART_HEIGHT - 1);
    });

    it('falls back to the baseline when there is no range', () => {
      expect(getChartPointY(0, 0)).toBe(CHART_HEIGHT - 1);
    });
  });

  describe('getChartTapPointIndex', () => {
    const values = [25, 75, 50];
    const spacing = width / 2;
    const y = (value: number) => getChartPointY(value, 100);

    it('selects the nearest workout from anywhere along the line', () => {
      expect(
        getChartTapPointIndex(
          values,
          spacing * 0.25,
          (y(25) * 3 + y(75)) / 4,
          0,
          0,
          spacing,
          100,
        ),
      ).toBe(0);
      expect(
        getChartTapPointIndex(values, spacing, y(75), 0, 0, spacing, 100),
      ).toBe(1);
    });

    it('accounts for horizontal chart scrolling', () => {
      expect(
        getChartTapPointIndex(
          values,
          spacing,
          y(50),
          spacing,
          0,
          spacing,
          100,
        ),
      ).toBe(2);
    });

    it('ignores taps outside the line touch band', () => {
      expect(
        getChartTapPointIndex(
          values,
          spacing,
          CHART_HEIGHT,
          0,
          0,
          spacing,
          100,
        ),
      ).toBeNull();
    });

    it('supports a lone workout point', () => {
      expect(
        getChartTapPointIndex(
          [50],
          width / 2,
          y(50),
          0,
          width / 2,
          width,
          100,
        ),
      ).toBe(0);
    });
  });

  describe('isChartPointInViewport', () => {
    it('keeps a selected reading while its point is on screen', () => {
      expect(isChartPointInViewport(0, width)).toBe(true);
      expect(isChartPointInViewport(width / 2, width)).toBe(true);
      expect(isChartPointInViewport(width, width)).toBe(true);
    });

    it('drops a reading once its point scrolls off either edge', () => {
      expect(isChartPointInViewport(-1, width)).toBe(false);
      expect(isChartPointInViewport(width + 1, width)).toBe(false);
    });
  });

  describe('getChartInitialSpacing', () => {
    it('keeps the line flush to the left edge', () => {
      expect(getChartInitialSpacing(width, 2)).toBe(0);
      expect(getChartInitialSpacing(width, 12)).toBe(0);
      expect(getChartInitialSpacing(width, 40)).toBe(0);
    });

    it('centres a lone point, which has no line to span', () => {
      expect(getChartInitialSpacing(width, 1)).toBe(width / 2);
    });
  });
});
