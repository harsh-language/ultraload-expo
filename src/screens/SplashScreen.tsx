import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SectionDivider } from '../components/SectionDivider';
import { colors, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';

const SPLASH_DURATION_MS = 1400;

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const timer = setTimeout(onComplete, SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <View
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      <View style={styles.centre}>
        <Text style={styles.wordmark}>ultraload</Text>
      </View>

      <View style={styles.footer}>
        <SectionDivider label="from the basement" />
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    height: spacing['s-12'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    ...typography.brand1,
    ...textCase.upper,
  },
});
