import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  useBottomSheetTimingConfigs,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { forwardRef, useCallback, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PANEL_TRANSITION_MS } from '../theme/motion';
import { colors, spacing } from '../theme/tokens';
import { shadowAbove } from '../theme/shadow';
import { sheetGradientColors } from '../theme/sheetGradient';
import { resolveColorToken } from '../theme/resolveColorToken';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';

interface AppBottomSheetProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /**
   * Vertical gap between title, body, and footer.
   * Default `s-11` (add/edit). Delete sheet uses `s-8` per Figma.
   */
  sectionGap?: number;
  onDismiss?: () => void;
  onVisibilityChange?: (visible: boolean) => void;
}

function SheetHeader({ title }: { title: string }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

export const AppBottomSheet = forwardRef<BottomSheetModal, AppBottomSheetProps>(
  function AppBottomSheet(
    {
      title,
      children,
      footer,
      sectionGap = spacing['s-11'],
      onDismiss,
      onVisibilityChange,
    },
    ref,
  ) {
    const insets = useSafeAreaInsets();
    const bottomInset = Math.max(insets.bottom, spacing['s-8']);
    const animationConfigs = useBottomSheetTimingConfigs({
      duration: PANEL_TRANSITION_MS,
    });

    const handleChange = useCallback(
      (index: number) => {
        onVisibilityChange?.(index >= 0);
      },
      [onVisibilityChange],
    );

    const handleDismiss = useCallback(() => {
      onDismiss?.();
    }, [onDismiss]);

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
        animationConfigs={animationConfigs}
        enableDynamicSizing
        enableContentPanningGesture
        enablePanDownToClose
        bottomInset={bottomInset}
        handleComponent={null}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        onChange={handleChange}
        onDismiss={handleDismiss}
      >
        <BottomSheetView style={styles.content}>
          <View style={styles.sheetFill} pointerEvents="none">
            <View style={styles.sheetBase} />
            <LinearGradient
              colors={[...sheetGradientColors]}
              end={{ x: 0.5, y: 1 }}
              start={{ x: 0.5, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </View>
          <View style={[styles.inner, { gap: sectionGap }]}>
            <SheetHeader title={title} />
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
    paddingBottom: spacing['s-8'],
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['s-5'],
    // Figma title row — s-10 (36); was s-11 and inflated section spacing
    height: spacing['s-10'],
  },
  title: {
    ...typography.brand3,
    flex: 1,
    ...textCase.lower,
  },
  body: {
    gap: spacing['s-5'],
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['s-8'],
    backgroundColor: colors['bg-1'],
    ...shadowAbove,
  },
});
