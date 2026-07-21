import {
  DISPLAY_WEIGHT_STEP,
  KG_PER_LB,
  KG_PER_STONE,
  displayToKg,
  formatDisplayWeight,
  formatWeight,
  formatWeightLabel,
  getUnitLabel,
  kgToDisplay,
  roundToNearestHalf,
  sanitizeDisplayWeightInput,
} from '../../src/domain/units';

describe('units domain', () => {
  it('uses precise lb and stone constants', () => {
    expect(KG_PER_LB).toBe(0.45359237);
    expect(KG_PER_STONE).toBe(14 * KG_PER_LB);
    expect(DISPLAY_WEIGHT_STEP).toBe(0.5);
  });

  it('rounds to nearest 0.5 (BR17)', () => {
    expect(roundToNearestHalf(10)).toBe(10);
    expect(roundToNearestHalf(10.24)).toBe(10);
    expect(roundToNearestHalf(10.25)).toBe(10.5);
    expect(roundToNearestHalf(10.74)).toBe(10.5);
    expect(roundToNearestHalf(10.75)).toBe(11);
  });

  it('sanitizes display-unit weight input without imposing kg limits', () => {
    expect(sanitizeDisplayWeightInput('220.5 lbs')).toBe('220.5');
    expect(sanitizeDisplayWeightInput('12.3.4')).toBe('12.34');
  });

  it('converts kg to lbs with nearest-0.5 display rounding (T7)', () => {
    expect(kgToDisplay(100, 'lbs')).toBe(220.5);
    expect(kgToDisplay(45.359237, 'lbs')).toBe(100);
    expect(kgToDisplay(1, 'lbs')).toBe(2);
  });

  it('converts kg to stone with nearest-0.5 display rounding (T7)', () => {
    expect(kgToDisplay(63.5029318, 'stone')).toBe(10);
    expect(kgToDisplay(100, 'stone')).toBe(15.5);
  });

  it('leaves kg display as nearest 0.5', () => {
    expect(kgToDisplay(100, 'kg')).toBe(100);
    expect(kgToDisplay(100.3, 'kg')).toBe(100.5);
    expect(kgToDisplay(100.2, 'kg')).toBe(100);
  });

  it('converts display units back to kg for storage', () => {
    expect(displayToKg(100, 'kg')).toBe(100);
    expect(displayToKg(100, 'lbs')).toBeCloseTo(45.359237, 10);
    expect(displayToKg(1, 'stone')).toBeCloseTo(KG_PER_STONE, 10);
    expect(displayToKg(10, 'stone')).toBeCloseTo(10 * KG_PER_STONE, 10);
  });

  it('preserves storage kg through display round-trip of clean display values', () => {
    const lbs = 100;
    const storedKg = displayToKg(lbs, 'lbs');
    expect(kgToDisplay(storedKg, 'lbs')).toBe(lbs);

    const stone = 12.5;
    const storedStoneKg = displayToKg(stone, 'stone');
    expect(kgToDisplay(storedStoneKg, 'stone')).toBe(stone);

    expect(kgToDisplay(displayToKg(77.5, 'kg'), 'kg')).toBe(77.5);
  });

  it('formats weight labels for UI', () => {
    expect(getUnitLabel('kg')).toBe('kg');
    expect(getUnitLabel('lbs')).toBe('lbs');
    expect(getUnitLabel('stone')).toBe('st');

    expect(formatDisplayWeight(100)).toBe('100');
    expect(formatDisplayWeight(100.5)).toBe('100.5');

    expect(formatWeight(100, 'kg')).toBe('100');
    expect(formatWeight(100, 'lbs')).toBe('220.5');
    expect(formatWeightLabel(100, 'kg')).toBe('100 kg');
    expect(formatWeightLabel(100, 'lbs')).toBe('220.5 lbs');
    expect(formatWeightLabel(100, 'stone')).toBe('15.5 st');
  });
});
