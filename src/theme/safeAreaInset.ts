import { spacing } from './tokens';

/** Floor for system safe-area insets so chrome never sits tighter than s-5. */
export function clampSafeInset(value: number): number {
  return Math.max(value, spacing['s-5']);
}
