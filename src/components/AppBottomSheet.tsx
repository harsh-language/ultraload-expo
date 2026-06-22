import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useMemo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';

interface AppBottomSheetProps {
  title: string;
  children: ReactNode;
  onDismiss?: () => void;
}

export const AppBottomSheet = forwardRef<BottomSheetModal, AppBottomSheetProps>(
  function AppBottomSheet({ title, children, onDismiss }, ref) {
    const snapPoints = useMemo(() => ['50%', '85%'], []);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.6}
        />
      ),
      [],
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handle}
        onDismiss={onDismiss}
      >
        <BottomSheetView style={styles.content}>
          <Text style={typography.titleL}>{title}</Text>
          <View style={styles.body}>{children}</View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors['bg-2'],
    borderTopLeftRadius: radii['r-h-36'],
    borderTopRightRadius: radii['r-h-36'],
  },
  handle: {
    backgroundColor: colors['content-4'],
    width: spacing['s-13'],
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing['s-7'],
    paddingBottom: spacing['s-10'],
    gap: spacing['s-7'],
  },
  body: {
    gap: spacing['s-7'],
  },
});
