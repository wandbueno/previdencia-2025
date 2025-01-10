import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Event } from '@/types/event';
import { EVENT_TYPES, EVENT_STATUS_CONFIG } from '@/constants/event';
import { formatDate, calculateDaysRemaining } from '@/utils/date';
import { styles } from './styles';
import type { RootStackScreenProps } from '@/types/navigation';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const navigation = useNavigation<RootStackScreenProps<'proofOfLife'>['navigation']>();
  const daysRemaining = calculateDaysRemaining(event.endDate);
  const statusConfig = event.status ? EVENT_STATUS_CONFIG[event.status] : undefined;
  
  // Só permite clicar se:
  // 1. O evento estiver ativo
  // 2. Ainda estiver dentro do prazo
  // 3. Status for PENDING ou REJECTED (pode enviar/reenviar)
  // 4. Não estiver em análise (SUBMITTED)
  const isClickable = event.active && 
    daysRemaining > 0 && 
    event.status !== 'SUBMITTED' && 
    event.status !== 'APPROVED';

  function handleEventPress() {
    if (!isClickable) return;

    if (event.type === 'PROOF_OF_LIFE') {
      navigation.navigate('proofOfLife', { event });
    }
  }

  return (
    <TouchableOpacity 
      style={[
        styles.card,
        !isClickable && styles.cardDisabled
      ]}
      onPress={handleEventPress}
      activeOpacity={isClickable ? 0.7 : 1}
      disabled={!isClickable}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{event.title}</Text>
          {event.type === 'PROOF_OF_LIFE' && statusConfig && (
            <View style={[styles.badge, { backgroundColor: statusConfig.color + '20' }]}>
              <Text style={[styles.badgeText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.info}>
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

        {event.type === 'PROOF_OF_LIFE' && (
          <>
            {event.status === 'SUBMITTED' && (
              <Text style={styles.statusMessage}>
                Aguardando análise da sua prova de vida
              </Text>
            )}
            
            {event.status === 'REJECTED' && (
              <Text style={[styles.statusMessage, styles.statusMessageError]}>
                Sua prova de vida foi rejeitada. Clique para enviar novamente.
              </Text>
            )}

            {event.status === 'APPROVED' && (
              <Text style={[styles.statusMessage, styles.statusMessageSuccess]}>
                Sua prova de vida foi aprovada!
              </Text>
            )}
          </>
        )}

        {daysRemaining <= 0 && (
          <Text style={[styles.statusMessage, styles.statusMessageInfo]}>
            Este evento foi encerrado
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}