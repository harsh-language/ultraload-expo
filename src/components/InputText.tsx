import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';
import { textCase } from '../theme/textCase';

interface InputTextProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  optional?: boolean;
}

export function InputText({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  optional = false,
}: InputTextProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {optional ? <Text style={styles.optional}> optional</Text> : null}
      </Text>
      <TextInput
        accessibilityLabel={label}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors['content-3']}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing['s-5'],
    alignSelf: 'stretch',
  },
  label: {
    ...typography.label,
    ...textCase.upper,
  },
  optional: {
    ...typography.para4,
    ...textCase.lower,
  },
  input: {
    ...typography.para2,
    height: spacing['s-12'],
    borderWidth: spacing['s-1'],
    borderColor: colors['border-2'],
    borderRadius: radii['r-std'],
    backgroundColor: colors['bg-2'],
    paddingHorizontal: spacing['s-8'],
    color: colors['content-1'],
    ...textCase.none,
  },
});
