import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';
import { interactiveContentColor } from '../../theme/interactiveContentColor';
import type { AppIconProps } from './createIcon';

/** Interactive icon tint — dims content-1 → content-2 when pressed/active. */
export function pressedIconColor(active: boolean): string {
  return interactiveContentColor(active, 'dim');
}

/** Clone a single app icon child with an injected `color` prop. */
export function cloneIconWithColor(
  children: ReactNode,
  color: string,
): ReactNode {
  if (isValidElement<AppIconProps>(children)) {
    return cloneElement(children as ReactElement<AppIconProps>, { color });
  }

  return children;
}
