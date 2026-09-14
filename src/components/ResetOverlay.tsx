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

export interface ResetOverlayHandle {
  present: () => void;
  dismiss: () => void;
}

interface ResetOverlayProps {
  onConfirm: () => void;
  busy?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
}

/** SCR17 — confirm full wipe + onboarding replay. */
export const ResetOverlay = forwardRef<ResetOverlayHandle, ResetOverlayProps>(
  function ResetOverlay({ onConfirm, busy = false, onVisibilityChange }, ref) {
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
            label="reset profile"
            leadingIcon="close"
            onPress={handleConfirm}
            style={styles.confirmButton}
            trailingIcon="none"
          />
        }
        onVisibilityChange={onVisibilityChange}
        sectionGap={spacing['s-8']}
        title="reset profile"
      >
        <View style={styles.body}>
          <Text style={styles.copy}>
            wipe everything and replay onboarding. this cannot be undone.
          </Text>
        </View>
      </AppBottomSheet>
    );
  },
);

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
