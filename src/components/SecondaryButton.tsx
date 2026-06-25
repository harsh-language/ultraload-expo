import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';
import { shadowAbove } from '../theme/shadow';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';
import {
  buttonContentStyles,
  contentLayoutStyle,
  getButtonContentLayout,
} from './buttonContentLayout';
import type { AppIconProps } from './icons';
import { ClockIcon } from './icons/ClockIcon';
import { PlusIcon } from './icons/PlusIcon';

type LeadingIcon = 'clock' | 'plus' | 'none';

interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  leadingIcon?: LeadingIcon;
  style?: object;
}

function LeadingIcon({ type }: { type: LeadingIcon }) {
  const props: AppIconProps = { color: colors['content-1'] };
  if (type === 'clock') {
    return <ClockIcon {...props} />;
  }
  if (type === 'plus') {
    return <PlusIcon {...props} />;
  }
  return null;
}

export function SecondaryButton({
  label,
  onPress,
  disabled = false,
  leadingIcon = 'none',
  style,
}: SecondaryButtonProps) {
  const hasLeading = leadingIcon !== 'none';
  const layout = getButtonContentLayout(hasLeading, false);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {({ pressed }) => (
        <View
          style={[buttonContentStyles.content, contentLayoutStyle(layout)]}
        >
          <LeadingIcon type={leadingIcon} />
          <Text
            style={[
              typography.para1,
              styles.label,
              buttonContentStyles.labelCentered,
              pressed && !disabled && styles.pressedLabel,
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: spacing['s-12'],
    borderRadius: radii['r-pill'],
    borderWidth: spacing['s-1'],
    borderColor: colors['border-1'],
    backgroundColor: colors['bg-2'],
    paddingHorizontal: spacing['s-8'],
    alignSelf: 'stretch',
    ...shadowAbove,
  },
  pressed: {
    borderColor: colors['content-2'],
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    color: colors['content-1'],
    ...textCase.lower,
  },
  pressedLabel: {
    color: colors['content-2'],
  },
});
