import type { FC } from 'react';
import type { CentralIconBaseProps } from 'central-icons/CentralIconBase';
import { ICON_DEFAULT_COLOR, ICON_SIZE } from './config';

export type AppIconProps = Omit<CentralIconBaseProps, 'size'> & {
  color?: string;
};

export function createIcon(
  IconComponent: FC<CentralIconBaseProps>,
): FC<AppIconProps> {
  function AppIcon({ color = ICON_DEFAULT_COLOR, ...props }: AppIconProps) {
    return <IconComponent size={ICON_SIZE} color={color} {...props} />;
  }

  AppIcon.displayName = IconComponent.displayName ?? IconComponent.name;

  return AppIcon;
}
