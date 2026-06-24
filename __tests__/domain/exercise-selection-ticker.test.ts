import {
  formatExerciseSelectionLabel,
  getExerciseSelectionTickerBottom,
  getExerciseSelectionTickerLeft,
} from '../../src/domain/exercise-selection-ticker';
import { spacing } from '../../src/theme/tokens';

describe('exercise selection ticker', () => {
  it('aligns pill with CTA label when back button is present', () => {
    expect(getExerciseSelectionTickerLeft(true)).toBe(
      spacing['s-8'] + spacing['s-12'] + spacing['s-8'] + spacing['s-8'] - spacing['s-5'],
    );
    expect(getExerciseSelectionTickerLeft(true)).toBe(120);
  });

  it('omits back button width and gap when back button is absent', () => {
    expect(getExerciseSelectionTickerLeft(false)).toBe(
      spacing['s-8'] + spacing['s-8'] - spacing['s-5'],
    );
  });

  it('formats the selection label in lowercase copy', () => {
    expect(formatExerciseSelectionLabel(8)).toBe('8 selected');
    expect(formatExerciseSelectionLabel(1)).toBe('1 selected');
  });

  it('anchors pill above footer button row including safe area', () => {
    const zeroInsets = { top: 0, right: 0, bottom: 0, left: 0 };
    expect(getExerciseSelectionTickerBottom(zeroInsets)).toBe(
      spacing['s-12'] + spacing['s-8'],
    );
    expect(getExerciseSelectionTickerBottom({ ...zeroInsets, bottom: 34 })).toBe(
      spacing['s-12'] + 34,
    );
  });
});
