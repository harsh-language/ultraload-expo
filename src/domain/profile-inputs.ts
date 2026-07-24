export const BODYWEIGHT_MIN = 0;
export const BODYWEIGHT_MAX = 200;
export const AGE_MIN = 0;
export const AGE_MAX = 123;

export function isValidBodyweight(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }
  const parsed = Number.parseFloat(trimmed);
  return (
    Number.isFinite(parsed) &&
    parsed >= BODYWEIGHT_MIN &&
    parsed <= BODYWEIGHT_MAX
  );
}

export function sanitizeBodyweight(raw: string): string {
  let sanitized = raw.replace(/[^\d.]/g, '');
  const dotIndex = sanitized.indexOf('.');
  if (dotIndex !== -1) {
    sanitized =
      sanitized.slice(0, dotIndex + 1) +
      sanitized.slice(dotIndex + 1).replace(/\./g, '');
  }

  if (!sanitized || sanitized === '.') {
    return sanitized === '.' ? sanitized : '';
  }

  const parsed = Number.parseFloat(sanitized);
  if (!Number.isFinite(parsed)) {
    return sanitized;
  }

  if (parsed > BODYWEIGHT_MAX) {
    return String(BODYWEIGHT_MAX);
  }

  if (parsed < BODYWEIGHT_MIN) {
    return sanitized.startsWith('-') ? '' : sanitized;
  }

  return sanitized;
}

export function sanitizeAge(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) {
    return '';
  }

  const parsed = Number.parseInt(digits, 10);
  if (!Number.isFinite(parsed)) {
    return '';
  }

  if (parsed > AGE_MAX) {
    return String(AGE_MAX);
  }

  return digits;
}

/** Parse optional age input; null when empty. */
export function parseOptionalInt(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Settings / profile age for persistence.
 * Empty is valid and stores `0` (unused; future wiring).
 */
export function parseAgeForSave(value: string): number {
  return parseOptionalInt(value) ?? 0;
}

/** Empty age is valid; non-empty must parse in range after sanitize. */
export function isValidAgeInput(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }
  const parsed = Number.parseInt(trimmed, 10);
  return (
    Number.isFinite(parsed) && parsed >= AGE_MIN && parsed <= AGE_MAX
  );
}

export function sanitizeName(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9 ]/g, '').toLowerCase();
}
