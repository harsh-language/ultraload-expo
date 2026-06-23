import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import { MainNavigation, type MainTabKey } from '../components/MainNavigation';
import { PlaceholderTabs } from '../screens/PlaceholderTabs';
import { colors } from '../theme/tokens';

export type RootTabParamList = {
  WorkOut: undefined;
  History: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

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

const TAB_KEYS: MainTabKey[] = ['workout', 'history', 'settings'];
const ROUTE_NAMES: (keyof RootTabParamList)[] = ['WorkOut', 'History', 'Settings'];

function TabBar({
  state,
  navigation,
}: {
  state: { index: number };
  navigation: { navigate: (name: keyof RootTabParamList) => void };
}) {
  const selected = TAB_KEYS[state.index] ?? 'workout';

  return (
    <MainNavigation
      selected={selected}
      onSelect={(tab) => {
        const index = TAB_KEYS.indexOf(tab);
        const routeName = ROUTE_NAMES[index];
        if (routeName) {
          navigation.navigate(routeName);
        }
      }}
    />
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <View style={styles.root}>
        <Tab.Navigator
          initialRouteName="WorkOut"
          screenOptions={{
            headerShown: false,
            sceneStyle: styles.scene,
          }}
          tabBar={(props) => (
            <TabBar
              state={props.state}
              navigation={{
                navigate: (name) => props.navigation.navigate(name),
              }}
            />
          )}
        >
          <Tab.Screen name="WorkOut">
            {() => <PlaceholderTabs tab="workout" />}
          </Tab.Screen>
          <Tab.Screen name="History">
            {() => <PlaceholderTabs tab="history" />}
          </Tab.Screen>
          <Tab.Screen name="Settings">
            {() => <PlaceholderTabs tab="settings" />}
          </Tab.Screen>
        </Tab.Navigator>
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors['bg-1'],
  },
  scene: {
    backgroundColor: colors['bg-1'],
  },
});
