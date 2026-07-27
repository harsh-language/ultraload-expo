import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Light tick for discrete commits (slider step, reorder drop, sheet settle). */
export function commitHaptic(): void {
  if (Platform.OS === 'web') {
    return;
  }
  void Haptics.selectionAsync().catch(() => {
    // Haptics unavailable on simulator / unsupported hardware — ignore.
  });
}
