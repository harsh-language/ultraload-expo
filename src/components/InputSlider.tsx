import { useCallback, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { rubberband } from '../theme/motion';
import { colors, radii, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';
import { commitHaptic } from './commitHaptic';

const KNOB_WIDTH = spacing['s-5'];
/** Figma disabled input-slider — `opacity-40` on the whole control. */
const DISABLED_OPACITY = 0.4;

export interface InputSliderLabeledText {
  support?: string;
  emphasis: string;
}

interface InputSliderProps {
  value: number;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  onValueChange: (value: number) => void;
  prefix?: string;
  suffix: string;
  formatValue?: (value: number) => string;
  caption?: InputSliderLabeledText;
  captionPosition?: 'above' | 'below';
  captionHidden?: boolean;
  disabled?: boolean;
}

function InputSliderLabeledTextView({
  support,
  emphasis,
}: InputSliderLabeledText) {
  return (
    <Text style={styles.labeledTextRow}>
      {support ? (
        <Text style={styles.labeledSupport}>{support} </Text>
      ) : null}
      <Text style={styles.labeledEmphasis}>{emphasis}</Text>
    </Text>
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getPositionCount(
  minimumValue: number,
  maximumValue: number,
  step: number,
): number {
  return Math.round((maximumValue - minimumValue) / step) + 1;
}

function positionCenterX(
  index: number,
  trackWidth: number,
  positionCount: number,
): number {
  if (trackWidth <= 0) {
    return 0;
  }
  if (positionCount <= 1) {
    return trackWidth / 2;
  }
  // Travel stays inside trackInner — outer zone already applies s-4 / s-7 padding.
  const minCenter = KNOB_WIDTH / 2;
  const maxCenter = trackWidth - KNOB_WIDTH / 2;
  return (
    minCenter + index * ((maxCenter - minCenter) / (positionCount - 1))
  );
}

function valueToIndex(
  value: number,
  minimumValue: number,
  step: number,
  positionCount: number,
): number {
  const index = Math.round((value - minimumValue) / step);
  return clamp(index, 0, positionCount - 1);
}

function indexToValue(
  index: number,
  minimumValue: number,
  step: number,
): number {
  return minimumValue + index * step;
}

function xToNearestIndex(
  x: number,
  trackWidth: number,
  positionCount: number,
): number {
  if (positionCount <= 1) {
    return 0;
  }

  const minCenter = KNOB_WIDTH / 2;
  const maxCenter = trackWidth - KNOB_WIDTH / 2;
  const stepPx = (maxCenter - minCenter) / (positionCount - 1);
  const index = Math.round((x - minCenter) / stepPx);
  return clamp(index, 0, positionCount - 1);
}

/** Map finger X through rubber-band past track ends (visual only). */
export function rubberbandTrackX(x: number, trackWidth: number): number {
  if (trackWidth <= 0) {
    return x;
  }
  const minCenter = KNOB_WIDTH / 2;
  const maxCenter = trackWidth - KNOB_WIDTH / 2;
  if (x < minCenter) {
    return minCenter - rubberband(minCenter - x, trackWidth);
  }
  if (x > maxCenter) {
    return maxCenter + rubberband(x - maxCenter, trackWidth);
  }
  return x;
}

export function InputSlider({
  value,
  minimumValue,
  maximumValue,
  step = 1,
  onValueChange,
  prefix = '',
  suffix,
  formatValue = (v) => String(v),
  caption,
  captionPosition = 'below',
  captionHidden = false,
  disabled = false,
}: InputSliderProps) {
  const [pressed, setPressed] = useState(false);
  const [trackWidth, setTrackWidth] = useState(0);
  const [dragCenterX, setDragCenterX] = useState<number | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  const positionCount = useMemo(
    () => getPositionCount(minimumValue, maximumValue, step),
    [minimumValue, maximumValue, step],
  );

  const activeIndex = useMemo(
    () => valueToIndex(value, minimumValue, step, positionCount),
    [value, minimumValue, step, positionCount],
  );

  const restingCenterX = useMemo(
    () => positionCenterX(activeIndex, trackWidth, positionCount),
    [activeIndex, trackWidth, positionCount],
  );

  const knobCenterX =
    pressed && dragCenterX != null ? dragCenterX : restingCenterX;
  const knobLeft = knobCenterX - KNOB_WIDTH / 2;
  const fillWidth = knobCenterX + KNOB_WIDTH / 2;

  const handleTrackLayout = useCallback((event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  }, []);

  const updateFromX = useCallback(
    (x: number) => {
      if (trackWidth <= 0) {
        return;
      }
      setDragCenterX(rubberbandTrackX(x, trackWidth));
      const index = xToNearestIndex(x, trackWidth, positionCount);
      const next = indexToValue(index, minimumValue, step);
      if (next !== valueRef.current) {
        onValueChange(next);
      }
    },
    [trackWidth, positionCount, minimumValue, step, onValueChange],
  );

  const setPressedTrue = useCallback(() => setPressed(true), []);
  const endPress = useCallback(() => {
    setPressed(false);
    setDragCenterX(null);
    commitHaptic();
  }, []);

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(!disabled)
        .minDistance(0)
        .onBegin((event) => {
          runOnJS(setPressedTrue)();
          runOnJS(updateFromX)(event.x);
        })
        .onUpdate((event) => {
          runOnJS(updateFromX)(event.x);
        })
        .onFinalize(() => {
          runOnJS(endPress)();
        }),
    [disabled, setPressedTrue, endPress, updateFromX],
  );

  const displayValue = formatValue(value);
  const borderColor = pressed ? colors['border-1'] : colors['border-2'];
  const knobFill = pressed ? colors['content-1'] : colors['bg-trans-1'];

  const accessibilityText = [prefix, displayValue, suffix]
    .filter(Boolean)
    .join(' ');

  const pill = (
    <View
      accessibilityRole="adjustable"
      accessibilityState={{ disabled }}
      accessibilityValue={{
        min: minimumValue,
        max: maximumValue,
        now: value,
        text: accessibilityText,
      }}
      style={[styles.pill, { borderColor }]}
    >
      <View style={[styles.valuePanel, { borderRightColor: borderColor }]}>
        {prefix.length > 0 ? (
          <Text style={[typography.para2, styles.affix]}>{prefix}</Text>
        ) : null}
        <Text style={styles.value}>{displayValue}</Text>
        {suffix.length > 0 ? (
          <Text style={[typography.para2, styles.affix]}>{suffix}</Text>
        ) : null}
      </View>

      <View style={styles.trackZone}>
        <GestureDetector gesture={gesture}>
          <View style={styles.trackInner} onLayout={handleTrackLayout}>
            <View
              pointerEvents="none"
              style={[styles.fill, { width: fillWidth }]}
            />
            <View
              pointerEvents="none"
              style={[
                styles.knob,
                {
                  left: knobLeft,
                  backgroundColor: knobFill,
                  borderColor: colors['border-1'],
                },
              ]}
            />
          </View>
        </GestureDetector>
      </View>
    </View>
  );

  const captionRow = caption ? (
    <View
      style={[styles.captionRow, captionHidden && styles.captionHidden]}
    >
      <InputSliderLabeledTextView {...caption} />
    </View>
  ) : null;

  if (!caption) {
    return (
      <View style={disabled && styles.disabled}>{pill}</View>
    );
  }

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      {captionPosition === 'above' ? captionRow : null}
      {pill}
      {captionPosition === 'below' ? captionRow : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing['s-5'],
  },
  captionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['s-4'],
    width: '100%',
  },
  captionHidden: {
    opacity: 0,
  },
  labeledTextRow: {
    textAlign: 'center',
  },
  labeledSupport: {
    ...typography.para2,
    color: colors['content-2'],
    ...textCase.lower,
  },
  labeledEmphasis: {
    ...typography.para1,
    color: colors['content-1'],
    ...textCase.lower,
  },
  disabled: {
    opacity: DISABLED_OPACITY,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: spacing['s-12'],
    backgroundColor: colors['bg-2'],
    borderWidth: spacing['s-1'],
    borderRadius: radii['r-pill'],
    overflow: 'hidden',
  },
  trackZone: {
    flex: 1,
    height: '100%',
    // Figma total-range — s-7 on the outer end keeps the knob off the pill curve.
    paddingTop: spacing['s-4'],
    paddingBottom: spacing['s-4'],
    paddingLeft: spacing['s-4'],
    paddingRight: spacing['s-7'],
    justifyContent: 'center',
  },
  trackInner: {
    height: spacing['s-11'],
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    height: spacing['s-11'],
    backgroundColor: colors['bg-trans-1'],
    borderRadius: radii['r-std'],
  },
  knob: {
    position: 'absolute',
    top: 0,
    width: KNOB_WIDTH,
    height: spacing['s-11'],
    borderRadius: radii['r-pill'],
    borderWidth: spacing['s-1'],
  },
  valuePanel: {
    width: spacing['s-14'],
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['s-4'],
    borderRightWidth: spacing['s-1'],
  },
  affix: {
    color: colors['content-2'],
    ...textCase.lower,
  },
  value: {
    ...typography.para1,
    ...textCase.none,
  },
});
