import type { FC } from 'react';
import type { CentralIconBaseProps } from 'central-icons/CentralIconBase';
import { ICON_DEFAULT_COLOR, ICON_SIZE } from './config';

export type AppIconProps = Omit<CentralIconBaseProps, 'size'> & {
  color?: string;
  /** Defaults to Figma layout/size/icon (20). Pass through for larger Figma instances. */
  size?: number;
};

export function createIcon(
  IconComponent: FC<CentralIconBaseProps>,
): FC<AppIconProps> {
  function AppIcon({
    color = ICON_DEFAULT_COLOR,
    size = ICON_SIZE,
    ...props
  }: AppIconProps) {
    return <IconComponent size={size} color={color} {...props} />;
  }

  AppIcon.displayName = IconComponent.displayName ?? IconComponent.name;

  return AppIcon;
}
