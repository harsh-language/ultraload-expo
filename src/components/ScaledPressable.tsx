import { useState, type ReactNode } from 'react';
import {
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { usePressScale } from './usePressScale';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PressableStateCallback = (state: { pressed: boolean }) => ReactNode;

interface ScaledPressableProps extends Omit<
  PressableProps,
  'style' | 'children'
> {
  style?:
    | StyleProp<ViewStyle>
    | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
  children?: ReactNode | PressableStateCallback;
}

/**
 * Pressable with 150ms ease-out scale to `INTERACTIVE_SCALE` (0.97).
 */
export function ScaledPressable({
  disabled,
  style,
  children,
  onPressIn,
  onPressOut,
  ...rest
}: ScaledPressableProps) {
  const [pressed, setPressed] = useState(false);
  const pressScale = usePressScale(Boolean(disabled));

  const resolvedStyle =
    typeof style === 'function' ? style({ pressed }) : style;

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={(event: GestureResponderEvent) => {
        setPressed(true);
        pressScale.onPressIn();
        onPressIn?.(event);
      }}
      onPressOut={(event: GestureResponderEvent) => {
        setPressed(false);
        pressScale.onPressOut();
        onPressOut?.(event);
      }}
      style={[resolvedStyle, pressScale.animatedStyle]}
    >
      {typeof children === 'function' ? children({ pressed }) : children}
    </AnimatedPressable>
  );
}
