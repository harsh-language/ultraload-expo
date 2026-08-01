import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatSetIndex } from '../domain/set-labels';
import { formatDisplayWeight } from '../domain/units';
import { colors, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';
import {
  ArrowPathDownIcon,
  ArrowPathUpIcon,
  CloseIcon,
  CrownIcon,
  IconLink,
  PencilIcon,
} from './icons';
import { logSetTextStyles } from './logSetTextStyles';
import { ScaledPressable } from './ScaledPressable';

export type LogStatDirection = 'up' | 'down' | 'flat';

type LogSetRowBaseProps = {
  type: 'set';
  weight: number;
  reps: number;
  unit?: string;
  /** Figma `button/info` — edit/delete icons on Work Out; hidden on History */
  showActions?: boolean;
  /**
   * Bottom border between rows. Off for the last set in an exercise group —
   * borders separate siblings, not terminate a list.
   */
  showBottomBorder?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPress?: () => void;
};

export type LogSetRowProps = LogSetRowBaseProps &
  (
    | { warmUp: true; setIndex?: never }
    | { warmUp?: false; setIndex: number }
  );

interface LogExerciseRowProps {
  type: 'exercise';
  title: string;
  stat?: { label: string; direction: LogStatDirection };
  showStat?: boolean;
  onPress?: () => void;
}

interface LogSessionRowProps {
  type: 'session';
  dateLabel: string;
  totalLabel: string;
  /** All-time high for this day’s exercise set — Figma `bestRecord` crown. */
  isBestRecord?: boolean;
  /** Bottom border between rows. Off for the last History list item. */
  showBottomBorder?: boolean;
  stat?: { label: string; direction: LogStatDirection };
  showStat?: boolean;
  onPress?: () => void;
}

interface LogSpaceRowProps {
  type: 'space';
}

export type LogRowProps =
  | LogSetRowProps
  | LogExerciseRowProps
  | LogSessionRowProps
  | LogSpaceRowProps;

export function LogRow(props: LogRowProps) {
  switch (props.type) {
    case 'set':
      return <LogSetRow {...props} />;
    case 'exercise':
      return <LogExerciseRow {...props} />;
    case 'session':
      return <LogSessionRow {...props} />;
    case 'space':
      return <View style={styles.space} />;
    default: {
      const _exhaustive: never = props;
      return _exhaustive;
    }
  }
}

function RowPressable({
  onPress,
  bordered = false,
  children,
}: {
  onPress?: () => void;
  bordered?: boolean;
  children: ReactNode;
}) {
  return (
    <ScaledPressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.rowPressable,
        bordered && styles.rowBordered,
        pressed && onPress && styles.pressed,
      ]}
    >
      <View style={styles.row}>{children}</View>
    </ScaledPressable>
  );
}

function LogSetRow(props: LogSetRowProps) {
  const {
    weight,
    reps,
    unit = 'kg',
    showActions = false,
    showBottomBorder = true,
    onEdit,
    onDelete,
    onPress,
  } = props;
  const warmUp = props.warmUp === true;
  const weightLabel = `${formatDisplayWeight(weight)} ${unit}`;
  const repsLabel = `${reps} reps`;
  const prefixLabel = warmUp ? 'W' : formatSetIndex(props.setIndex);

  const content = (
    <>
      <View style={styles.setContent}>
        <Text style={logSetTextStyles.setPrefix}>{prefixLabel}</Text>
        <Text style={logSetTextStyles.weight}>{weightLabel}</Text>
        <Text style={logSetTextStyles.reps}>{repsLabel}</Text>
      </View>
      {showActions ? (
        <View style={styles.actions}>
          <IconLink accessibilityLabel="edit set" onPress={onEdit}>
            <PencilIcon />
          </IconLink>
          <IconLink accessibilityLabel="cancel set" onPress={onDelete}>
            <CloseIcon />
          </IconLink>
        </View>
      ) : null}
    </>
  );

  // Figma Work Out: actions only — row itself is not a hit target
  if (showActions && !onPress) {
    return (
      <View
        style={[styles.row, showBottomBorder && styles.rowBordered]}
      >
        {content}
      </View>
    );
  }

  return (
    <RowPressable bordered={showBottomBorder} onPress={onPress}>
      {content}
    </RowPressable>
  );
}

