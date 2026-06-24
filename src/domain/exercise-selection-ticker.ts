import type { EdgeInsets } from 'react-native-safe-area-context';
import { spacing } from '../theme/tokens';

/** Left offset for pill text to align with primary CTA label text. */
export function getExerciseSelectionTickerLeft(hasBackButton: boolean): number {
  const left =
    spacing['s-8'] + spacing['s-8'] - spacing['s-5'];

  if (hasBackButton) {
    return left + spacing['s-12'] + spacing['s-8'];
  }

  return left;
}

/** Bottom offset — anchors pill top edge above the footer button row + safe area. */
export function getExerciseSelectionTickerBottom(insets: EdgeInsets): number {
  return spacing['s-12'] + Math.max(insets.bottom, spacing['s-8']) + spacing['s-5'];
}

export function formatExerciseSelectionLabel(count: number): string {
  return `${count} selected`;
}
