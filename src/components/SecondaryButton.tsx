import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';
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
        <>
          <LeadingIcon type={leadingIcon} />
          <Text
            style={[
              typography.para1,
              styles.label,
              pressed && !disabled && styles.pressedLabel,
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: spacing['s-12'],
    borderRadius: radii['r-pill'],
    borderWidth: spacing['s-1'],
    borderColor: colors['border-1'],
    backgroundColor: colors['bg-2'],
    paddingHorizontal: spacing['s-8'],
    gap: spacing['s-5'],
    alignSelf: 'stretch',
  },
  pressed: {
    borderColor: colors['content-2'],
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    flex: 1,
    color: colors['content-1'],
    ...textCase.lower,
  },
  pressedLabel: {
    color: colors['content-2'],
  },
});
