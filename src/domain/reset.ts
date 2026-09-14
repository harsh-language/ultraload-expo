import {
  DEFAULT_PLAN,
  DEFAULT_PROFILE,
  type PlanState,
  type ProfileState,
} from '../db/repositories';

export interface ClearedUserState {
  profile: ProfileState;
  plan: PlanState;
  workoutCount: 0;
}

/**
 * Canonical post-reset in-memory shape (T21 / BR24).
 * Shipping reset writes this to SQLite then replays onboarding.
 */
export function getClearedUserState(): ClearedUserState {
  return {
    profile: { ...DEFAULT_PROFILE },
    plan: { exerciseIds: [...DEFAULT_PLAN.exerciseIds] },
    workoutCount: 0,
  };
}

export function isClearedUserState(state: {
  profile: ProfileState;
  plan: PlanState;
  workoutCount: number;
}): boolean {
  return (
    state.workoutCount === 0 &&
    state.plan.exerciseIds.length === 0 &&
    state.profile.onboardingComplete === false &&
    state.profile.bodyweight === null &&
    state.profile.name === null &&
    state.profile.height === null &&
    state.profile.age === null
  );
}
