import { StyleSheet } from 'react-native';
import { spacing } from '../theme/tokens';

/**
 * Button label/icon alignment — derived from which icon slots are filled.
 *
 * - Leading icon only → centre icon + label as a group
 * - Trailing icon only → label left, icon right (onboarding CTAs)
 * - Both icons → leading icon + label left, trailing icon right
 * - No icons → centred label
 */
export type ButtonContentLayout = 'centered' | 'trailingEdge' | 'splitEdges';

export function getButtonContentLayout(
  hasLeading: boolean,
  hasTrailing: boolean,
): ButtonContentLayout {
  if (hasLeading && hasTrailing) {
    return 'splitEdges';
  }
  if (hasTrailing) {
    return 'trailingEdge';
  }
  return 'centered';
}

export const buttonContentStyles = StyleSheet.create({
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['s-5'],
  },
  contentCentered: {
    justifyContent: 'center',
  },
  contentTrailingEdge: {
    justifyContent: 'space-between',
  },
  contentSplitEdges: {
    justifyContent: 'space-between',
  },
  leftCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['s-5'],
    flexShrink: 1,
    minWidth: 0,
  },
  labelGrow: {
    flex: 1,
    minWidth: 0,
  },
  labelCentered: {
    minWidth: 0,
  },
});

export function contentLayoutStyle(
  layout: ButtonContentLayout,
): (typeof buttonContentStyles)[keyof typeof buttonContentStyles] {
  switch (layout) {
    case 'centered':
      return buttonContentStyles.contentCentered;
    case 'trailingEdge':
      return buttonContentStyles.contentTrailingEdge;
    case 'splitEdges':
      return buttonContentStyles.contentSplitEdges;
    default: {
      const _exhaustive: never = layout;
      return _exhaustive;
    }
  }
}
