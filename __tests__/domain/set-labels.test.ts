import {
  formatSetIndex,
  getAddSetRecordLabel,
  getEditSetRecordLabel,
  getNextStandardSetIndex,
  getSetSheetTitle,
} from '../../src/domain/set-labels';

describe('formatSetIndex', () => {
  it('pads single-digit indexes to two characters', () => {
    expect(formatSetIndex(1)).toBe('01');
    expect(formatSetIndex(9)).toBe('09');
  });

  it('keeps two-digit indexes as-is', () => {
    expect(formatSetIndex(10)).toBe('10');
    expect(formatSetIndex(12)).toBe('12');
  });
});

describe('getNextStandardSetIndex', () => {
  it('returns 1 when there is no workout or exercise yet', () => {
    expect(getNextStandardSetIndex(null, 'squat')).toBe(1);
    expect(
      getNextStandardSetIndex({ loggedExercises: [] }, 'squat'),
    ).toBe(1);
  });

  it('counts only non-warmup sets for the matching exercise', () => {
    const workout = {
      loggedExercises: [
        {
          exerciseId: 'squat',
          sets: [
            { warmUp: true },
            { warmUp: false },
            { warmUp: true },
            { warmUp: false },
          ],
        },
        {
          exerciseId: 'bench',
          sets: [{ warmUp: false }],
        },
      ],
    };

    expect(getNextStandardSetIndex(workout, 'squat')).toBe(3);
    expect(getNextStandardSetIndex(workout, 'bench')).toBe(2);
  });
});

describe('getAddSetRecordLabel', () => {
  it('labels warmup recordings without a set number', () => {
    expect(
      getAddSetRecordLabel({ warmUp: true, nextStandardSetIndex: 2 }),
    ).toBe('record warmup set');
  });

  it('labels standard recordings with zero-padded set number', () => {
    expect(
      getAddSetRecordLabel({ warmUp: false, nextStandardSetIndex: 1 }),
    ).toBe('record set 01');
    expect(
      getAddSetRecordLabel({ warmUp: false, nextStandardSetIndex: 2 }),
    ).toBe('record set 02');
  });
});

describe('getEditSetRecordLabel', () => {
  it('labels edit save for warmup vs standard sets', () => {
    expect(getEditSetRecordLabel(true)).toBe('save warmup set');
    expect(getEditSetRecordLabel(false)).toBe('save set');
  });
});

describe('getSetSheetTitle', () => {
  it('labels edit and delete titles for warmup vs numbered sets', () => {
    expect(getSetSheetTitle('edit', null)).toBe('edit set');
    expect(getSetSheetTitle('delete', null)).toBe('delete set');
    expect(getSetSheetTitle('edit', { warmUp: true })).toBe('edit warmup set');
    expect(getSetSheetTitle('delete', { warmUp: true })).toBe(
      'delete warmup set',
    );
    expect(getSetSheetTitle('edit', { warmUp: false, setIndex: 1 })).toBe(
      'edit set 01',
    );
    expect(getSetSheetTitle('delete', { warmUp: false, setIndex: 2 })).toBe(
      'delete set 02',
    );
  });
});
