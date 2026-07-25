import type { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { shadowBelow } from '../theme/shadow';
import { titleBarGradientColors } from '../theme/titleBar';
import { colors, spacing } from '../theme/tokens';

interface ScreenTitleBarProps {
  children: ReactNode;
}

/** Shared screen chrome: border, shadow, and Figma title-bar gradient fill. */
export function ScreenTitleBar({ children }: ScreenTitleBarProps) {
  return (
    <View style={styles.titleBar}>
      <LinearGradient
        colors={[...titleBarGradientColors]}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
        start={{ x: 0.5, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['s-8'],
    padding: spacing['s-8'],
    backgroundColor: colors['bg-1'],
    borderBottomWidth: spacing['s-1'],
    borderBottomColor: colors['border-2'],
    zIndex: 1,
    ...shadowBelow,
  },
});
