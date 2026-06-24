import { useCallback, useState } from 'react';
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
}

export function InputHeightField({
  value,
  onChangeText,
  unit = 'feet / inches',
  placeholder = 'your height',
}: InputHeightFieldProps) {
  const [focused, setFocused] = useState(false);
  const [digits, setDigits] = useState(() => extractHeightDigits(value));
  const displayValue = formatHeightDigits(digits);
  const hasValue = digits.length > 0;

  const handleChangeText = useCallback(
    (next: string) => {
      const nextDigits = applyHeightDigitChange(digits, next);
      setDigits(nextDigits);
      onChangeText(formatHeightDigits(nextDigits));
    },
    [digits, onChangeText],
  );

  return (
    <Pressable style={[styles.pill, focused && styles.pillFocused]}>
      <TextInput
        keyboardType="number-pad"
        onBlur={() => setFocused(false)}
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
