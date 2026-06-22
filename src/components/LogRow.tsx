import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getExerciseLabel } from '../domain/catalogue';
import { colors, radii, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';

interface LogRowProps {
  exerciseId: string;
  weight: number;
  reps: number;
  warmUp: boolean;
  unit?: string;
  onPress?: () => void;
}

export function LogRow({
  exerciseId,
  weight,
  reps,
  warmUp,
  unit = 'kg',
  onPress,
}: LogRowProps) {
  const exerciseName = getExerciseLabel(exerciseId);
  const summary = `${weight} ${unit} × ${reps}`;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && onPress && styles.pressed]}
    >
      <View style={styles.textBlock}>
        <Text style={typography.labelS}>{exerciseName}</Text>
        <Text style={typography.bodyS}>{summary}</Text>
      </View>
      {warmUp ? (
        <View style={styles.warmUpBadge}>
          <Text style={styles.warmUpLabel}>Warm-up</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors['bg-2'],
    borderRadius: radii['r-std'],
    paddingHorizontal: spacing['s-6'],
    paddingVertical: spacing['s-5'],
    minHeight: spacing['s-12'],
  },
  pressed: {
    opacity: 0.9,
  },
  textBlock: {
    flex: 1,
    gap: spacing['s-1'],
  },
  warmUpBadge: {
    backgroundColor: colors['bg-trans-2'],
    borderRadius: radii['r-pill'],
    paddingHorizontal: spacing['s-5'],
    paddingVertical: spacing['s-3'],
  },
  warmUpLabel: {
    ...typography.captionXS,
    color: colors['content-2'],
  },
});
