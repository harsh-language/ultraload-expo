import { useCallback, useEffect, useState } from 'react';
import {
  applyHeightDigitChange,
  extractHeightDigits,
  formatHeightDigits,
} from '../domain/height-input';
import { InputPillShell } from './InputPillShell';

interface InputHeightFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  unit?: string;
  placeholder?: string;
  /** Figma Settings `labelLeft` — e.g. `height :` */
  leadingLabel?: string;
  onBlur?: () => void;
}

export function InputHeightField({
  value,
  onChangeText,
  unit = 'feet / inches',
  placeholder = 'your height',
  leadingLabel,
  onBlur,
}: InputHeightFieldProps) {
  const [digits, setDigits] = useState(() => extractHeightDigits(value));
  const displayValue = formatHeightDigits(digits);

  useEffect(() => {
    setDigits(extractHeightDigits(value));
  }, [value]);

  const handleChangeText = useCallback(
    (next: string) => {
      const nextDigits = applyHeightDigitChange(digits, next);
      setDigits(nextDigits);
      onChangeText(formatHeightDigits(nextDigits));
    },
    [digits, onChangeText],
  );

  return (
    <InputPillShell
      hasValue={digits.length > 0}
      keyboardType="number-pad"
      leadingLabel={leadingLabel}
      onBlur={onBlur}
      onChangeText={handleChangeText}
      placeholder={placeholder}
      unit={unit}
      value={displayValue}
    />
  );
}
