import { View, Text } from 'react-native';
import { Event } from '@/types/event';
import { EVENT_TYPES, EVENT_STATUS_CONFIG } from '@/constants/event';
import { formatDate, calculateDaysRemaining } from '@/utils/date';
import { styles } from './styles';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const daysRemaining = calculateDaysRemaining(event.endDate);
  const statusConfig = EVENT_STATUS_CONFIG[event.status || 'PENDING'];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{event.title}</Text>
        <View style={[styles.badge, { backgroundColor: statusConfig.color + '20' }]}>
          <Text style={[styles.badgeText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      <Text style={styles.type}>{EVENT_TYPES[event.type]}</Text>

      <View style={styles.dates}>
        <Text style={styles.dateLabel}>Período:</Text>
        <Text style={styles.dateText}>
          {formatDate(event.startDate)} até {formatDate(event.endDate)}
        </Text>
      </View>

      {daysRemaining > 0 && (
        <Text style={styles.remaining}>
          {daysRemaining} dias restantes
        </Text>
      )}
    </View>
  );
}