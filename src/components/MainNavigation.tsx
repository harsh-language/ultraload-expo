import type { FC } from 'react';
import { useCallback, useLayoutEffect, useRef } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ACTIVE_TAB_WIDTH,
  MAIN_TAB_ORDER,
  TAB_LABELS,
  tabTransitionTiming,
  type MainTabKey,
} from '../navigation/mainTabs';
import { colors, spacing } from '../theme/tokens';
import { shadowAbove } from '../theme/shadow';
import { NavigationTab } from './NavigationTab';
import {
  TabHistoryIcon,
  TabSettingsIcon,
  TabWorkoutIcon,
  type AppIconProps,
} from './icons';

type MainNavigationColor = 'gradient' | 'flat';

interface MainNavigationProps {
  selected: MainTabKey;
  onSelect: (tab: MainTabKey) => void;
  /** Figma `color` variant — gradient fades into scrollable content above */
  color?: MainNavigationColor;
}

const TAB_ICONS: Record<MainTabKey, FC<AppIconProps>> = {
  history: TabHistoryIcon,
  workout: TabWorkoutIcon,
  settings: TabSettingsIcon,
};

const BAR_HEIGHT = spacing['s-12'];

/** Tab bar height excluding the home-indicator inset (lives in `wrapper` padding). */
export const MAIN_NAVIGATION_BAR_HEIGHT = BAR_HEIGHT;

export function getMainNavigationHomeInset(insets: { bottom: number }): number {
  return Math.max(insets.bottom, spacing['s-5']);
}

export function MainNavigation({
  selected,
  onSelect,
  color = 'gradient',
}: MainNavigationProps) {
  const insets = useSafeAreaInsets();
  const bandX = useSharedValue(0);
  const hasInitializedBand = useRef(false);
  const tabLayoutX = useRef<Partial<Record<MainTabKey, number>>>({});
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  const moveBand = useCallback(
    (x: number, animated: boolean) => {
      if (animated) {
        bandX.value = withTiming(x, tabTransitionTiming);
      } else {
        bandX.value = x;
      }
    },
    [bandX],
  );

  const moveBandOnceRef = useRef<(x: number) => void>(() => {});
  moveBandOnceRef.current = (x: number) => {
    moveBand(x, hasInitializedBand.current);
    hasInitializedBand.current = true;
  };

  const tabLayoutHandlers = useRef<
    Partial<Record<MainTabKey, (event: LayoutChangeEvent) => void>>
  >({});

  const getTabLayoutHandler = (key: MainTabKey) => {
    if (!tabLayoutHandlers.current[key]) {
      tabLayoutHandlers.current[key] = (event) => {
        const x = event.nativeEvent.layout.x;
        tabLayoutX.current[key] = x;

        if (key === selectedRef.current) {
          moveBandOnceRef.current(x);
        }
      };
    }
    return tabLayoutHandlers.current[key]!;
  };

  const handleSelect = useCallback(
    (tab: MainTabKey) => {
      const x = tabLayoutX.current[tab];
      if (x !== undefined) {
        moveBandOnceRef.current(x);
      }
      onSelect(tab);
    },
    [onSelect],
  );

  useLayoutEffect(() => {
    const x = tabLayoutX.current[selected];
    if (x === undefined) {
      return;
    }

    moveBandOnceRef.current(x);
  }, [selected]);

  const bandStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: bandX.value }],
  }));

  return (
    <View
      style={[
        styles.wrapper,
        { paddingBottom: getMainNavigationHomeInset(insets) },
      ]}
    >
      <View style={styles.bar}>
        <View style={styles.barBase} />
        {color === 'gradient' ? (
          <LinearGradient
            colors={[colors['bg-trans-1'], colors['content-trans-light']]}
            end={{ x: 0.5, y: 1 }}
            start={{ x: 0.5, y: 0 }}
            style={styles.barGradient}
          />
        ) : null}
        <View style={styles.row}>
          {MAIN_TAB_ORDER.map((key) => (
            <View key={key} onLayout={getTabLayoutHandler(key)}>
              <NavigationTab
                active={selected === key}
                icon={TAB_ICONS[key]}
                label={TAB_LABELS[key]}
                onPress={() => handleSelect(key)}
              />
            </View>
          ))}
          <Animated.View
            pointerEvents="none"
            style={[styles.band, bandStyle]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors['bg-1'],
  },
  bar: {
    height: BAR_HEIGHT,
    borderTopWidth: spacing['s-1'],
    borderTopColor: colors['border-2'],
    paddingHorizontal: spacing['s-8'],
    overflow: 'hidden',
    ...shadowAbove,
  },
  barBase: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors['bg-1'],
  },
  barGradient: {
    ...StyleSheet.absoluteFill,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 1,
  },
  band: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: ACTIVE_TAB_WIDTH,
    height: spacing['s-1'],
    backgroundColor: colors['border-1'],
    zIndex: 2,
  },
});
