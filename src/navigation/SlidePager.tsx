import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { tabTransitionTiming } from './mainTabs';

interface SlidePagerProps<T extends string> {
  items: readonly T[];
  selected: T;
  renderItem: (item: T) => ReactNode;
}

export function SlidePager<T extends string>({
  items,
  selected,
  renderItem,
}: SlidePagerProps<T>) {
  const { width } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const hasInitializedPager = useRef(false);

  const selectedIndex = items.indexOf(selected);

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
          { width: width * items.length },
          pagerStyle,
        ]}
      >
        {items.map((item) => (
          <View key={item} style={{ width }}>
            {renderItem(item)}
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
