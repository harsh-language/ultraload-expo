import { toDeletableSet } from '../../src/domain/deletable-set';

const standard = {
  id: 4,
  weight: 100,
  reps: 5,
  warmUp: false,
};

const warmUp = {
  id: 7,
  weight: 40,
  reps: 10,
  warmUp: true,
};

describe('toDeletableSet', () => {
  it('keeps standard-set index for the delete preview', () => {
    expect(toDeletableSet(standard, 2)).toEqual({
      id: 4,
      weight: 100,
      reps: 5,
      warmUp: false,
      setIndex: 2,
    });
  });

  it('omits set index on warm-up sets so the preview shows W', () => {
    expect(toDeletableSet(warmUp, 2)).toEqual({
      id: 7,
      weight: 40,
      reps: 10,
      warmUp: true,
    });
  });
});
