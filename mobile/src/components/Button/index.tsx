import { TouchableOpacity, TouchableOpacityProps, Text, ActivityIndicator } from 'react-native';
import { styles } from './styles';

interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  loading?: boolean;
}

export function Button({ children, disabled, loading, ...rest }: ButtonProps) {
  return (
    <TouchableOpacity 
      style={[
        styles.container,
        disabled && styles.disabled
      ]}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.text}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}