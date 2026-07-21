import type { DisplayUnit } from '../data/exercise-catalogue';

/** International avoirdupois pound in kilograms. */
export const KG_PER_LB = 0.45359237;

/** One stone = 14 lb, in kilograms. */
export const KG_PER_STONE = 14 * KG_PER_LB;

/** BR17 — displayed weights round to nearest 0.5 in the active unit. */
export const DISPLAY_WEIGHT_STEP = 0.5;

/** Keep one decimal separator while editing a display-unit weight. */
export function sanitizeDisplayWeightInput(raw: string): string {
  let sanitized = raw.replace(/[^\d.]/g, '');
  const dotIndex = sanitized.indexOf('.');
  if (dotIndex !== -1) {
    sanitized =
      sanitized.slice(0, dotIndex + 1) +
      sanitized.slice(dotIndex + 1).replace(/\./g, '');
  }
  return sanitized;
}

export function roundToNearestHalf(value: number): number {
  return Math.round(value / DISPLAY_WEIGHT_STEP) * DISPLAY_WEIGHT_STEP;
}

/** Convert stored kg to the profile display unit, rounded per BR17. */
export function kgToDisplay(kg: number, unit: DisplayUnit): number {
  switch (unit) {
    case 'kg':
      return roundToNearestHalf(kg);
    case 'lbs':
      return roundToNearestHalf(kg / KG_PER_LB);
    case 'stone':
      return roundToNearestHalf(kg / KG_PER_STONE);
    default: {
      const _exhaustive: never = unit;
      return _exhaustive;
    }
  }
}

/**
 * Convert a display-unit value to kg for storage.
 * Does not round — storage keeps precise kg; display rounding is BR17.
 */
export function displayToKg(value: number, unit: DisplayUnit): number {
  switch (unit) {
    case 'kg':
      return value;
    case 'lbs':
      return value * KG_PER_LB;
    case 'stone':
      return value * KG_PER_STONE;
    default: {
      const _exhaustive: never = unit;
      return _exhaustive;
    }
  }
}

export function getUnitLabel(unit: DisplayUnit): string {
  switch (unit) {
    case 'kg':
      return 'kg';
    case 'lbs':
      return 'lbs';
    case 'stone':
      return 'st';
    default: {
      const _exhaustive: never = unit;
      return _exhaustive;
    }
  }
}

/** Format a display-unit magnitude for UI (no unit suffix). */
export function formatDisplayWeight(value: number): string {
  if (Number.isInteger(value)) {
    return String(value);
  }
  return value.toFixed(1);
}

/** Format stored kg as a display magnitude (no unit suffix). */
export function formatWeight(kg: number, unit: DisplayUnit): string {
  return formatDisplayWeight(kgToDisplay(kg, unit));
}

/** Format stored kg as a UI label, e.g. `100 kg` / `220.5 lbs`. */
export function formatWeightLabel(kg: number, unit: DisplayUnit): string {
  return `${formatWeight(kg, unit)} ${getUnitLabel(unit)}`;
}
