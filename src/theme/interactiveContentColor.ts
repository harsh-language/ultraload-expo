import { colors } from './tokens';

/** How content tint shifts while pressed. */
export type PressContentShift = 'dim' | 'brighten';

/**
 * Resting/pressed content tint.
 * - `dim`: content-1 → content-2 (SecondaryButton, IconButton, IconLink)
 * - `brighten`: content-2 → content-1 (OptionsMenuDropdown items)
 */
export function interactiveContentColor(
  pressed: boolean,
  shift: PressContentShift,
): string {
  switch (shift) {
    case 'dim':
      return pressed ? colors['content-2'] : colors['content-1'];
    case 'brighten':
      return pressed ? colors['content-1'] : colors['content-2'];
    default: {
      const _exhaustive: never = shift;
      return _exhaustive;
    }
  }
}
