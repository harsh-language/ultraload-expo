import type { FC } from 'react';
import type { LayoutRectangle } from 'react-native';
import { spacing } from '../theme/tokens';
import {
  AnchoredMenu,
  type AnchoredMenuItem,
} from './AnchoredMenu';
import {
  ArrowsRepeatCircleIcon,
  CalendarDaysIcon,
  SettingsGearIcon,
  SettingsToggleIcon,
  type AppIconProps,
} from './icons';

export type OptionsMenuKey = 'history' | 'settings' | 'demoData' | 'reset';

interface OptionsMenuDropdownProps {
  visible: boolean;
  anchorLayout: LayoutRectangle | null;
  demoDataEnabled: boolean;
  onClose: () => void;
  onSelect: (key: OptionsMenuKey) => void;
}

function demoDataLabel(enabled: boolean): string {
  return enabled ? 'demo data : on' : 'demo data : off';
}

export function OptionsMenuDropdown({
  visible,
  anchorLayout,
  demoDataEnabled,
  onClose,
  onSelect,
}: OptionsMenuDropdownProps) {
  // Demo-data toggle + reset are DEV/simulator only — hidden in release (U7).
  const menuItems: {
    key: OptionsMenuKey;
    label: string;
    icon: FC<AppIconProps>;
  }[] = [
    { key: 'history', label: 'history', icon: CalendarDaysIcon },
    { key: 'settings', label: 'settings', icon: SettingsGearIcon },
    ...(__DEV__
      ? [
          {
            key: 'demoData' as const,
            label: demoDataLabel(demoDataEnabled),
            icon: SettingsToggleIcon,
          },
          {
            key: 'reset' as const,
            label: 'reset',
            icon: ArrowsRepeatCircleIcon,
          },
        ]
      : []),
  ];

  const items: AnchoredMenuItem[] = menuItems.map((item) => ({
    key: item.key,
    label: item.label,
    icon: item.icon,
    onSelect: () => {
      onSelect(item.key);
    },
  }));

  return (
    <AnchoredMenu
      align="page-right"
      anchorLayout={anchorLayout}
      closeLabel="Close menu"
      items={items}
      onClose={onClose}
      visible={visible}
      // Wider in DEV for "demo data : off"; release labels are shorter.
      width={spacing['s-17']}
    />
  );
}
