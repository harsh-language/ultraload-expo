import { useRef, useState } from 'react';
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
  /** Figma Settings `labelLeft` — e.g. `body weight :` */
  leadingLabel?: string;
  placeholder?: string;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoFocus?: boolean;
  onBlur?: () => void;
}

export function InputComboUnit({
  value,
  onChangeText,
  unit,
  leadingLabel,
  placeholder,
  keyboardType = 'default',
  autoCapitalize,
  autoFocus = false,
  onBlur,
}: InputComboUnitProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const hasValue = value.trim().length > 0;

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
        autoCapitalize={autoCapitalize}
        autoFocus={autoFocus}
        keyboardType={keyboardType}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
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
