import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { LayoutRectangle, View } from 'react-native';
import { getDatabase } from '../db/client';
import {
  clearTodayDemoDate,
  isDemoDataEnabled,
  setDemoDataEnabled,
} from '../db/devPrefs';
import { clearDemoWorkouts, seedDemoData } from '../db/devSeed';
import { resetAllUserData } from '../db/repositories';
import type { MainStackParamList } from '../navigation/types';
import { hydrateStores } from '../stores';
import { useDevAppResetStore } from '../stores/devAppResetSlice';
import {
  OptionsMenuDropdown,
  type OptionsMenuKey,
} from './OptionsMenuDropdown';

type MainNavigation = NativeStackNavigationProp<MainStackParamList, 'WorkOut'>;

export function useHomepageOptionsMenu() {
  const navigation = useNavigation<MainNavigation>();
  const menuButtonRef = useRef<View>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<LayoutRectangle | null>(null);
  const [demoDataEnabled, setDemoDataEnabledState] = useState(true);

  useEffect(() => {
    setDemoDataEnabledState(isDemoDataEnabled());
  }, []);

  const openMenuFromAnchor = useCallback((layout: LayoutRectangle) => {
    setMenuAnchor(layout);
    setMenuVisible(true);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuVisible(false);
  }, []);

  const handleSelect = useCallback(
    async (key: OptionsMenuKey) => {
      if (key === 'demoData') {
        if (!__DEV__) {
          return;
        }

        const db = getDatabase();
        const next = !isDemoDataEnabled();
        setDemoDataEnabled(next);
        setDemoDataEnabledState(next);

        if (next) {
          await seedDemoData(db);
        } else {
          await clearDemoWorkouts(db);
        }

        await hydrateStores(db);
        return;
      }

      closeMenu();

      if (key === 'reset') {
        if (!__DEV__) {
          return;
        }

        const db = getDatabase();
        await resetAllUserData(db);
        // Allow rolling today to re-inject after a full wipe.
        clearTodayDemoDate();
        await seedDemoData(db);
        await hydrateStores(db);
        useDevAppResetStore.getState().trigger();
        return;
      }

      if (key === 'settings') {
        navigation.navigate('Settings');
        return;
      }

      if (key === 'history') {
        navigation.navigate('HistoryList');
        return;
      }

      const _exhaustive: never = key;
      return _exhaustive;
    },
    [closeMenu, navigation],
  );

  const handleMenuPress = useCallback(() => {
    if (menuVisible) {
      closeMenu();
      return;
    }

    menuButtonRef.current?.measureInWindow((x, y, width, height) => {
      openMenuFromAnchor({ x, y, width, height });
    });
  }, [closeMenu, menuVisible, openMenuFromAnchor]);

  const menu = (
    <OptionsMenuDropdown
      anchorLayout={menuAnchor}
      demoDataEnabled={demoDataEnabled}
      onClose={closeMenu}
      onSelect={handleSelect}
      visible={menuVisible}
    />
  );

  return { menuButtonRef, handleMenuPress, menu, menuVisible };
}
