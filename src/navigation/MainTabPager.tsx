import { useEffect, useRef } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { PlaceholderTabs } from '../screens/PlaceholderTabs';
import type { MainTabKey } from './mainTabs';
import {
  MAIN_TAB_ORDER,
  tabTransitionTiming,
} from './mainTabs';

interface MainTabPagerProps {
  selected: MainTabKey;
}

export function MainTabPager({ selected }: MainTabPagerProps) {
  const { width } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const hasInitializedPager = useRef(false);

  const selectedIndex = MAIN_TAB_ORDER.indexOf(selected);

  useEffect(() => {
    if (width <= 0 || selectedIndex < 0) {
      return;
    }

    const target = -selectedIndex * width;

    if (!hasInitializedPager.current) {
      translateX.value = target;
      hasInitializedPager.current = true;
      return;
    }

    translateX.value = withTiming(target, tabTransitionTiming);
  }, [selectedIndex, translateX, width]);

  const pagerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.pager,
          { width: width * MAIN_TAB_ORDER.length },
          pagerStyle,
        ]}
      >
        {MAIN_TAB_ORDER.map((tab) => (
          <View key={tab} style={{ width }}>
            <PlaceholderTabs tab={tab} />
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  pager: {
    flexDirection: 'row',
    flex: 1,
  },
});
