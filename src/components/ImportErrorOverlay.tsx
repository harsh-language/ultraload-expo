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
import { colors, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';
import { AppBottomSheet } from './AppBottomSheet';
import { PrimaryButton } from './PrimaryButton';

export interface ImportErrorOverlayHandle {
  present: (message: string, title?: string) => void;
  dismiss: () => void;
}

interface ImportErrorOverlayProps {
  onVisibilityChange?: (visible: boolean) => void;
}

/** FL10 failure path — existing data stays untouched. Also used for share errors. */
export const ImportErrorOverlay = forwardRef<
  ImportErrorOverlayHandle,
  ImportErrorOverlayProps
>(function ImportErrorOverlay({ onVisibilityChange }, ref) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const shouldPresentRef = useRef(false);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('import failed');

  useImperativeHandle(ref, () => ({
    present: (nextMessage: string, nextTitle = 'import failed') => {
      shouldPresentRef.current = true;
      setTitle(nextTitle);
      setMessage(nextMessage);
    },
    dismiss: () => {
      sheetRef.current?.dismiss();
    },
  }));

  useEffect(() => {
    if (!shouldPresentRef.current || message.length === 0) {
      return;
    }
    shouldPresentRef.current = false;
    sheetRef.current?.present();
  }, [message, title]);

  const handleDismiss = useCallback(() => {
    setMessage('');
    setTitle('import failed');
  }, []);

  const handleClose = useCallback(() => {
    sheetRef.current?.dismiss();
  }, []);

  return (
    <AppBottomSheet
      ref={sheetRef}
      footer={
        <PrimaryButton
          label="ok"
          onPress={handleClose}
          style={styles.confirmButton}
          trailingIcon="none"
        />
      }
      onDismiss={handleDismiss}
      onVisibilityChange={onVisibilityChange}
      sectionGap={spacing['s-8']}
      title={title}
    >
      <View style={styles.body}>
        <Text style={styles.copy}>
          {message.length > 0
            ? message
            : 'could not import this file. your data was not changed.'}
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
