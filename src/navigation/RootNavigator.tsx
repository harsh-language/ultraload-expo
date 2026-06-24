import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MainNavigation } from '../components/MainNavigation';
import { useProfileStore } from '../stores/profileSlice';
import { OnboardingFlow } from '../screens/onboarding/OnboardingFlow';
import { SplashScreen } from '../screens/SplashScreen';
import { colors } from '../theme/tokens';
import { MainTabPager } from './MainTabPager';
import type { MainTabKey } from './mainTabs';

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors['bg-1'],
    card: colors['bg-1'],
    border: colors['border-2'],
    text: colors['content-1'],
    primary: colors['bg-5'],
  },
};

type AppPhase = 'splash' | 'onboarding' | 'main';

export function RootNavigator() {
  const onboardingComplete = useProfileStore((state) => state.onboardingComplete);
  const hydrated = useProfileStore((state) => state.hydrated);
  const [phase, setPhase] = useState<AppPhase>('splash');
  const [selectedTab, setSelectedTab] = useState<MainTabKey>('workout');

  const handleSplashComplete = useCallback(() => {
    setPhase(onboardingComplete ? 'main' : 'onboarding');
  }, [onboardingComplete]);

  const handleOnboardingComplete = useCallback(() => {
    setPhase('main');
    setSelectedTab('workout');
  }, []);

  if (!hydrated) {
    return null;
  }

  if (phase === 'splash') {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (phase === 'onboarding') {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      <View style={styles.root}>
        <MainTabPager selected={selectedTab} />
        <MainNavigation selected={selectedTab} onSelect={setSelectedTab} />
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors['bg-1'],
  },
});
