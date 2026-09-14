import { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';
import { AppBottomSheet } from './AppBottomSheet';
import { PrimaryButton } from './PrimaryButton';

export interface ExportOverlayHandle {
  present: () => void;
  dismiss: () => void;
}

interface ExportOverlayProps {
  onConfirm: () => void;
  busy?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
}

/** SCR16 — confirm before opening the system share sheet. */
export const ExportOverlay = forwardRef<
  ExportOverlayHandle,
  ExportOverlayProps
>(function ExportOverlay({ onConfirm, busy = false, onVisibilityChange }, ref) {
  const sheetRef = useRef<BottomSheetModal>(null);

  useImperativeHandle(ref, () => ({
    present: () => {
      sheetRef.current?.present();
    },
    dismiss: () => {
      sheetRef.current?.dismiss();
    },
  }));

  const handleConfirm = useCallback(() => {
    if (busy) {
      return;
    }
    onConfirm();
  }, [busy, onConfirm]);

  return (
    <AppBottomSheet
      ref={sheetRef}
      footer={
        <PrimaryButton
          disabled={busy}
          label="export"
          onPress={handleConfirm}
          style={styles.confirmButton}
          trailingIcon="arrow"
        />
      }
      onVisibilityChange={onVisibilityChange}
      sectionGap={spacing['s-8']}
      title="export data"
    >
      <View style={styles.body}>
        <Text style={styles.copy}>
          share a json copy of your profile, plan, and all workouts.
        </Text>
      </View>
    </AppBottomSheet>
  );
});

const styles = StyleSheet.create({
  body: {
    gap: spacing['s-5'],
  },
  copy: {
    ...typography.para4,
    color: colors['content-1'],
    ...textCase.lower,
  },
  confirmButton: {
    flex: 1,
  },
});
