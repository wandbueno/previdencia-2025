import { TouchableOpacity, TouchableOpacityProps, Text } from 'react-native';
import { styles } from './styles';

interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
}

export function Button({ children, disabled, ...rest }: ButtonProps) {
  return (
    <TouchableOpacity 
      style={[
        styles.container,
        disabled && styles.disabled
      ]}
      disabled={disabled}
      {...rest}
    >
      <Text style={styles.text}>{children}</Text>
    </TouchableOpacity>
  );
}