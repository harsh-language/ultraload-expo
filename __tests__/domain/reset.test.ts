import {
  getClearedUserState,
  isClearedUserState,
} from '../../src/domain/reset';
import { DEFAULT_PLAN, DEFAULT_PROFILE } from '../../src/db/repositories';

describe('reset (T21)', () => {
  it('cleared state matches defaults and is ready for onboarding replay', () => {
    const cleared = getClearedUserState();

    expect(cleared.profile).toEqual(DEFAULT_PROFILE);
    expect(cleared.plan).toEqual(DEFAULT_PLAN);
    expect(cleared.workoutCount).toBe(0);
    expect(cleared.profile.onboardingComplete).toBe(false);
    expect(isClearedUserState(cleared)).toBe(true);
  });

  it('does not treat an onboarded profile as cleared', () => {
    expect(
      isClearedUserState({
        profile: { ...DEFAULT_PROFILE, onboardingComplete: true, bodyweight: 75 },
        plan: { exerciseIds: ['bench-press'] },
        workoutCount: 3,
      }),
    ).toBe(false);
  });
});
