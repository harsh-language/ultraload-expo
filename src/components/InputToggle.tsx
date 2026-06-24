import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';
import { CheckmarkIcon } from './icons';

type TogglePosition = 'left' | 'right';

interface InputToggleProps {
  label: string | readonly string[];
  value: boolean;
  onValueChange: (value: boolean) => void;
  /** Figma `leftToggle` / `rightToggle` — checkbox on leading or trailing edge. */
  togglePosition?: TogglePosition;
}

function normalizeLabel(label: string | readonly string[]): readonly string[] {
  return typeof label === 'string' ? [label] : label;
}

function toggleColors(selected: boolean, pressed: boolean) {
  if (!selected && !pressed) {
    return {
      backgroundColor: colors['bg-2'],
      borderColor: colors['border-2'],
      checkColor: colors['content-4'],
    };
  }
  if (!selected && pressed) {
    return {
      backgroundColor: colors['bg-1'],
      borderColor: colors['border-2'],
      checkColor: colors['content-4'],
    };
  }
  if (selected && !pressed) {
    return {
      backgroundColor: colors['bg-trans-2'],
      borderColor: colors['border-1'],
      checkColor: colors['content-1'],
    };
  }
  return {
    backgroundColor: colors['bg-2'],
    borderColor: colors['content-2'],
    checkColor: colors['content-2'],
  };
}

function ToggleControl({
  pressed,
  value,
}: {
  pressed: boolean;
  value: boolean;
}) {
  const { backgroundColor, borderColor, checkColor } = toggleColors(
    value,
    pressed,
  );

  return (
    <View style={[styles.toggle, { backgroundColor, borderColor }]}>
      <CheckmarkIcon color={checkColor} />
    </View>
  );
}

function LabelText({ lines }: { lines: readonly string[] }) {
  if (lines.length === 1) {
    return <Text style={[typography.para2, styles.label]}>{lines[0]}</Text>;
  }

  return (
    <View style={styles.labelBlock}>
      {lines.map((line, index) => (
        <Text key={index} style={[typography.para2, styles.labelLine]}>
          {line}
        </Text>
      ))}
    </View>
  );
}

export function InputToggle({
  label,
  value,
  onValueChange,
  togglePosition = 'right',
}: InputToggleProps) {
  const lines = normalizeLabel(label);

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      style={styles.row}
    >
      {({ pressed }) => {
        const toggle = <ToggleControl pressed={pressed} value={value} />;
        const text = <LabelText lines={lines} />;

        return togglePosition === 'left' ? (
          <>
            {toggle}
            {text}
          </>
        ) : (
          <>
            {text}
            {toggle}
          </>
        );
      }}
    </Pressable>
  );
}

const TOGGLE_SIZE = spacing['s-12'];

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['s-8'],
    minHeight: TOGGLE_SIZE,
    alignSelf: 'stretch',
  },
  label: {
    flex: 1,
    minWidth: 0,
    ...textCase.lower,
  },
  labelBlock: {
    flex: 1,
    minWidth: 0,
  },
  labelLine: {
    ...textCase.lower,
  },
  toggle: {
    width: TOGGLE_SIZE,
    height: TOGGLE_SIZE,
    borderRadius: radii['r-pill'],
    borderWidth: spacing['s-1'],
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
