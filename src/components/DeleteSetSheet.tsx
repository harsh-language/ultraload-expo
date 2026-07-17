import { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatSetIndex } from '../domain/set-labels';
import { colors, spacing } from '../theme/tokens';
import { AppBottomSheet } from './AppBottomSheet';
import { PrimaryButton } from './PrimaryButton';
import { logSetTextStyles } from './logSetTextStyles';

export interface DeletableSet {
  id: number;
  weight: number;
  reps: number;
  warmUp: boolean;
  /** Standard-set display index; ignored when `warmUp` is true. */
  setIndex?: number;
}

export interface DeleteSetSheetHandle {
  present: (set: DeletableSet) => void;
  dismiss: () => void;
}

interface DeleteSetSheetProps {
  onConfirm: (setId: number) => void;
  onVisibilityChange?: (visible: boolean) => void;
}

function getDeleteSetTitle(set: DeletableSet | null): string {
  if (set == null) {
    return 'delete set';
  }

  if (set.warmUp) {
    return 'delete warmup set';
  }

  return `delete set ${formatSetIndex(set.setIndex ?? 1)}`;
}

/**
 * Delete-sheet-only preview of the selected set.
 * Exception to the list `LogRow`: taller (s-13), no fill, top + bottom borders
 * so the sheet gradient shows through.
 */
function DeleteSetPreview({ set }: { set: DeletableSet }) {
  const prefixLabel = set.warmUp
    ? 'W'
    : formatSetIndex(set.setIndex ?? 1);
  const weightLabel = `${set.weight} kg`;
  const repsLabel = `${set.reps} reps`;

  return (
    <View style={styles.previewRow}>
      <Text style={logSetTextStyles.setPrefix}>{prefixLabel}</Text>
      <Text style={logSetTextStyles.weight}>{weightLabel}</Text>
      <Text style={logSetTextStyles.reps}>{repsLabel}</Text>
    </View>
  );
}

export const DeleteSetSheet = forwardRef<
  DeleteSetSheetHandle,
  DeleteSetSheetProps
>(function DeleteSetSheet({ onConfirm, onVisibilityChange }, ref) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const shouldPresentRef = useRef(false);
  const [pendingSet, setPendingSet] = useState<DeletableSet | null>(null);

  useImperativeHandle(ref, () => ({
    present: (set: DeletableSet) => {
      shouldPresentRef.current = true;
      setPendingSet(set);
    },
    dismiss: () => {
      sheetRef.current?.dismiss();
    },
  }));

  useEffect(() => {
    if (!shouldPresentRef.current || pendingSet == null) {
      return;
    }

    shouldPresentRef.current = false;
    sheetRef.current?.present();
  }, [pendingSet]);

  const handleDismiss = useCallback(() => {
    setPendingSet(null);
  }, []);

  const handleConfirm = useCallback(() => {
    if (pendingSet == null) {
      return;
    }

    onConfirm(pendingSet.id);
    sheetRef.current?.dismiss();
  }, [onConfirm, pendingSet]);

  return (
    <AppBottomSheet
      ref={sheetRef}
      footer={
        <PrimaryButton
          label="delete set"
          leadingIcon="close"
          onPress={handleConfirm}
          style={styles.confirmButton}
          trailingIcon="none"
        />
      }
      onDismiss={handleDismiss}
      onVisibilityChange={onVisibilityChange}
      sectionGap={spacing['s-8']}
      title={getDeleteSetTitle(pendingSet)}
    >
      {pendingSet == null ? null : <DeleteSetPreview set={pendingSet} />}
    </AppBottomSheet>
  );
});

const styles = StyleSheet.create({
  // Figma delete preview — s-13 (90), transparent, border-2 top + bottom
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: spacing['s-13'],
    gap: spacing['s-5'],
    borderTopWidth: spacing['s-1'],
    borderBottomWidth: spacing['s-1'],
    borderColor: colors['border-2'],
  },
  confirmButton: {
    flex: 1,
  },
});
