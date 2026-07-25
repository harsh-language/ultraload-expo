import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';
import { CloseIcon } from './icons/CloseIcon';
import { DragIcon } from './icons/DragIcon';
import { IconLink } from './icons/IconLink';

interface InputTagProps {
  label: string;
  onRemove: () => void;
  removeDisabled?: boolean;
  /** Wrap the drag hit target (e.g. GestureDetector). */
  renderDragHandle?: (handle: ReactNode) => ReactNode;
}

export function InputTag({
  label,
  onRemove,
  removeDisabled = false,
  renderDragHandle,
}: InputTagProps) {
  const dragHandle = (
    <View
      accessibilityLabel={`reorder ${label}`}
      style={styles.hitSquare}
    >
      <DragIcon color={colors['content-1']} />
    </View>
  );

  return (
    <View style={styles.pill}>
      {renderDragHandle ? renderDragHandle(dragHandle) : dragHandle}
      <View style={styles.labelSlot}>
        <Text numberOfLines={1} style={styles.label}>
          {label}
        </Text>
      </View>
      <IconLink
        accessibilityLabel={`remove ${label}`}
        muted={removeDisabled}
        onPress={removeDisabled ? undefined : onRemove}
        size="square"
      >
        <CloseIcon />
      </IconLink>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: spacing['s-12'],
    borderRadius: radii['r-pill'],
    borderWidth: spacing['s-1'],
    borderColor: colors['border-2'],
    backgroundColor: colors['bg-2'],
    overflow: 'hidden',
  },
  hitSquare: {
    width: spacing['s-12'],
    height: spacing['s-12'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelSlot: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  label: {
    ...typography.para1,
    ...textCase.lower,
  },
});
