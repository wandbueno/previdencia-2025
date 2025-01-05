import { View, ScrollView, ActivityIndicator, Text } from 'react-native';
import { EventCard, EmptyEvents } from '@/components/Events';
import { Header } from '@/components/Header';
import { useEvents } from '@/hooks/useEvents';
import { styles } from './styles';

export function Home() {
  const { data: events, isLoading } = useEvents();

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Eventos Disponíveis</Text>
        
        <View style={styles.eventsContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#0284C7" />
              <Text style={styles.loadingText}>Carregando eventos...</Text>
            </View>
          ) : !events?.length ? (
            <EmptyEvents />
          ) : (
            events.map(event => (
              <EventCard 
                key={event.id} 
                event={event}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}