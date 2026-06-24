import { spacing } from '../../src/theme/tokens';
import {
  getOnboardingFooterHeight,
  getOnboardingScrollBottomInset,
} from '../../src/screens/onboarding/OnboardingLayout';

describe('OnboardingLayout spacing helpers', () => {
  const zeroInsets = { top: 0, right: 0, bottom: 0, left: 0 };

  it('computes overlay footer height from button + safe area', () => {
    expect(getOnboardingFooterHeight(zeroInsets)).toBe(
      spacing['s-12'] + spacing['s-8'],
    );
    expect(getOnboardingFooterHeight({ ...zeroInsets, bottom: 34 })).toBe(
      spacing['s-12'] + 34,
    );
  });

  it('uses footer height plus s-8 for scroll bottom inset', () => {
    expect(getOnboardingScrollBottomInset(zeroInsets)).toBe(
      getOnboardingFooterHeight(zeroInsets) + spacing['s-8'],
    );
  });
});
