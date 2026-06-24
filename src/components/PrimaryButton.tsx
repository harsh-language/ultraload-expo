import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';
import { ForwardIcon } from './icons/ForwardIcon';
import { CheckmarkIcon } from './icons/CheckmarkIcon';
import { PlusIcon } from './icons/PlusIcon';

type TrailingIcon = 'arrow' | 'check' | 'none';
type LeadingIcon = 'plus' | 'none';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  trailingIcon?: TrailingIcon;
  leadingIcon?: LeadingIcon;
  style?: object;
}

function Trailing({ type }: { type: TrailingIcon }) {
  if (type === 'none') {
    return null;
  }
  if (type === 'check') {
    return <CheckmarkIcon color={colors['content-5']} />;
  }
  return <ForwardIcon color={colors['content-5']} />;
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  trailingIcon = 'arrow',
  leadingIcon = 'none',
  style,
}: PrimaryButtonProps) {
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
      {leadingIcon === 'plus' ? (
        <PlusIcon color={colors['content-5']} />
      ) : null}
      <Text
        style={[
          typography.para1,
          styles.label,
          disabled && styles.disabledLabel,
        ]}
      >
        {label}
      </Text>
      <Trailing type={trailingIcon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: spacing['s-12'],
    borderRadius: radii['r-pill'],
    backgroundColor: colors['bg-5'],
    paddingHorizontal: spacing['s-8'],
    gap: spacing['s-5'],
  },
  pressed: {
    backgroundColor: colors['bg-4'],
  },
  disabled: {
    backgroundColor: colors['bg-3'],
  },
  label: {
    flex: 1,
    color: colors['content-5'],
    ...textCase.lower,
  },
  disabledLabel: {
    color: colors['content-5'],
  },
});
