import { useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { tabTransitionTiming } from '../navigation/mainTabs';
import { colors, radii, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';
import {
  AccordionTimelineDot,
  AccordionTimelineLine,
} from './AccordionTimelineGutter';
import { ChevronBottomIcon } from './icons/ChevronBottomIcon';
import { ChevronTopIcon } from './icons/ChevronTopIcon';

const ITEM_LINE_HEIGHT = typography.para4.lineHeight ?? spacing['s-7'];

interface AccordionProps {
  title: string;
  items: readonly string[];
}

function getTitleColor(expanded: boolean, pressed: boolean): string {
  if (pressed) {
    return colors['content-3'];
  }
  if (expanded) {
    return colors['content-1'];
  }
  return colors['content-2'];
}

function getChevronColor(pressed: boolean): string {
  return pressed ? colors['content-3'] : colors['content-2'];
}

function isMultiLineRow(height: number | undefined): boolean {
  return (height ?? 0) > ITEM_LINE_HEIGHT + 1;
}

export function Accordion({ title, items }: AccordionProps) {
  const [expanded, setExpanded] = useState(false);
  const [rowHeights, setRowHeights] = useState<Record<number, number>>({});
  const [measuredBodyHeight, setMeasuredBodyHeight] = useState(0);
  const expandedProgress = useSharedValue(0);
  const bodyHeight = useSharedValue(0);

  useEffect(() => {
    if (measuredBodyHeight > 0) {
      bodyHeight.value = measuredBodyHeight;
    }
  }, [bodyHeight, measuredBodyHeight]);

  const handleToggle = useCallback(() => {
    setExpanded((current) => !current);
  }, []);

  useEffect(() => {
    expandedProgress.value = withTiming(
      expanded ? 1 : 0,
      tabTransitionTiming,
    );
  }, [expanded, expandedProgress]);

  const handleBodyLayout = useCallback((event: LayoutChangeEvent) => {
    const nextHeight = event.nativeEvent.layout.height;
    if (nextHeight > 0) {
      setMeasuredBodyHeight((current) =>
        current === nextHeight ? current : nextHeight,
      );
    }
  }, []);

  const handleRowLayout = useCallback((index: number, height: number) => {
    setRowHeights((current) => {
      if (current[index] === height) {
        return current;
      }
      return { ...current, [index]: height };
    });
  }, []);

  const bodyAnimatedStyle = useAnimatedStyle(() => ({
    maxHeight: interpolate(expandedProgress.value, [0, 1], [0, bodyHeight.value]),
    opacity: expandedProgress.value,
  }));

  const chevronBottomStyle = useAnimatedStyle(() => ({
    opacity: 1 - expandedProgress.value,
  }));

  const chevronTopStyle = useAnimatedStyle(() => ({
    opacity: expandedProgress.value,
  }));

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={handleToggle}
        style={styles.header}
      >
        {({ pressed }) => {
          const titleColor = getTitleColor(expanded, pressed);
          const chevronColor = getChevronColor(pressed);

          return (
            <>
              <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
              <View style={styles.chevronSlot}>
                <Animated.View
                  pointerEvents="none"
                  style={[styles.chevronLayer, chevronBottomStyle]}
                >
                  <ChevronBottomIcon color={chevronColor} />
                </Animated.View>
                <Animated.View
                  pointerEvents="none"
                  style={[styles.chevronLayer, chevronTopStyle]}
                >
                  <ChevronTopIcon color={chevronColor} />
                </Animated.View>
              </View>
            </>
          );
        }}
      </Pressable>

      <Animated.View
        pointerEvents={expanded ? 'auto' : 'none'}
        style={[
          styles.bodyClip,
          expanded && styles.bodyClipExpanded,
          bodyAnimatedStyle,
        ]}
      >
        <View onLayout={handleBodyLayout} style={styles.body}>
          {items.flatMap((item, index) => {
            const row = (
              <View
                key={`row-${index}-${item}`}
                onLayout={(event) => {
                  handleRowLayout(index, event.nativeEvent.layout.height);
                }}
                style={styles.row}
              >
                <AccordionTimelineDot />
                <Text style={styles.itemText}>{item}</Text>
              </View>
            );

            if (index === items.length - 1) {
              return [row];
            }

            return [
              row,
              <AccordionTimelineLine
                extended={isMultiLineRow(rowHeights[index])}
                key={`line-${index}`}
              />,
            ];
          })}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: spacing['s-1'],
    borderColor: colors['border-2'],
    borderRadius: radii['r-h-48'],
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: spacing['s-11'],
    paddingHorizontal: spacing['s-8'],
    gap: spacing['s-5'],
    backgroundColor: colors['bg-1'],
    borderRadius: radii['r-pill'],
  },
  title: {
    flex: 1,
    minWidth: 0,
    ...typography.para3,
    ...textCase.lower,
  },
  chevronSlot: {
    width: spacing.icon,
    height: spacing.icon,
    position: 'relative',
    flexShrink: 0,
  },
  chevronLayer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyClip: {
    overflow: 'hidden',
  },
  bodyClipExpanded: {
    overflow: 'visible',
  },
  body: {
    backgroundColor: colors['bg-1'],
    paddingHorizontal: spacing['s-7'],
    paddingBottom: spacing['s-7'],
    paddingTop: spacing['s-4'],
    gap: spacing['s-4'],
    overflow: 'visible',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing['s-5'],
    width: '100%',
    overflow: 'visible',
  },
  itemText: {
    flex: 1,
    minWidth: 0,
    ...typography.para4,
    ...textCase.lower,
  },
});
