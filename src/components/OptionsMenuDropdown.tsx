import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type LayoutRectangle,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { interactiveContentColor } from '../theme/interactiveContentColor';
import { panelTransitionTiming } from '../theme/motion';
import { colors, radii, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';
import { shadowBelow } from '../theme/shadow';
import {
  ArrowsRepeatCircleIcon,
  CalendarDaysIcon,
  SettingsGearIcon,
  type AppIconProps,
} from './icons';

export type OptionsMenuKey = 'history' | 'settings' | 'reset';

interface OptionsMenuDropdownProps {
  visible: boolean;
  anchorLayout: LayoutRectangle | null;
  onClose: () => void;
  onSelect: (key: OptionsMenuKey) => void;
}

const MENU_ITEMS: {
  key: OptionsMenuKey;
  label: string;
  icon: FC<AppIconProps>;
}[] = [
  { key: 'history', label: 'history', icon: CalendarDaysIcon },
  { key: 'settings', label: 'settings', icon: SettingsGearIcon },
  { key: 'reset', label: 'reset', icon: ArrowsRepeatCircleIcon },
];

export function OptionsMenuDropdown({
  visible,
  anchorLayout,
  onClose,
  onSelect,
}: OptionsMenuDropdownProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [mounted, setMounted] = useState(false);
  const wasVisibleRef = useRef(false);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const wasVisible = wasVisibleRef.current;
    const shouldShow = visible && anchorLayout != null;
    wasVisibleRef.current = shouldShow;

    if (shouldShow && !wasVisible) {
      setMounted(true);
      opacity.value = 0;
      opacity.value = withTiming(1, panelTransitionTiming);
      return;
    }

    if (!shouldShow && wasVisible) {
      opacity.value = withTiming(0, panelTransitionTiming, (finished) => {
        if (finished) {
          runOnJS(setMounted)(false);
        }
      });
    }
  }, [anchorLayout, opacity, visible]);

  const menuStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!mounted || anchorLayout == null) {
    return null;
  }

  const menuTop = anchorLayout.y + anchorLayout.height + spacing['s-4'];
  const menuRight = spacing['s-8'];
  const menuWidth = spacing['s-17'];

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.overlay,
        { width: windowWidth, height: windowHeight },
      ]}
    >
      <Pressable
        accessibilityLabel="Close menu"
        onPress={onClose}
        style={styles.backdrop}
      />
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.menu,
          menuStyle,
          {
            top: menuTop,
            right: menuRight,
            width: menuWidth,
          },
        ]}
      >
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;

          return (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              onPress={() => {
                onSelect(item.key);
                onClose();
              }}
              style={({ pressed }) => [
                styles.item,
                pressed && styles.itemPressed,
              ]}
            >
              {({ pressed }) => {
                const contentColor = interactiveContentColor(
                  pressed,
                  'brighten',
                );

                return (
                  <>
                    <Icon color={contentColor} />
                    <Text style={[styles.itemLabel, { color: contentColor }]}>
                      {item.label}
                    </Text>
                  </>
                );
              }}
            </Pressable>
          );
        })}
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  menu: {
    position: 'absolute',
    backgroundColor: colors['bg-2'],
    borderWidth: spacing['s-1'],
    borderColor: colors['border-2'],
    borderRadius: radii['r-h-60'],
    padding: spacing['s-4'],
    gap: spacing['s-4'],
    ...shadowBelow,
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
  itemPressed: {
    backgroundColor: colors['bg-trans-1'],
  },
  itemLabel: {
    ...typography.para2,
    ...textCase.lower,
  },
});
