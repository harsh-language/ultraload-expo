import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  formatRestTimerDisplay,
  getRestTimerProgress,
} from '../domain/rest-timer';
import { shadowAbove } from '../theme/shadow';
import { sheetGradientColors } from '../theme/sheetGradient';
import { colors, radii, spacing, tokens } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';

import { CloseIcon, PauseIcon, PlayIcon } from './icons';

interface RestTimerProps {
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  onToggle: () => void;
  onDismiss: () => void;
}

export function RestTimer({
  remainingSeconds,
  totalSeconds,
  isRunning,
  onToggle,
  onDismiss,
}: RestTimerProps) {
  const [minutes, seconds] = formatRestTimerDisplay(remainingSeconds).split(':');
  const progress = getRestTimerProgress(remainingSeconds, totalSeconds);
  const fillColor = isRunning ? colors['bg-trans-2'] : colors['bg-trans-1'];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[...sheetGradientColors]}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.progressInput}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress * 100}%`,
                backgroundColor: fillColor,
              },
            ]}
          />
        </View>
        <View pointerEvents="none" style={styles.timerLabel}>
          <Text style={styles.timePart}>{minutes}</Text>
          <Text style={styles.timeSeparator}>:</Text>
          <Text style={styles.timePart}>{seconds}</Text>
        </View>
      </View>

      <View style={styles.actionCombo}>
        <Pressable
          accessibilityLabel={isRunning ? 'pause rest timer' : 'resume rest timer'}
          accessibilityRole="button"
          onPress={onToggle}
          style={({ pressed }) => [
            styles.action,
            styles.leftAction,
            pressed && styles.actionPressed,
          ]}
        >
          {isRunning ? <PauseIcon /> : <PlayIcon />}
        </Pressable>
        <Pressable
          accessibilityLabel="close rest timer"
          accessibilityRole="button"
          onPress={onDismiss}
          style={({ pressed }) => [
            styles.action,
            styles.rightAction,
            pressed && styles.actionPressed,
          ]}
        >
          <CloseIcon />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['s-8'],
    backgroundColor: colors['bg-1'],
    borderTopWidth: spacing['s-1'],
    borderColor: colors['border-2'],
    padding: spacing['s-8'],
    overflow: 'hidden',
    ...shadowAbove,
  },
  progressInput: {
    flex: 1,
    minWidth: 0,
    height: spacing['s-12'],
    padding: spacing['s-4'],
    alignItems: 'center',
    backgroundColor: colors['bg-2'],
    borderWidth: spacing['s-1'],
    borderColor: colors['border-2'],
    borderRadius: radii['r-pill'],
    overflow: 'hidden',
    position: 'relative',
  },
  progressTrack: {
    flex: 1,
    alignSelf: 'stretch',
    minWidth: 0,
    overflow: 'hidden',
    borderRadius: radii['r-pill'],
  },
  progressFill: {
    height: '100%',
    overflow: 'hidden',
    borderRadius: radii['r-std'],
  },
  timerLabel: {
    position: 'absolute',
    left: spacing['s-8'],
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.font.props.extra,
  },
  timePart: {
    ...typography.para1,
    color: colors['content-1'],
    ...textCase.none,
  },
  timeSeparator: {
    ...typography.para1,
    color: colors['content-2'],
    ...textCase.none,
  },
  actionCombo: {
    width: spacing['s-14'],
    height: spacing['s-12'],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors['bg-2'],
    borderRadius: radii['r-h-60'],
  },
  action: {
    width: spacing['s-12'],
    height: spacing['s-12'],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: spacing['s-1'],
    borderColor: colors['border-2'],
  },
  leftAction: {
    borderTopLeftRadius: radii['r-h-60'],
    borderBottomLeftRadius: radii['r-h-60'],
  },
  rightAction: {
    borderTopRightRadius: radii['r-h-60'],
    borderBottomRightRadius: radii['r-h-60'],
    marginLeft: -spacing['s-1'],
  },
  actionPressed: {
    backgroundColor: colors['bg-1'],
  },
});
