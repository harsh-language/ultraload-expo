import { type TextInputProps } from 'react-native';
import { InputPillShell } from './InputPillShell';

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
  return (
    <InputPillShell
      autoCapitalize={autoCapitalize}
      autoFocus={autoFocus}
      hasValue={value.trim().length > 0}
      keyboardType={keyboardType}
      leadingLabel={leadingLabel}
      onBlur={onBlur}
      onChangeText={onChangeText}
      placeholder={placeholder}
      unit={unit}
      value={value}
    />
  );
}
