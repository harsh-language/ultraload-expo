import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';
import { ButtonShell, type ButtonShellVariantStyles } from './ButtonShell';
import {
  buttonContentStyles,
  contentLayoutStyle,
  getButtonContentLayout,
} from './buttonContentLayout';
import type { AppIconProps } from './icons';
import { ClockIcon } from './icons/ClockIcon';
import { PlusIcon } from './icons/PlusIcon';

type LeadingIcon = 'clock' | 'plus' | 'none';

const DISABLED_OPACITY = 0.5;

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
    <ButtonShell
      disabled={disabled}
      onPress={onPress}
      style={style}
      variantStyles={shellVariant}
    >
      {(pressed) => (
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
    </ButtonShell>
  );
}

const shellVariant: ButtonShellVariantStyles = {
  base: {
    borderWidth: spacing['s-1'],
    borderColor: colors['border-1'],
    backgroundColor: colors['bg-2'],
  },
  pressed: {
    borderColor: colors['content-2'],
  },
  disabled: {
    opacity: DISABLED_OPACITY,
  },
};

const styles = StyleSheet.create({
  label: {
    color: colors['content-1'],
    ...textCase.lower,
  },
  pressedLabel: {
    color: colors['content-2'],
  },
});
