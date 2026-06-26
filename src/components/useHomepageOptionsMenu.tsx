import { useCallback, useRef, useState } from 'react';
import type { LayoutRectangle, View } from 'react-native';
import { getDatabase } from '../db/client';
import { resetAllUserData } from '../db/repositories';
import { hydrateStores } from '../stores';
import { useDevAppResetStore } from '../stores/devAppResetSlice';
import {
  OptionsMenuDropdown,
  type OptionsMenuKey,
} from './OptionsMenuDropdown';

export function useHomepageOptionsMenu() {
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

  const handleSelect = useCallback(async (key: OptionsMenuKey) => {
    if (key === 'reset') {
      const db = getDatabase();
      await resetAllUserData(db);
      await hydrateStores(db);
      useDevAppResetStore.getState().trigger();
      return;
    }

    // U3/U4: navigate to History or Settings
  }, []);

  const handleMenuPress = useCallback(() => {
    menuButtonRef.current?.measureInWindow((x, y, width, height) => {
      openMenuFromAnchor({ x, y, width, height });
    });
  }, [openMenuFromAnchor]);

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
