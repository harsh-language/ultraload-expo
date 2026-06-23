import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DatabaseProvider } from './src/db/DatabaseProvider';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme/tokens';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'Geist-Medium': require('./assets/fonts/Geist-Medium.ttf'),
    'Geist-SemiBold': require('./assets/fonts/Geist-SemiBold.ttf'),
    'Geist-ExtraBold': require('./assets/fonts/Geist-ExtraBold.ttf'),
  });

  if (fontError) {
    console.error('Font load error:', fontError);
  }

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors['content-1']} size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <DatabaseProvider>
          <BottomSheetModalProvider>
            <RootNavigator />
            <StatusBar style="light" />
          </BottomSheetModalProvider>
        </DatabaseProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors['bg-1'],
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors['bg-1'],
  },
});
