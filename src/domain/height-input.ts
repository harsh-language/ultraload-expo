const MAX_INCHES = 11;
const MAX_DIGITS = 3;

export interface HeightParts {
  feet: number;
  inches: number;
}

function clampInches(value: number): number {
  return Math.min(Math.max(value, 0), MAX_INCHES);
}

/** Strip non-digits and cap at 3 digits (1 ft + 2 in). */
export function sanitizeHeightDigits(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, MAX_DIGITS);
}

function partsFromDigits(digits: string): HeightParts | null {
  if (!digits) {
    return null;
  }

  if (digits.length === 1) {
    return {
      feet: Number.parseInt(digits, 10),
      inches: 0,
    };
  }

  const feet = Number.parseInt(digits[0] ?? '0', 10);
  const inches = clampInches(
    digits.length === 2
      ? Number.parseInt(digits[1] ?? '0', 10)
      : Number.parseInt(digits.slice(1), 10),
  );
  return { feet, inches };
}

export function formatHeightDigits(digits: string): string {
  const sanitized = sanitizeHeightDigits(digits);
  if (!sanitized) {
    return '';
  }

  if (sanitized.length === 1) {
    return `${sanitized[0]}'`;
  }

  const parts = partsFromDigits(sanitized);
  if (!parts) {
    return '';
  }

  return `${parts.feet}' ${parts.inches}"`;
}

export function parseHeightDigits(digits: string): HeightParts | null {
  const sanitized = sanitizeHeightDigits(digits);
  if (!sanitized || sanitized.length === 1) {
    return null;
  }

  return partsFromDigits(sanitized);
}

/** Extract raw digits from a formatted or partial height string. */
export function extractHeightDigits(value: string): string {
  return sanitizeHeightDigits(value);
}

/** Stored profile height — total inches (feet/inches UI). */
export function heightPartsToInches(parts: HeightParts): number {
  return parts.feet * 12 + parts.inches;
}

/** Reverse of heightPartsToInches for Settings field hydration. */
export function inchesToHeightDigits(totalInches: number): string {
  const feet = Math.floor(totalInches / 12);
  const inches = clampInches(Math.round(totalInches % 12));
  return `${feet}${inches}`;
}

/** Parse optional height input; null when empty or incomplete (feet only). */
export function parseOptionalHeight(value: string): number | null {
  const parts = parseHeightDigits(extractHeightDigits(value));
  if (!parts) {
    return null;
  }

  return heightPartsToInches(parts);
}

/**
 * Settings height for persistence.
 * - Empty → `0` (cleared / unused; future wiring)
 * - Complete feet+inches → total inches
 * - Incomplete (e.g. feet only) → `undefined` (not ready to save)
 */
export function parseHeightForSave(value: string): number | undefined {
  const digits = extractHeightDigits(value);
  if (!digits) {
    return 0;
  }
  const inches = parseOptionalHeight(value);
  return inches ?? undefined;
}

/** Apply edit relative to previous digits (credit-card style over formatted display). */
export function applyHeightDigitChange(
  previousDigits: string,
  nextText: string,
): string {
  if (!nextText.trim()) {
    return '';
  }

  const previousDisplay = formatHeightDigits(previousDigits);
  const nextDigits = sanitizeHeightDigits(nextText);

  if (nextDigits.length > previousDigits.length) {
    return nextDigits.slice(0, MAX_DIGITS);
  }

  if (nextDigits.length < previousDigits.length) {
    return nextDigits;
  }

  if (nextText.length < previousDisplay.length) {
    return previousDigits.slice(0, Math.max(0, previousDigits.length - 1));
  }

  return previousDigits;
}
