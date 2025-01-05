import { View, Text } from 'react-native';
import { useAuthStore } from '@/stores/auth';
import { styles } from './styles';

export function Header() {
  const { user } = useAuthStore();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.name}</Text>
          <Text style={styles.organization}>{user?.organization.name}</Text>
        </View>
      </View>
    </View>
  );
}