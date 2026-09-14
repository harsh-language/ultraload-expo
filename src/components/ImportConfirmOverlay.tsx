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

export interface ImportConfirmOverlayHandle {
  present: () => void;
  dismiss: () => void;
}

interface ImportConfirmOverlayProps {
  onConfirm: () => void;
  busy?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
}

/** FL10 — confirm full replace after a file validates. */
export const ImportConfirmOverlay = forwardRef<
  ImportConfirmOverlayHandle,
  ImportConfirmOverlayProps
>(function ImportConfirmOverlay(
  { onConfirm, busy = false, onVisibilityChange },
  ref,
) {
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
          label="replace all"
          leadingIcon="close"
          onPress={handleConfirm}
          style={styles.confirmButton}
          trailingIcon="none"
        />
      }
      onVisibilityChange={onVisibilityChange}
      sectionGap={spacing['s-8']}
      title="replace all data?"
    >
      <View style={styles.body}>
        <Text style={styles.copy}>
          this cannot be undone. your current profile, plan, and workouts will
          be replaced by the file.
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
