import { useState } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  type TextInputProps,
} from 'react-native';
import { inputPillStyles as styles } from './inputPillStyles';
import { colors } from '../theme/tokens';
import { typography } from '../theme/typography';

interface InputComboUnitProps {
  value: string;
  onChangeText: (value: string) => void;
  unit: string;
  placeholder?: string;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoFocus?: boolean;
}

export function InputComboUnit({
  value,
  onChangeText,
  unit,
  placeholder,
  keyboardType = 'default',
  autoCapitalize,
  autoFocus = false,
}: InputComboUnitProps) {
  const [focused, setFocused] = useState(false);
  const hasValue = value.trim().length > 0;

  return (
    <Pressable style={[styles.pill, focused && styles.pillFocused]}>
      <TextInput
        autoCapitalize={autoCapitalize}
        autoFocus={autoFocus}
        keyboardType={keyboardType}
        onBlur={() => setFocused(false)}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        placeholder={placeholder}
        placeholderTextColor={colors['content-3']}
        style={[
          hasValue ? typography.para1 : typography.para2,
          styles.input,
          hasValue && styles.inputFilled,
        ]}
        value={value}
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
