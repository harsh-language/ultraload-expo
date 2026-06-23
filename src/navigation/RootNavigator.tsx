import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MainNavigation } from '../components/MainNavigation';
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

export function RootNavigator() {
  const [selectedTab, setSelectedTab] = useState<MainTabKey>('workout');

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
