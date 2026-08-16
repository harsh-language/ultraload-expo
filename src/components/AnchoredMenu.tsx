import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type LayoutRectangle,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';
import { animateWithMotionPreference } from '../theme/animateWithMotionPreference';
import { interactiveContentColor } from '../theme/interactiveContentColor';
import { INTERACTIVE_SCALE, menuSpringConfig } from '../theme/motion';
import { shadowBelow } from '../theme/shadow';
import { colors, radii, spacing } from '../theme/tokens';
import { textCase } from '../theme/textCase';
import { typography } from '../theme/typography';
import { getAnchoredMenuLeft } from './anchoredMenuLayout';
import type { AppIconProps } from './icons';
import { ScaledPressable } from './ScaledPressable';

export interface AnchoredMenuItem {
  key: string;
  label: string;
  icon?: FC<AppIconProps>;
  /** Renders in the active fill, e.g. the current filter selection. */
  selected?: boolean;
  onSelect: () => void;
}

/** `page-right` pins to the page gutter; `anchor-left` follows the trigger. */
export type AnchoredMenuAlign = 'page-right' | 'anchor-left';

interface AnchoredMenuProps {
  visible: boolean;
  anchorLayout: LayoutRectangle | null;
  items: AnchoredMenuItem[];
  width: number;
  align: AnchoredMenuAlign;
  onClose: () => void;
  closeLabel: string;
  /** Caps the scrolling viewport; the panel adds its own padding on top. */
  maxViewportHeight?: number;
}

/**
 * Shared anchored dropdown panel — Figma `dropdown` / `options-menu-dropdown`.
 * Radii are concentric: panel `r-h-60` (30) − `s-4` padding = `r-h-48` (24),
 * which is exactly the pill radius of an `s-11` (48) tall item, so the first
 * and last items clip cleanly against the panel corners.
 */
export function AnchoredMenu({
  visible,
  anchorLayout,
  items,
  width,
  align,
  onClose,
  closeLabel,
  maxViewportHeight,
}: AnchoredMenuProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [mounted, setMounted] = useState(false);
  const wasVisibleRef = useRef(false);
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(INTERACTIVE_SCALE);

  useEffect(() => {
    const wasVisible = wasVisibleRef.current;
    const shouldShow = visible && anchorLayout != null;
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
  }, [anchorLayout, opacity, reduceMotion, scale, visible]);

  const menuStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!mounted || anchorLayout == null) {
    return null;
  }

  const placement =
    align === 'page-right'
      ? { right: spacing['s-8'] }
      : { left: getAnchoredMenuLeft(anchorLayout.x, width, windowWidth) };

  const rows = items.map((item) => {
    const Icon = item.icon;

    return (
      <ScaledPressable
        key={item.key}
        accessibilityRole="button"
        accessibilityState={{ selected: item.selected ?? false }}
        onPress={item.onSelect}
        style={({ pressed }) => [
          styles.item,
          (pressed || item.selected === true) && styles.itemActive,
        ]}
      >
        {({ pressed }) => {
          const contentColor = interactiveContentColor(
            pressed || item.selected === true,
            'brighten',
          );

          return (
            <>
              {Icon != null ? <Icon color={contentColor} /> : null}
              <Text
                numberOfLines={1}
                style={[styles.itemLabel, { color: contentColor }]}
              >
                {item.label}
              </Text>
            </>
          );
        }}
      </ScaledPressable>
    );
  });

  return (
    <View
      pointerEvents="box-none"
      style={[styles.overlay, { width: windowWidth, height: windowHeight }]}
    >
      <Pressable
        accessibilityLabel={closeLabel}
        onPress={onClose}
        style={styles.backdrop}
      />
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.menu,
          menuStyle,
          placement,
          {
            top: anchorLayout.y + anchorLayout.height + spacing['s-5'],
            width,
            transformOrigin:
              align === 'page-right' ? 'top right' : 'top left',
          },
        ]}
      >
        {maxViewportHeight == null ? (
          <View style={[styles.viewport, styles.list]}>{rows}</View>
        ) : (
          <ScrollView
            bounces={false}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            style={[styles.viewport, { maxHeight: maxViewportHeight }]}
          >
            {rows}
          </ScrollView>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 20,
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
    ...shadowBelow,
  },
  /** Clips at the panel's inner radius so item pills stay concentric. */
  viewport: {
    borderRadius: radii['r-h-48'],
    overflow: 'hidden',
  },
  list: {
    gap: spacing['s-4'],
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    height: spacing['s-11'],
    gap: spacing['s-5'],
    paddingHorizontal: spacing['s-7'],
    borderRadius: radii['r-pill'],
    backgroundColor: colors['bg-2'],
  },
  itemActive: {
    backgroundColor: colors['bg-trans-1'],
  },
  itemLabel: {
    ...typography.para2,
    ...textCase.lower,
  },
});
