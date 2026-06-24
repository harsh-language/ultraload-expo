import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  useBottomSheetModal,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { forwardRef, useCallback, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme/tokens';
import { resolveColorToken } from '../theme/resolveColorToken';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';
import { BackIcon, IconLink } from './icons';

interface AppBottomSheetProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onDismiss?: () => void;
  showHeaderBack?: boolean;
}

/** Figma color style `bg-gradient-bottom` — solid bg-1 + vertical bg-trans-1 → content-trans-light */
const SHEET_GRADIENT_COLORS = [
  colors['bg-trans-1'],
  colors['content-trans-light'],
] as const;

function SheetHeader({
  title,
  showBack,
}: {
  title: string;
  showBack: boolean;
}) {
  const { dismiss } = useBottomSheetModal();

  return (
    <View style={styles.header}>
      {showBack ? (
        <IconLink accessibilityLabel="back" onPress={() => dismiss()}>
          <BackIcon />
        </IconLink>
      ) : null}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

export const AppBottomSheet = forwardRef<BottomSheetModal, AppBottomSheetProps>(
  function AppBottomSheet(
    { title, children, footer, onDismiss, showHeaderBack = true },
    ref,
  ) {
    const insets = useSafeAreaInsets();
    const bottomInset = Math.max(insets.bottom, spacing['s-8']);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={resolveColorToken('bg-overlay').opacity}
        />
      ),
      [],
    );

    return (
      <BottomSheetModal
        ref={ref}
        enableDynamicSizing
        enableContentPanningGesture={false}
        enableHandlePanningGesture={false}
        enablePanDownToClose={false}
        bottomInset={bottomInset}
        handleComponent={null}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        onDismiss={onDismiss}
      >
        <BottomSheetView style={styles.content}>
          <View style={styles.sheetFill} pointerEvents="none">
            <View style={styles.sheetBase} />
            <LinearGradient
              colors={[...SHEET_GRADIENT_COLORS]}
              end={{ x: 0.5, y: 1 }}
              start={{ x: 0.5, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </View>
          <View style={styles.inner}>
            <SheetHeader showBack={showHeaderBack} title={title} />
            <View style={styles.body}>{children}</View>
            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: 'transparent',
  },
  content: {
    position: 'relative',
    overflow: 'hidden',
    borderTopWidth: spacing['s-1'],
    borderTopColor: colors['border-2'],
  },
  sheetFill: {
    ...StyleSheet.absoluteFill,
  },
  sheetBase: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors['bg-1'],
  },
  inner: {
    paddingHorizontal: spacing['s-8'],
    paddingTop: spacing['s-8'],
    paddingBottom: spacing['s-11'],
    gap: spacing['s-8'],
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['s-8'],
    minHeight: spacing['s-11'],
  },
  title: {
    ...typography.brand3,
    flex: 1,
    ...textCase.lower,
  },
  body: {
    gap: spacing['s-8'],
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['s-8'],
  },
});
