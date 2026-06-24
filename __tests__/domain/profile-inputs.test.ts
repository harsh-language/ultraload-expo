import {
  AGE_MAX,
  BODYWEIGHT_MAX,
  isValidBodyweight,
  sanitizeAge,
  sanitizeBodyweight,
  sanitizeName,
} from '../../src/domain/profile-inputs';
import {
  applyHeightDigitChange,
  formatHeightDigits,
  parseHeightDigits,
  sanitizeHeightDigits,
} from '../../src/domain/height-input';

describe('profile-inputs', () => {
  describe('sanitizeBodyweight', () => {
    it('strips non-numeric characters', () => {
      expect(sanitizeBodyweight('65kg')).toBe('65');
    });

    it('allows a single decimal point', () => {
      expect(sanitizeBodyweight('75.5')).toBe('75.5');
      expect(sanitizeBodyweight('75.5.2')).toBe('75.52');
    });

    it('clamps values above max', () => {
      expect(sanitizeBodyweight('250')).toBe(String(BODYWEIGHT_MAX));
    });

    it('returns empty for empty input', () => {
      expect(sanitizeBodyweight('')).toBe('');
    });
  });

  describe('isValidBodyweight', () => {
    it('accepts values in range', () => {
      expect(isValidBodyweight('65')).toBe(true);
      expect(isValidBodyweight('0')).toBe(true);
      expect(isValidBodyweight('200')).toBe(true);
    });

    it('rejects empty and out-of-range values', () => {
      expect(isValidBodyweight('')).toBe(false);
      expect(isValidBodyweight('201')).toBe(false);
      expect(isValidBodyweight('-1')).toBe(false);
    });
  });

  describe('sanitizeAge', () => {
    it('strips non-digits', () => {
      expect(sanitizeAge('25y')).toBe('25');
    });

    it('clamps values above max', () => {
      expect(sanitizeAge('150')).toBe(String(AGE_MAX));
    });

    it('returns empty for empty input', () => {
      expect(sanitizeAge('')).toBe('');
    });
  });

  describe('sanitizeName', () => {
    it('lowercases and allows letters, numbers, spaces', () => {
      expect(sanitizeName('Harsh')).toBe('harsh');
      expect(sanitizeName('user 123')).toBe('user 123');
    });

    it('strips disallowed characters', () => {
      expect(sanitizeName('hello!@#')).toBe('hello');
    });
  });
});

describe('height-input', () => {
  describe('formatHeightDigits', () => {
    it('shows feet only for a single digit', () => {
      expect(formatHeightDigits('6')).toBe("6'");
    });

    it('formats two digits as feet and single inch', () => {
      expect(formatHeightDigits('55')).toBe("5' 5\"");
    });

    it('formats three digits as feet and two-digit inches', () => {
      expect(formatHeightDigits('510')).toBe("5' 10\"");
    });

    it('clamps inches to 11', () => {
      expect(formatHeightDigits('512')).toBe("5' 11\"");
    });

    it('returns empty for no digits', () => {
      expect(formatHeightDigits('')).toBe('');
    });
  });

  describe('parseHeightDigits', () => {
    it('parses formatted height parts', () => {
      expect(parseHeightDigits('55')).toEqual({ feet: 5, inches: 5 });
      expect(parseHeightDigits('510')).toEqual({ feet: 5, inches: 10 });
    });

    it('returns null for empty or feet-only input', () => {
      expect(parseHeightDigits('')).toBeNull();
      expect(parseHeightDigits('6')).toBeNull();
    });
  });

  describe('sanitizeHeightDigits', () => {
    it('strips symbols and caps length', () => {
      expect(sanitizeHeightDigits("5' 10\"")).toBe('510');
      expect(sanitizeHeightDigits('1234')).toBe('123');
    });
  });

  describe('applyHeightDigitChange', () => {
    it('appends digits on input', () => {
      expect(applyHeightDigitChange('', '5')).toBe('5');
      expect(applyHeightDigitChange('5', '55')).toBe('55');
      expect(applyHeightDigitChange('55', '510')).toBe('510');
    });

    it('removes one digit on backspace', () => {
      expect(applyHeightDigitChange('55', "5' 5")).toBe('5');
      expect(applyHeightDigitChange('510', "5' 10")).toBe('51');
      expect(applyHeightDigitChange('5', '')).toBe('');
      expect(applyHeightDigitChange('5', "5")).toBe('');
    });
  });
});
