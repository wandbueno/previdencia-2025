// mobile/src/components/Button/index.tsx
import { TouchableOpacity, TouchableOpacityProps, Text, ActivityIndicator } from 'react-native';
import { styles } from './styles';

interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, disabled, loading, variant = 'primary', style, ...rest }: ButtonProps) {
  return (
    <TouchableOpacity 
      style={[
        styles.container,
        variant === 'secondary' && styles.secondary,
        disabled && styles.disabled,
        style
      ]}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={[
          styles.text,
          variant === 'secondary' && styles.secondaryText
        ]}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}
