import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useRef, useState } from 'react';
import type { LayoutRectangle, View } from 'react-native';
import { getDatabase } from '../db/client';
import { seedDevBaselineSets } from '../db/devSeed';
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

  const openMenuFromAnchor = useCallback((layout: LayoutRectangle) => {
    setMenuAnchor(layout);
    setMenuVisible(true);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuVisible(false);
  }, []);

  const handleSelect = useCallback(
    async (key: OptionsMenuKey) => {
      closeMenu();

      if (key === 'reset') {
        const db = getDatabase();
        await resetAllUserData(db);
        await seedDevBaselineSets(db);
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
      onClose={closeMenu}
      onSelect={handleSelect}
      visible={menuVisible}
    />
  );

  return { menuButtonRef, handleMenuPress, menu, menuVisible };
}
