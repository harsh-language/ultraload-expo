import type { FC } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutRectangle,
} from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';
import { shadowBelow } from '../theme/shadow';
import {
  ArrowsRepeatCircleIcon,
  CalendarDaysIcon,
  SettingsGearIcon,
  type AppIconProps,
} from './icons';

export type OptionsMenuKey = 'history' | 'settings' | 'reset';

interface OptionsMenuDropdownProps {
  visible: boolean;
  anchorLayout: LayoutRectangle | null;
  onClose: () => void;
  onSelect: (key: OptionsMenuKey) => void;
}

const MENU_ITEMS: {
  key: OptionsMenuKey;
  label: string;
  icon: FC<AppIconProps>;
}[] = [
  { key: 'history', label: 'history', icon: CalendarDaysIcon },
  { key: 'settings', label: 'settings', icon: SettingsGearIcon },
  { key: 'reset', label: 'reset', icon: ArrowsRepeatCircleIcon },
];

export function OptionsMenuDropdown({
  visible,
  anchorLayout,
  onClose,
  onSelect,
}: OptionsMenuDropdownProps) {
  if (!visible || anchorLayout == null) {
    return null;
  }

  const menuTop = anchorLayout.y + anchorLayout.height + spacing['s-4'];
  const menuRight = spacing['s-8'];
  const menuWidth = spacing['s-17'];

  return (
    <Modal animationType="fade" transparent visible onRequestClose={onClose}>
      <Pressable accessibilityLabel="Close menu" onPress={onClose} style={styles.backdrop}>
        <View
          pointerEvents="box-none"
          style={[
            styles.menu,
            {
              top: menuTop,
              right: menuRight,
              width: menuWidth,
            },
          ]}
        >
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <Pressable
                key={item.key}
                accessibilityRole="button"
                onPress={() => {
                  onSelect(item.key);
                  onClose();
                }}
                style={({ pressed }) => [
                  styles.item,
                  pressed && styles.itemPressed,
                ]}
              >
                <Icon color={colors['content-2']} />
                <Text style={styles.itemLabel}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    backgroundColor: colors['bg-2'],
    borderWidth: spacing['s-1'],
    borderColor: colors['border-2'],
    borderRadius: radii['r-h-60'],
    padding: spacing['s-4'],
    gap: spacing['s-4'],
    ...shadowBelow,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    height: spacing['s-11'],
    gap: spacing['s-5'],
    paddingHorizontal: spacing['s-7'],
    borderRadius: radii['r-pill'],
    backgroundColor: colors['bg-2'],
  },
  itemPressed: {
    opacity: 0.85,
    backgroundColor: colors['bg-trans-1'],
  },
  itemLabel: {
    ...typography.para2,
    ...textCase.lower,
    color: colors['content-2'],
  },
});
