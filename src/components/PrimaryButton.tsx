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
import { CloseIcon } from './icons/CloseIcon';
import { PlusIcon } from './icons/PlusIcon';

type TrailingIcon = 'arrow' | 'check' | 'plus' | 'none';
type LeadingIcon = 'plus' | 'close' | 'none';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  trailingIcon?: TrailingIcon;
  leadingIcon?: LeadingIcon;
  style?: object;
}

function Trailing({ type }: { type: TrailingIcon }) {
  switch (type) {
    case 'none':
      return null;
    case 'check':
      return <CheckmarkIcon color={colors['content-5']} />;
    case 'plus':
      return <PlusIcon color={colors['content-5']} />;
    case 'arrow':
      return <ForwardIcon color={colors['content-5']} />;
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

function Leading({ type }: { type: LeadingIcon }) {
  switch (type) {
    case 'none':
      return null;
    case 'plus':
      return <PlusIcon color={colors['content-5']} />;
    case 'close':
      return <CloseIcon color={colors['content-5']} />;
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
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

  const leading = <Leading type={leadingIcon} />;

  const labelText = (
    <Text
      numberOfLines={1}
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
