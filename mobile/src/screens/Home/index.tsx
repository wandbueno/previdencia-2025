import { View, ScrollView, ActivityIndicator, Text, RefreshControl } from 'react-native';
import { EventCard, EmptyEvents } from '@/components/Events';
import { Header } from '@/components/Header';
import { useEvents } from '@/hooks/useEvents';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from './styles';

export function Home() {
  const { data: events, isLoading, refetch } = useEvents();

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={['#0284C7']}
            tintColor="#0284C7"
          />
        }
      >
        <View style={styles.headerSection}>
          <Text style={styles.sectionTitle}>Eventos Disponíveis</Text>
          <MaterialIcons name="event-available" size={24} color="#0284C7" />
        </View>
        
        <View style={styles.eventsContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0284C7" />
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