function LogExerciseRow({
  title,
  stat,
  showStat = false,
  onPress,
}: LogExerciseRowProps) {
  return (
    <RowPressable onPress={onPress}>
      <Text style={styles.primaryLabel} numberOfLines={1}>
        {title}
      </Text>
      {showStat && stat ? (
        <View style={styles.statGroup}>
          <Text
            style={[
              styles.statValue,
              stat.direction === 'down' && styles.statDown,
              stat.direction === 'flat' && styles.statFlat,
            ]}
          >
            {stat.label}
          </Text>
          {stat.direction === 'up' ? (
            <ArrowPathUpIcon color={colors['content-1']} />
          ) : null}
          {stat.direction === 'down' ? (
            <ArrowPathDownIcon color={colors['content-3']} />
          ) : null}
        </View>
      ) : null}
    </RowPressable>
  );
}

function LogSessionRow({
  dateLabel,
  totalLabel,
  isBestRecord = false,
  showBottomBorder = true,
  stat,
  showStat = false,
  onPress,
}: LogSessionRowProps) {
  return (
    <RowPressable bordered={showBottomBorder} onPress={onPress}>
      <View style={styles.sessionColumn}>
        <Text style={styles.sessionDate} numberOfLines={1}>
          {dateLabel}
        </Text>
      </View>
      <View style={[styles.sessionColumn, styles.sessionAlignEnd]}>
        <Text
          style={[
            styles.sessionTotal,
            isBestRecord && styles.sessionTotalBest,
          ]}
          numberOfLines={1}
        >
          {totalLabel}
        </Text>
        {isBestRecord ? <CrownIcon color={colors['content-1']} /> : null}
      </View>
      {showStat && stat ? (
        <View style={[styles.sessionColumn, styles.sessionAlignEnd]}>
          <Text
            style={[
              styles.statValue,
              stat.direction === 'flat' && styles.statFlatFill,
              stat.direction === 'down' && styles.statDown,
              stat.direction === 'flat' && styles.statFlat,
            ]}
            numberOfLines={1}
          >
            {stat.label}
          </Text>
          {stat.direction === 'up' ? (
            <ArrowPathUpIcon color={colors['content-1']} />
          ) : null}
          {stat.direction === 'down' ? (
            <ArrowPathDownIcon color={colors['content-3']} />
          ) : null}
        </View>
      ) : null}
    </RowPressable>
  );
}

const styles = StyleSheet.create({
  rowPressable: {
    alignSelf: 'stretch',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: spacing['s-12'],
    backgroundColor: colors['bg-1'],
    gap: spacing['s-5'],
  },
  rowBordered: {
    borderBottomWidth: spacing['s-1'],
    borderBottomColor: colors['border-2'],
  },
  pressed: {
    // Interaction feedback — no Figma opacity variable
    opacity: 0.9,
  },
  space: {
    height: spacing['s-8'],
    backgroundColor: colors['bg-1'],
  },
  setContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['s-5'],
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['s-5'],
  },
  primaryLabel: {
    ...typography.para1,
    flex: 1,
    color: colors['content-1'],
    ...textCase.lower,
  },
  /**
   * Figma log columns — three equal `flex-[1_0_0]` slots.
   * `width: 0` forces Yoga to ignore content intrinsic width so slots stay equal.
   */
  sessionColumn: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    width: 0,
    minWidth: 0,
  },
  sessionAlignEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing['s-4'],
  },
  sessionDate: {
    ...typography.para1,
    color: colors['content-1'],
    ...textCase.none,
  },
  sessionTotal: {
    ...typography.para2,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    color: colors['content-3'],
    textAlign: 'right',
  },
  sessionTotalBest: {
    color: colors['content-1'],
  },
  statGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['s-4'],
  },
  statValue: {
    ...typography.para1,
    color: colors['content-1'],
  },
  /** Figma flat dash — text itself fills the third column, right-aligned. */
  statFlatFill: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    textAlign: 'right',
  },
  statDown: {
    color: colors['content-3'],
  },
  statFlat: {
    ...typography.para2,
    color: colors['content-3'],
  },
});
