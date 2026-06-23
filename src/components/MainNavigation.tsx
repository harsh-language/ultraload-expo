import type { FC } from 'react';
import { useCallback, useLayoutEffect, useRef } from 'react';
import { LayoutChangeEvent, Platform, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ACTIVE_TAB_WIDTH,
  tabTransitionTiming,
  type MainTabKey,
} from '../navigation/mainTabs';
import { colors, spacing, tokens } from '../theme/tokens';
import { NavigationTab } from './NavigationTab';
import {
  TabHistoryIcon,
  TabSettingsIcon,
  TabWorkoutIcon,
  type AppIconProps,
} from './icons';

export type { MainTabKey };

type MainNavigationColor = 'gradient' | 'flat';

interface MainNavigationProps {
  selected: MainTabKey;
  onSelect: (tab: MainTabKey) => void;
  /** Figma `color` variant — gradient fades into scrollable content above */
  color?: MainNavigationColor;
}

const TABS: {
  key: MainTabKey;
  label: string;
  icon: FC<AppIconProps>;
}[] = [
  { key: 'history', label: 'history', icon: TabHistoryIcon },
  { key: 'workout', label: 'workout', icon: TabWorkoutIcon },
  { key: 'settings', label: 'settings', icon: TabSettingsIcon },
];

const BAR_HEIGHT = spacing['s-12'];
const shadow = tokens.layout.shadow;

export function MainNavigation({
  selected,
  onSelect,
  color = 'gradient',
}: MainNavigationProps) {
  const insets = useSafeAreaInsets();
  const bandX = useSharedValue(0);
  const hasInitializedBand = useRef(false);
  const tabLayoutX = useRef<Partial<Record<MainTabKey, number>>>({});

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

  const handleSelect = useCallback(
    (tab: MainTabKey) => {
      const x = tabLayoutX.current[tab];
      if (x !== undefined) {
        moveBand(x, hasInitializedBand.current);
        hasInitializedBand.current = true;
      }
      onSelect(tab);
    },
    [moveBand, onSelect],
  );

  const handleTabLayout = useCallback(
    (key: MainTabKey) => (event: LayoutChangeEvent) => {
      const x = event.nativeEvent.layout.x;
      tabLayoutX.current[key] = x;

      if (key === selected) {
        moveBand(x, hasInitializedBand.current);
        hasInitializedBand.current = true;
      }
    },
    [moveBand, selected],
  );

  useLayoutEffect(() => {
    const x = tabLayoutX.current[selected];
    if (x === undefined) {
      return;
    }

    moveBand(x, hasInitializedBand.current);
    hasInitializedBand.current = true;
  }, [moveBand, selected]);

  const bandStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: bandX.value }],
  }));

  return (
    <View
      style={[
        styles.wrapper,
        { paddingBottom: Math.max(insets.bottom, spacing['s-5']) },
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
          {TABS.map((tab) => (
            <View key={tab.key} onLayout={handleTabLayout(tab.key)}>
              <NavigationTab
                active={selected === tab.key}
                icon={tab.icon}
                label={tab.label}
                onPress={() => handleSelect(tab.key)}
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
    ...Platform.select({
      ios: {
        shadowColor: shadow.color,
        shadowOffset: { width: 0, height: shadow.above },
        shadowOpacity: 1,
        shadowRadius: shadow.blur,
      },
      android: {
        // Android shadow approximation — iOS uses tokens.layout.shadow above
        elevation: 12,
      },
      default: {},
    }),
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
