import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { InputComboUnit } from '../../components/InputComboUnit';
import { InputHeightField } from '../../components/InputHeightField';
import { SectionDivider } from '../../components/SectionDivider';
import {
  isValidBodyweight,
  sanitizeAge,
  sanitizeBodyweight,
  sanitizeName,
} from '../../domain/profile-inputs';
import { spacing } from '../../theme/tokens';
import { OnboardingLayout } from './OnboardingLayout';

interface BodyweightStepProps {
  bodyweight: string;
  height: string;
  age: string;
  name: string;
  onBodyweightChange: (value: string) => void;
  onHeightChange: (value: string) => void;
  onAgeChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onNext: () => void;
}

export function BodyweightStep({
  bodyweight,
  height,
  age,
  name,
  onBodyweightChange,
  onHeightChange,
  onAgeChange,
  onNameChange,
  onNext,
}: BodyweightStepProps) {
  const isValid = isValidBodyweight(bodyweight);

  const handleBodyweightChange = useCallback(
    (value: string) => onBodyweightChange(sanitizeBodyweight(value)),
    [onBodyweightChange],
  );

  const handleAgeChange = useCallback(
    (value: string) => onAgeChange(sanitizeAge(value)),
    [onAgeChange],
  );

  const handleNameChange = useCallback(
    (value: string) => onNameChange(sanitizeName(value)),
    [onNameChange],
  );

  const handleNext = useCallback(() => {
    if (isValid) {
      onNext();
    }
  }, [isValid, onNext]);

  return (
    <OnboardingLayout
      actionDisabled={!isValid}
      actionLabel="select exercises"
      onAction={handleNext}
      step={1}
      title="profile"
    >
      <View style={styles.content}>
        <SectionDivider label="needed" />
        <InputComboUnit
          autoFocus
          keyboardType="decimal-pad"
          onChangeText={handleBodyweightChange}
          placeholder="your weight"
          unit="kg"
          value={bodyweight}
        />

        <SectionDivider label="extras" />
        <InputHeightField
          onChangeText={onHeightChange}
          value={height}
        />
        <InputComboUnit
          keyboardType="number-pad"
          onChangeText={handleAgeChange}
          placeholder="your age"
          unit="years"
          value={age}
        />
        <InputComboUnit
          autoCapitalize="none"
          keyboardType="default"
          onChangeText={handleNameChange}
          placeholder="your name"
          unit=""
          value={name}
        />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing['s-8'],
  },
});
