import Slider from '@react-native-community/slider';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';
import { typography } from '../theme/typography';

interface InputSliderProps {
  label: string;
  value: number;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  unit?: string;
  onValueChange: (value: number) => void;
}

export function InputSlider({
  label,
  value,
  minimumValue,
  maximumValue,
  step = 1,
  unit,
  onValueChange,
}: InputSliderProps) {
  const displayValue = unit ? `${value} ${unit}` : String(value);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={typography.bodyS}>{label}</Text>
        <Text style={typography.labelS}>{displayValue}</Text>
      </View>
      <Slider
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={colors['content-1']}
        maximumTrackTintColor={colors['content-4']}
        thumbTintColor={colors['content-1']}
        style={styles.slider}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing['s-4'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slider: {
    width: '100%',
    height: spacing['s-10'],
  },
});
