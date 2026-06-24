import { spacing } from '../../src/theme/tokens';
import { exercisePickerSpacing } from '../../src/screens/onboarding/ExercisePicker';

describe('ExercisePicker spacing', () => {
  it('uses s-8 for scroll column and list stack spacing', () => {
    expect(exercisePickerSpacing.contentGap).toBe(spacing['s-8']);
    expect(exercisePickerSpacing.listStackGap).toBe(spacing['s-8']);
    expect(exercisePickerSpacing.listStackPaddingVertical).toBe(spacing['s-8']);
  });

  it('uses s-5 between exercises within a muscle group', () => {
    expect(exercisePickerSpacing.exerciseGroupGap).toBe(spacing['s-5']);
  });
});
