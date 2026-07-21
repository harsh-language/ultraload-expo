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
import { SecondaryButton } from './SecondaryButton';

export interface RemovableExercise {
  id: string;
  name: string;
}

export interface RemoveExerciseSheetHandle {
  present: (exercise: RemovableExercise) => void;
  dismiss: () => void;
}

interface RemoveExerciseSheetProps {
  onConfirm: (exerciseId: string) => void;
  onVisibilityChange?: (visible: boolean) => void;
}

/** FL8 — hide from workout/History; past sets kept. */
const CONSEQUENCE_COPY =
  'this exercise will be hidden from your workout and history until you add it back. your past sets are kept.';

export const RemoveExerciseSheet = forwardRef<
  RemoveExerciseSheetHandle,
  RemoveExerciseSheetProps
>(function RemoveExerciseSheet({ onConfirm, onVisibilityChange }, ref) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const shouldPresentRef = useRef(false);
  const [pending, setPending] = useState<RemovableExercise | null>(null);

  useImperativeHandle(ref, () => ({
    present: (exercise: RemovableExercise) => {
      shouldPresentRef.current = true;
      setPending(exercise);
    },
    dismiss: () => {
      sheetRef.current?.dismiss();
    },
  }));

  useEffect(() => {
    if (!shouldPresentRef.current || pending == null) {
      return;
    }

    shouldPresentRef.current = false;
    sheetRef.current?.present();
  }, [pending]);

  const handleDismiss = useCallback(() => {
    setPending(null);
  }, []);

  const handleConfirm = useCallback(() => {
    if (pending == null) {
      return;
    }

    onConfirm(pending.id);
    sheetRef.current?.dismiss();
  }, [onConfirm, pending]);

  const handleCancel = useCallback(() => {
    sheetRef.current?.dismiss();
  }, []);

  return (
    <AppBottomSheet
      ref={sheetRef}
      footer={
        <View style={styles.footerRow}>
          <SecondaryButton
            label="cancel"
            onPress={handleCancel}
            style={styles.footerButton}
          />
          <PrimaryButton
            label="remove exercise"
            leadingIcon="close"
            onPress={handleConfirm}
            style={styles.footerButton}
            trailingIcon="none"
          />
        </View>
      }
      onDismiss={handleDismiss}
      onVisibilityChange={onVisibilityChange}
      sectionGap={spacing['s-8']}
      title="remove exercise"
    >
      {pending == null ? null : (
        <View style={styles.body}>
          <View style={styles.previewRow}>
            <Text style={styles.previewName}>{pending.name}</Text>
          </View>
          <Text style={styles.consequence}>{CONSEQUENCE_COPY}</Text>
        </View>
      )}
    </AppBottomSheet>
  );
});

const styles = StyleSheet.create({
  body: {
    gap: spacing['s-8'],
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: spacing['s-13'],
    borderTopWidth: spacing['s-1'],
    borderBottomWidth: spacing['s-1'],
    borderColor: colors['border-2'],
    paddingVertical: spacing['s-5'],
  },
  previewName: {
    ...typography.para1,
    ...textCase.lower,
  },
  consequence: {
    ...typography.para2,
    color: colors['content-2'],
    ...textCase.lower,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing['s-5'],
    flex: 1,
  },
  footerButton: {
    flex: 1,
  },
});
