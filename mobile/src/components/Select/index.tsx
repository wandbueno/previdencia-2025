// mobile/src/components/Select/index.tsx
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { styles } from './styles';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label: string;
  placeholder?: string;
  value?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: string;
}

export function Select({ 
  label, 
  placeholder = 'Selecione uma opção',
  value,
  options,
  onChange,
  error 
}: SelectProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <View style={[styles.select, error && styles.selectError]}>
        <Picker
          selectedValue={value}
          onValueChange={onChange}
          style={styles.picker}
        >
          <Picker.Item 
            label={placeholder} 
            value="" 
            style={styles.placeholder}
          />
          {options.map((option) => (
            <Picker.Item
              key={option.value}
              label={option.label}
              value={option.value}
              style={styles.option}
            />
          ))}
        </Picker>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}
