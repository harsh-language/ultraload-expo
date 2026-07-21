import { DEFAULT_PROFILE } from '../../src/db/repositories';
import { mergeProfilePatch } from '../../src/stores/profileSlice';

describe('profile slice', () => {
  it('allows optional profile fields to be cleared', () => {
    const current = {
      ...DEFAULT_PROFILE,
      bodyweight: 75,
      name: 'pablo',
      height: 70,
      age: 30,
    };

    expect(
      mergeProfilePatch(current, {
        name: null,
        height: null,
        age: null,
      }),
    ).toEqual({
      ...current,
      name: null,
      height: null,
      age: null,
    });
  });
});
