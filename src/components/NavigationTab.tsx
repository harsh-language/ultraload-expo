import type { FC } from 'react';
import { useId } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { ACTIVE_TAB_WIDTH } from '../navigation/mainTabs';
import { colors, spacing } from '../theme/tokens';
import { resolveColorToken } from '../theme/resolveColorToken';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';
import { ICON_SIZE, type AppIconProps } from './icons';

const TAB_HEIGHT = spacing['s-12'];
const TAB_PADDING_H = spacing['s-10'];
const INACTIVE_TAB_WIDTH = TAB_PADDING_H * 2 + ICON_SIZE;

/** Figma navigation-tab active radial — top-centre origin */
const GRADIENT_CX = '50%';
const GRADIENT_CY = '0%';
const GRADIENT_RX = '75%';
const GRADIENT_RY = '100%';

const ACTIVE_GRADIENT_CENTER = resolveColorToken('bg-trans-2');
const ACTIVE_GRADIENT_EDGE = resolveColorToken('content-trans-light');

interface NavigationTabProps {
  label: string;
  active: boolean;
  onPress: () => void;
  icon: FC<AppIconProps>;
  accessibilityLabel?: string;
}

function tabIconColor(active: boolean, pressed: boolean): string {
  if (active) {
    return colors['content-1'];
  }
  return pressed ? colors['content-4'] : colors['content-3'];
}

/** Figma navigation-tab active fill — radial from top-centre, white 20% → transparent */
function TabActiveGradient() {
  const gradientId = useId().replace(/:/g, '');

  return (
    <View style={styles.gradientLayer} pointerEvents="none">
      <Svg width={ACTIVE_TAB_WIDTH} height={TAB_HEIGHT}>
        <Defs>
          <RadialGradient
            id={gradientId}
            cx={GRADIENT_CX}
            cy={GRADIENT_CY}
            rx={GRADIENT_RX}
            ry={GRADIENT_RY}
            gradientUnits="objectBoundingBox"
          >
            <Stop
              offset="0%"
              stopColor={ACTIVE_GRADIENT_CENTER.color}
              stopOpacity={ACTIVE_GRADIENT_CENTER.opacity}
            />
            <Stop
              offset="100%"
              stopColor={ACTIVE_GRADIENT_EDGE.color}
              stopOpacity={ACTIVE_GRADIENT_EDGE.opacity}
            />
          </RadialGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width={ACTIVE_TAB_WIDTH}
          height={TAB_HEIGHT}
          fill={`url(#${gradientId})`}
        />
      </Svg>
    </View>
  );
}

/** Figma: navigation-tab — icon-only when inactive; icon + label pill when active */
export function NavigationTab({
  label,
  active,
  onPress,
  icon: Icon,
  accessibilityLabel,
}: NavigationTabProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.tab, active ? styles.tabActive : styles.tabInactive]}
    >
      {({ pressed }) => (
        <>
          {active ? <TabActiveGradient /> : null}
          <View style={styles.content}>
            <Icon color={tabIconColor(active, pressed)} />
            {active ? <Text style={styles.label}>{label}</Text> : null}
          </View>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tab: {
    height: TAB_HEIGHT,
    paddingHorizontal: TAB_PADDING_H,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  tabInactive: {
    width: INACTIVE_TAB_WIDTH,
  },
  tabActive: {
    width: ACTIVE_TAB_WIDTH,
  },
  gradientLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: ACTIVE_TAB_WIDTH,
    height: TAB_HEIGHT,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['s-5'],
    zIndex: 1,
  },
  label: {
    ...typography.para3,
    color: colors['content-1'],
    ...textCase.lower,
  },
});
