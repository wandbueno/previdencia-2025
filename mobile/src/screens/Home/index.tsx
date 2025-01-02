import { View, Text, ScrollView } from 'react-native';
import { useAuthStore } from '@/stores/auth';
import { styles } from './styles';

export function Home() {
  const { user } = useAuthStore();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {user?.name}</Text>
        <Text style={styles.organization}>{user?.organization.name}</Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Serviços Disponíveis</Text>
        
        {/* Services will be added here */}
        <View style={styles.servicesContainer}>
          <Text style={styles.emptyText}>
            Nenhum serviço disponível no momento
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}