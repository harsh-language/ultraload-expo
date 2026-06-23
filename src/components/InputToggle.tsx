import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { CheckmarkIcon } from './icons';

interface InputToggleProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
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

export function InputToggle({ label, value, onValueChange }: InputToggleProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      style={styles.row}
    >
      {({ pressed }) => {
        const { backgroundColor, borderColor, checkColor } = toggleColors(
          value,
          pressed,
        );

        return (
          <>
            <Text style={[typography.para2, styles.label]}>{label}</Text>
            <View
              style={[
                styles.toggle,
                { backgroundColor, borderColor },
              ]}
            >
              <CheckmarkIcon color={checkColor} />
            </View>
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
  },
  toggle: {
    width: TOGGLE_SIZE,
    height: TOGGLE_SIZE,
    borderRadius: radii['r-pill'],
    borderWidth: spacing['s-1'],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
