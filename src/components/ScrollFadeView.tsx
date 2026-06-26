import { LinearGradient } from 'expo-linear-gradient';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  ScrollViewProps,
} from 'react-native';
import { ScrollView as RNScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  getScrollFadeVisibility,
  SCROLL_FADE_HEIGHT,
  scrollFadeGradients,
} from '../theme/scrollFade';

const FADE_TRANSITION_MS = 250;

export interface ScrollFadeViewProps extends ScrollViewProps {
  /** Default height for both fades when top/bottom heights are omitted */
  fadeHeight?: number;
  topFadeHeight?: number;
  bottomFadeHeight?: number;
  topOffset?: number;
  bottomOffset?: number;
  /** Show bottom fade even when content does not overflow (e.g. workout footer overlay). */
  alwaysShowBottomFade?: boolean;
  /** Show top fade even when scrolled to top (e.g. workout title overlay). */
  alwaysShowTopFade?: boolean;
}

export const ScrollFadeView = forwardRef<ScrollView, ScrollFadeViewProps>(
  function ScrollFadeView(
    {
      fadeHeight = SCROLL_FADE_HEIGHT,
      topFadeHeight,
      bottomFadeHeight,
      topOffset = 0,
      bottomOffset = 0,
      alwaysShowBottomFade = false,
      alwaysShowTopFade = false,
      onScroll,
      onLayout,
      onContentSizeChange,
      style,
      scrollEventThrottle = 16,
      children,
      ...scrollViewProps
    },
    ref,
  ) {
  const resolvedTopFadeHeight = topFadeHeight ?? fadeHeight;
  const resolvedBottomFadeHeight = bottomFadeHeight ?? fadeHeight;

  const [scrollY, setScrollY] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  const { showTop, showBottom } = useMemo(
    () =>
      getScrollFadeVisibility({
        scrollY,
        viewportHeight,
        contentHeight,
      }),
    [scrollY, viewportHeight, contentHeight],
  );

  const topOpacity = useSharedValue(0);
  const bottomOpacity = useSharedValue(0);

  const hasOverflow =
    viewportHeight > 0 && contentHeight > viewportHeight + 1;
  const showBottomFade = alwaysShowBottomFade || (hasOverflow && showBottom);
  const showTopFade = alwaysShowTopFade || (hasOverflow && showTop);

  useEffect(() => {
    topOpacity.value = withTiming(showTopFade ? 1 : 0, {
      duration: FADE_TRANSITION_MS,
    });
  }, [showTopFade, topOpacity]);

  useEffect(() => {
    bottomOpacity.value = withTiming(showBottomFade ? 1 : 0, {
      duration: FADE_TRANSITION_MS,
    });
  }, [showBottomFade, bottomOpacity]);

  const topFadeStyle = useAnimatedStyle(() => ({
    opacity: topOpacity.value,
  }));

  const bottomFadeStyle = useAnimatedStyle(() => ({
    opacity: bottomOpacity.value,
  }));

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      setScrollY(event.nativeEvent.contentOffset.y);
      onScroll?.(event);
    },
    [onScroll],
  );

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      setViewportHeight(event.nativeEvent.layout.height);
      onLayout?.(event);
    },
    [onLayout],
  );

  const handleContentSizeChange = useCallback(
    (width: number, height: number) => {
      setContentHeight(height);
      onContentSizeChange?.(width, height);
    },
    [onContentSizeChange],
  );

  return (
    <View style={styles.container}>
      <RNScrollView
        {...scrollViewProps}
        ref={ref}
        onContentSizeChange={handleContentSizeChange}
        onLayout={handleLayout}
        onScroll={handleScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={[styles.scroll, style]}
      >
        {children}
      </RNScrollView>
      {showTopFade || showBottomFade ? (
        <>
          {showTopFade ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.fade,
              styles.topFade,
              { height: resolvedTopFadeHeight, top: topOffset },
              topFadeStyle,
            ]}
          >
            <LinearGradient
              colors={[...scrollFadeGradients.top]}
              end={{ x: 0.5, y: 1 }}
              start={{ x: 0.5, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
          ) : null}
          {showBottomFade ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.fade,
              styles.bottomFade,
              { height: resolvedBottomFadeHeight, bottom: bottomOffset },
              bottomFadeStyle,
            ]}
          >
            <LinearGradient
              colors={[...scrollFadeGradients.bottom]}
              end={{ x: 0.5, y: 1 }}
              start={{ x: 0.5, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
          ) : null}
        </>
      ) : null}
    </View>
  );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  topFade: {
    top: 0,
  },
  bottomFade: {
    bottom: 0,
  },
});
