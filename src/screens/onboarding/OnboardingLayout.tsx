import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton } from '../../components/IconButton';
import { OnboardingProgress } from '../../components/OnboardingProgress';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BackIcon } from '../../components/icons/BackIcon';
import { colors, spacing } from '../../theme/tokens';
import { typography } from '../../theme/typography';
import { textCase } from '../../theme/textCase';

type TrailingIcon = 'arrow' | 'check';

interface OnboardingLayoutProps {
  step: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  actionLabel: string;
  onAction: () => void;
  actionDisabled?: boolean;
  onBack?: () => void;
  trailingIcon?: TrailingIcon;
  scrollable?: boolean;
  footerAccessory?: ReactNode;
}

/** Overlay footer height — button row + bottom safe-area padding. */
export function getOnboardingFooterHeight(insets: EdgeInsets): number {
  return spacing['s-12'] + Math.max(insets.bottom, spacing['s-8']);
}

/** Scroll content inset — clears the overlay footer zone at end of scroll. */
export function getOnboardingScrollBottomInset(insets: EdgeInsets): number {
  return getOnboardingFooterHeight(insets) + spacing['s-8'];
}

export function OnboardingLayout({
  step,
  title,
  subtitle,
  children,
  actionLabel,
  onAction,
  actionDisabled = false,
  onBack,
  trailingIcon = 'arrow',
  scrollable = false,
  footerAccessory,
}: OnboardingLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.centre,
          scrollable && styles.centreScrollable,
          { paddingTop: insets.top + spacing['s-8'] },
        ]}
      >
        {!scrollable ? (
          <>
            <OnboardingProgress step={step} />

            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
          </>
        ) : null}

        <View style={[styles.body, scrollable && styles.bodyScrollable]}>
          {children}
        </View>
      </View>

      <View
        style={[
          styles.footer,
          scrollable ? styles.footerOverlay : styles.footerStacked,
          { paddingBottom: Math.max(insets.bottom, spacing['s-8']) },
        ]}
      >
        {onBack ? (
          <IconButton accessibilityLabel="back" onPress={onBack}>
            <BackIcon />
          </IconButton>
        ) : null}
        <PrimaryButton
          disabled={actionDisabled}
          label={actionLabel}
          onPress={onAction}
          style={onBack ? styles.footerPrimary : styles.fullWidthPrimary}
          trailingIcon={trailingIcon}
        />
        {footerAccessory}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors['bg-1'],
  },
  centre: {
    flex: 1,
    paddingHorizontal: spacing['s-8'],
    paddingBottom: spacing['s-8'],
    gap: spacing['s-8'],
  },
  centreScrollable: {
    paddingBottom: 0,
  },
  header: {
    gap: spacing['s-5'],
  },
  title: {
    ...typography.brand1,
    ...textCase.upper,
  },
  subtitle: {
    ...typography.para4,
    ...textCase.lower,
  },
  body: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
  },
  bodyScrollable: {
    justifyContent: 'flex-start',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['s-8'],
    paddingHorizontal: spacing['s-8'],
    overflow: 'visible',
  },
  footerStacked: {
    paddingTop: spacing['s-8'],
  },
  footerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  footerPrimary: {
    flex: 1,
  },
  fullWidthPrimary: {
    alignSelf: 'stretch',
  },
});
