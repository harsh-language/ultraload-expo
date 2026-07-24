import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  Text,
  TextInput,
} from 'react-native';
import {
  applyHeightDigitChange,
  extractHeightDigits,
  formatHeightDigits,
} from '../domain/height-input';
import { inputPillStyles as styles } from './inputPillStyles';
import { colors } from '../theme/tokens';
import { typography } from '../theme/typography';

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
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const [digits, setDigits] = useState(() => extractHeightDigits(value));
  const displayValue = formatHeightDigits(digits);
  const hasValue = digits.length > 0;

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
    <Pressable
      accessibilityRole="none"
      onPress={() => {
        inputRef.current?.focus();
      }}
      style={[styles.pill, focused && styles.pillFocused]}
    >
      {leadingLabel ? (
        <Text pointerEvents="none" style={[typography.para2, styles.leadingLabel]}>
          {leadingLabel}
        </Text>
      ) : null}
      <TextInput
        ref={inputRef}
        keyboardType="number-pad"
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
        onChangeText={handleChangeText}
        onFocus={() => setFocused(true)}
        placeholder={placeholder}
        placeholderTextColor={colors['content-3']}
        style={[
          hasValue ? typography.para1 : typography.para2,
          styles.input,
          hasValue && styles.inputFilled,
        ]}
        value={displayValue}
      />
      {unit ? (
        <Text
          pointerEvents="none"
          style={[
            typography.para2,
            styles.unit,
            focused && styles.unitFocused,
          ]}
        >
          {unit}
        </Text>
      ) : null}
    </Pressable>
  );
}
