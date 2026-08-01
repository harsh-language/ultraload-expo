import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useProfileStore } from '../stores/profileSlice';
import { useDevAppResetStore } from '../stores/devAppResetSlice';
import { OnboardingFlow } from '../screens/onboarding/OnboardingFlow';
import { SplashScreen } from '../screens/SplashScreen';
import { WorkOutScreen } from '../screens/WorkOutScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AddExercisesScreen } from '../screens/AddExercisesScreen';
import { HistoryListScreen } from '../screens/HistoryListScreen';
import { SessionDetailScreen } from '../screens/SessionDetailScreen';
import { colors } from '../theme/tokens';
import type { MainStackParamList } from './types';

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

const MainStack = createNativeStackNavigator<MainStackParamList>();

function MainStackNavigator() {
  return (
    <MainStack.Navigator
      initialRouteName="WorkOut"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors['bg-1'] },
        animation: 'slide_from_right',
      }}
    >
      <MainStack.Screen component={WorkOutScreen} name="WorkOut" />
      <MainStack.Screen component={SettingsScreen} name="Settings" />
      <MainStack.Screen component={AddExercisesScreen} name="AddExercises" />
      <MainStack.Screen component={HistoryListScreen} name="HistoryList" />
      <MainStack.Screen component={SessionDetailScreen} name="SessionDetail" />
    </MainStack.Navigator>
  );
}

export function RootNavigator() {
  const onboardingComplete = useProfileStore((state) => state.onboardingComplete);
  const hydrated = useProfileStore((state) => state.hydrated);
  const resetGeneration = useDevAppResetStore((state) => state.generation);
  const [phase, setPhase] = useState<AppPhase>('splash');

  useEffect(() => {
    if (resetGeneration === 0) {
      return;
    }

    setPhase('splash');
  }, [resetGeneration]);

  const handleSplashComplete = useCallback(() => {
    setPhase(onboardingComplete ? 'main' : 'onboarding');
  }, [onboardingComplete]);

  const handleOnboardingComplete = useCallback(() => {
    setPhase('main');
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
        <MainStackNavigator />
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
