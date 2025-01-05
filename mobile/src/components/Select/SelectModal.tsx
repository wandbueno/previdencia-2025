// mobile/src/components/Select/SelectModal.tsx
import { Modal, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { SelectOption } from './index';
import { Check } from './icons/Check';
import { styles } from './styles';

interface SelectModalProps {
  visible: boolean;
  onClose: () => void;
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
}

export function SelectModal({ 
  visible, 
  onClose, 
  options,
  value,
  onChange
}: SelectModalProps) {
  function handleSelect(optionValue: string) {
    onChange(optionValue);
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <FlatList
            data={options}
            keyExtractor={item => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.option}
                onPress={() => handleSelect(item.value)}
              >
                <Text style={styles.optionText}>{item.label}</Text>
                
                {item.value === value && (
                  <Check />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}
