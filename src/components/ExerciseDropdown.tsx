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

export function ExerciseDropdown({
  label,
  onPrevious,
  onNext,
  canPrevious,
  canNext,
}: ExerciseDropdownProps) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityLabel="previous exercise"
        accessibilityRole="button"
        disabled={!canPrevious}
        onPress={onPrevious}
        style={({ pressed }) => [
          styles.chevron,
          pressed && canPrevious && styles.chevronPressed,
          !canPrevious && styles.chevronDisabled,
        ]}
      >
        <BackIcon color={canPrevious ? colors['content-1'] : colors['content-3']} />
      </Pressable>

      <Text numberOfLines={1} style={[typography.para2, styles.label]}>
        {label}
      </Text>

      <Pressable
        accessibilityLabel="next exercise"
        accessibilityRole="button"
        disabled={!canNext}
        onPress={onNext}
        style={({ pressed }) => [
          styles.chevron,
          pressed && canNext && styles.chevronPressed,
          !canNext && styles.chevronDisabled,
        ]}
      >
        <ForwardIcon color={canNext ? colors['content-1'] : colors['content-3']} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: spacing['s-12'],
    borderWidth: spacing['s-1'],
    borderColor: colors['border-2'],
    borderRadius: radii['r-pill'],
    backgroundColor: colors['bg-2'],
    overflow: 'hidden',
  },
  chevron: {
    width: spacing['s-12'],
    height: spacing['s-12'],
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors['border-2'],
  },
  chevronPressed: {
    backgroundColor: colors['bg-1'],
  },
  chevronDisabled: {
    opacity: 0.5,
  },
  label: {
    flex: 1,
    textAlign: 'center',
    color: colors['content-1'],
    ...textCase.lower,
  },
});
