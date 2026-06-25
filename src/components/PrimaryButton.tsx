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
  const hasLeading = leadingIcon !== 'none';
  const hasTrailing = trailingIcon !== 'none';
  const layout = getButtonContentLayout(hasLeading, hasTrailing);

  const leading =
    leadingIcon === 'plus' ? (
      <PlusIcon color={colors['content-5']} />
    ) : null;

  const labelText = (
    <Text
      style={[
        typography.para1,
        styles.label,
        layout === 'trailingEdge'
          ? buttonContentStyles.labelGrow
          : buttonContentStyles.labelCentered,
        disabled && styles.disabledLabel,
      ]}
    >
      {label}
    </Text>
  );

  return (
    <ButtonShell
      disabled={disabled}
      onPress={onPress}
      style={style}
      variantStyles={shellVariant}
    >
      <View
        style={[buttonContentStyles.content, contentLayoutStyle(layout)]}
      >
        {layout === 'centered' ? (
          <>
            {leading}
            {labelText}
          </>
        ) : null}
        {layout === 'trailingEdge' ? (
          <>
            {labelText}
            <Trailing type={trailingIcon} />
          </>
        ) : null}
        {layout === 'splitEdges' ? (
          <>
            <View style={buttonContentStyles.leftCluster}>
              {leading}
              {labelText}
            </View>
            <Trailing type={trailingIcon} />
          </>
        ) : null}
      </View>
    </ButtonShell>
  );
}

const shellVariant: ButtonShellVariantStyles = {
  base: {
    backgroundColor: colors['bg-5'],
  },
  pressed: {
    backgroundColor: colors['bg-4'],
  },
  disabled: {
    backgroundColor: colors['bg-3'],
  },
};

const styles = StyleSheet.create({
  label: {
    color: colors['content-5'],
    ...textCase.lower,
  },
  disabledLabel: {
    color: colors['content-5'],
  },
});
