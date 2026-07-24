import {
  formatHeightDigits,
  inchesToHeightDigits,
  parseHeightForSave,
  parseOptionalHeight,
} from '../../src/domain/height-input';

describe('height input', () => {
  it('hydrates stored inches into the feet/inches field', () => {
    expect(inchesToHeightDigits(60)).toBe('50');
    expect(inchesToHeightDigits(70)).toBe('510');
    expect(formatHeightDigits(inchesToHeightDigits(70))).toBe(`5' 10"`);
  });

  it('parses a cleared or incomplete optional height as null', () => {
    expect(parseOptionalHeight('')).toBeNull();
    expect(parseOptionalHeight(`5'`)).toBeNull();
    expect(parseOptionalHeight(`5' 10"`)).toBe(70);
  });

  it('parseHeightForSave clears empty to 0 and skips incomplete', () => {
    expect(parseHeightForSave('')).toBe(0);
    expect(parseHeightForSave(`5'`)).toBeUndefined();
    expect(parseHeightForSave(`5' 10"`)).toBe(70);
  });
});
