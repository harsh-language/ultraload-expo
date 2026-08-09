import { buildLoggedSetRowModels } from '../../src/domain/logged-set-rows';

describe('buildLoggedSetRowModels', () => {
  it('numbers only standard sets and hides the last row border', () => {
    expect(
      buildLoggedSetRowModels([
        { id: 1, weight: 40, reps: 10, warmUp: true },
        { id: 2, weight: 100, reps: 5, warmUp: false },
        { id: 3, weight: 110, reps: 3, warmUp: false },
      ]),
    ).toEqual([
      {
        id: 1,
        warmUp: true,
        weight: 40,
        reps: 10,
        showBottomBorder: true,
      },
      {
        id: 2,
        warmUp: false,
        setIndex: 1,
        weight: 100,
        reps: 5,
        showBottomBorder: true,
      },
      {
        id: 3,
        warmUp: false,
        setIndex: 2,
        weight: 110,
        reps: 3,
        showBottomBorder: false,
      },
    ]);
  });

  it('does not increment the standard index across warm-up rows', () => {
    const rows = buildLoggedSetRowModels([
      { id: 1, weight: 100, reps: 5, warmUp: false },
      { id: 2, weight: 40, reps: 10, warmUp: true },
      { id: 3, weight: 110, reps: 5, warmUp: false },
    ]);

    expect(rows.map((row) => ('setIndex' in row ? row.setIndex : 'W'))).toEqual([
      1,
      'W',
      2,
    ]);
  });

  it('returns an empty list when there are no sets', () => {
    expect(buildLoggedSetRowModels([])).toEqual([]);
  });
});
