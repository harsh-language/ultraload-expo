import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';
import { BackIcon, ForwardIcon } from './icons';

interface ExerciseDropdownProps {
  label: string;
  onPrevious: () => void;
  onNext: () => void;
  canPrevious: boolean;
  canNext: boolean;
}

function getIconColor(enabled: boolean, pressed: boolean): string {
  if (!enabled) {
    return colors['content-3'];
  }
  if (pressed) {
    return colors['content-2'];
  }
  return colors['content-1'];
}

export function ExerciseDropdown({
  label,
  onPrevious,
  onNext,
  canPrevious,
  canNext,
}: ExerciseDropdownProps) {
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityLabel="previous exercise"
        accessibilityRole="button"
        disabled={!canPrevious}
        onPress={onPrevious}
        style={({ pressed }) => [
          styles.endCap,
          styles.leftCap,
          {
            borderColor:
              pressed && canPrevious ? colors['border-1'] : colors['border-2'],
          },
        ]}
      >
        {({ pressed }) => (
          <BackIcon color={getIconColor(canPrevious, pressed)} />
        )}
      </Pressable>

      <View style={styles.center}>
        <Text numberOfLines={1} style={[typography.para2, styles.label]}>
          {label}
        </Text>
      </View>

      <Pressable
        accessibilityLabel="next exercise"
        accessibilityRole="button"
        disabled={!canNext}
        onPress={onNext}
        style={({ pressed }) => [
          styles.endCap,
          styles.rightCap,
          {
            borderColor:
              pressed && canNext ? colors['border-1'] : colors['border-2'],
          },
        ]}
      >
        {({ pressed }) => (
          <ForwardIcon color={getIconColor(canNext, pressed)} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: spacing['s-12'],
    borderRadius: radii['r-h-60'],
    backgroundColor: colors['bg-2'],
    overflow: 'hidden',
  },
  endCap: {
    width: spacing['s-12'],
    height: spacing['s-12'],
    borderWidth: spacing['s-1'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftCap: {
    borderTopLeftRadius: radii['r-h-60'],
    borderBottomLeftRadius: radii['r-h-60'],
  },
  rightCap: {
    borderTopRightRadius: radii['r-h-60'],
    borderBottomRightRadius: radii['r-h-60'],
  },
  center: {
    flex: 1,
    minWidth: 0,
    height: spacing['s-12'],
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: spacing['s-1'],
    borderBottomWidth: spacing['s-1'],
    borderTopColor: colors['border-2'],
    borderBottomColor: colors['border-2'],
  },
  label: {
    color: colors['content-1'],
    ...textCase.lower,
  },
});
