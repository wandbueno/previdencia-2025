// mobile/src/components/Input/index.tsx
import { TextInput, TextInputProps, View, Text } from 'react-native';
import MaskInput, { Mask, MaskInputProps } from 'react-native-mask-input';
import { styles } from './styles';

interface InputProps extends Omit<TextInputProps, 'mask'> {
  label: string;
  error?: string;
  mask?: Mask;
}

export function Input({ label, error, mask, ...rest }: InputProps) {
  const InputComponent = mask ? MaskInput : TextInput;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <InputComponent
        style={[
          styles.input,
          error && styles.inputError
        ]}
        placeholderTextColor="#94A3B8"
        mask={mask}
        {...rest}
      />

      {error && (
        <Text style={styles.error}>{error}</Text>
      )}
    </View>
  );
}
