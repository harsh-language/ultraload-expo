import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { colors, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';

const GUTTER_WIDTH = spacing['s-7'];
const DOT_CENTER_X = GUTTER_WIDTH / 2;
const DOT_OUTER_RADIUS = spacing['s-4'];
const DOT_INNER_RADIUS = spacing['s-3'];
const STROKE_WIDTH = spacing['s-1'];
const DOT_CONTAINER_HEIGHT = typography.para4.lineHeight ?? spacing['s-7'];
/** Figma line-container layout slot (s-5). */
export const ACCORDION_LINE_SLOT_HEIGHT = spacing['s-5'];
/** Figma extended line after a multi-line row — bottom-aligned in the slot (33px). */
export const ACCORDION_LINE_EXTENDED_HEIGHT = 33;

interface AccordionTimelineLineProps {
  extended?: boolean;
}

export function AccordionTimelineDot() {
  const dotY = DOT_CONTAINER_HEIGHT / 2;

  return (
    <View style={styles.dotContainer}>
      <Svg height={DOT_CONTAINER_HEIGHT} width={GUTTER_WIDTH}>
        <Circle
          cx={DOT_CENTER_X}
          cy={dotY}
          fill="transparent"
          r={DOT_OUTER_RADIUS}
          stroke={colors['border-2']}
          strokeWidth={STROKE_WIDTH}
        />
        <Circle
          cx={DOT_CENTER_X}
          cy={dotY}
          fill={colors['content-1']}
          r={DOT_INNER_RADIUS}
        />
      </Svg>
    </View>
  );
}

export function AccordionTimelineLine({
  extended = false,
}: AccordionTimelineLineProps) {
  const lineHeight = extended
    ? ACCORDION_LINE_EXTENDED_HEIGHT
    : ACCORDION_LINE_SLOT_HEIGHT;

  return (
    <View style={styles.lineContainer}>
      <View
        style={[
          styles.lineGraphic,
          extended ? styles.lineGraphicExtended : styles.lineGraphicDefault,
          { height: lineHeight },
        ]}
      >
        <Svg height={lineHeight} width={GUTTER_WIDTH}>
          <Line
            stroke={colors['border-2']}
            strokeWidth={STROKE_WIDTH}
            x1={DOT_CENTER_X}
            x2={DOT_CENTER_X}
            y1={0}
            y2={lineHeight}
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dotContainer: {
    width: GUTTER_WIDTH,
    height: DOT_CONTAINER_HEIGHT,
    flexShrink: 0,
  },
  lineContainer: {
    width: GUTTER_WIDTH,
    height: ACCORDION_LINE_SLOT_HEIGHT,
    flexShrink: 0,
    overflow: 'visible',
  },
  lineGraphic: {
    position: 'absolute',
    left: 0,
    width: GUTTER_WIDTH,
  },
  lineGraphicDefault: {
    top: 0,
  },
  lineGraphicExtended: {
    bottom: 0,
  },
});
