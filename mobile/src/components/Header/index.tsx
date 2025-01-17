import { View, Text, Platform, SafeAreaView, StatusBar } from 'react-native';
import { useAuthStore } from '@/stores/auth';
import { styles } from './styles';

export function Header() {
  const { user } = useAuthStore();
  const statusBarHeight = StatusBar.currentHeight || 0;

  return (
    <SafeAreaView style={[
      styles.safeArea,
      Platform.OS === 'android' && { paddingTop: statusBarHeight }
    ]}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.greeting}>Olá, {user?.name}</Text>
          <Text style={styles.organization}>{user?.organization.name}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
