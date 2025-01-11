import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Check } from './icons/Check';
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
  const selectedOption = options.find(option => option.value === value);

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
              style={[
                styles.option,
                value === option.value && styles.selectedOption
              ]}
            />
          ))}
        </Picker>

        {selectedOption && (
          <View style={styles.checkIcon}>
            <Check />
          </View>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}