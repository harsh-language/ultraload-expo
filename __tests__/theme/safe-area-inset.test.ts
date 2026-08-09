import { clampSafeInset } from '../../src/theme/safeAreaInset';
import { spacing } from '../../src/theme/tokens';

describe('clampSafeInset', () => {
  it('returns the system inset when it is at least s-5', () => {
    expect(clampSafeInset(spacing['s-8'])).toBe(spacing['s-8']);
    expect(clampSafeInset(spacing['s-5'])).toBe(spacing['s-5']);
  });

  it('floors smaller insets to s-5', () => {
    expect(clampSafeInset(0)).toBe(spacing['s-5']);
    expect(clampSafeInset(spacing['s-3'])).toBe(spacing['s-5']);
  });
});
