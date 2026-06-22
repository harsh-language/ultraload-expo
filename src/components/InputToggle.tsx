import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';

interface InputToggleProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function InputToggle({ label, value, onValueChange }: InputToggleProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      style={styles.row}
    >
      <Text style={typography.bodyM}>{label}</Text>
      <View style={[styles.track, value && styles.trackOn]}>
        <View style={[styles.thumb, value && styles.thumbOn]} />
      </View>
    </Pressable>
  );
}

const TRACK_WIDTH = spacing['s-12'];
const THUMB_SIZE = spacing['s-8'];

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: spacing['s-11'],
  },
  track: {
    width: TRACK_WIDTH,
    height: spacing['s-9'],
    borderRadius: radii['r-pill'],
    backgroundColor: colors['bg-trans-1'],
    borderWidth: 1,
    borderColor: colors['border-2'],
    padding: spacing['s-1'],
    justifyContent: 'center',
  },
  trackOn: {
    backgroundColor: colors['bg-5'],
    borderColor: colors['bg-5'],
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radii['r-pill'],
    backgroundColor: colors['content-2'],
  },
  thumbOn: {
    alignSelf: 'flex-end',
    backgroundColor: colors['content-5'],
  },
});
