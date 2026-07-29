import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from './PrimaryButton';
import { colors, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';

interface HistoryEmptyStateProps {
  onStartWorkout: () => void;
}

/** Shared History empty state (list + chart) — Figma "no exercises recorded yet." */
export function HistoryEmptyState({ onStartWorkout }: HistoryEmptyStateProps) {
  return (
    <View style={styles.root}>
      <Text style={styles.copy}>no exercises recorded yet.</Text>
      <PrimaryButton
        label="start workout"
        leadingIcon="plus"
        onPress={onStartWorkout}
        style={styles.button}
        trailingIcon="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['s-8'],
    paddingHorizontal: spacing['s-11'],
  },
  copy: {
    ...typography.para2,
    color: colors['content-2'],
    ...textCase.lower,
  },
  button: {
    alignSelf: 'stretch',
  },
});
