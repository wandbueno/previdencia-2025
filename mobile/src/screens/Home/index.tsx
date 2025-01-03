// src/screens/Home/index.tsx
import { View, Text, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/lib/api';
import { Event } from '@/types/event';
import { EventCard } from '@/components/EventCard';
import { styles } from './styles';

export function Home() {
  const { user } = useAuthStore();

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await api.get('/events');
      return response.data;
    }
  });

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
        <Text style={styles.sectionTitle}>Eventos Disponíveis</Text>
        
        <View style={styles.eventsContainer}>
          {events?.length === 0 && (
            <Text style={styles.emptyText}>
              Nenhum evento disponível no momento
            </Text>
          )}

          {events?.map(event => (
            <EventCard 
              key={event.id} 
              event={event}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
