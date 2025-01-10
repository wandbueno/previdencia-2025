import { View, Text } from 'react-native';
import { formatDate } from '@/utils/date';
import { styles } from './styles';
import { Submission } from '@/types/submission';

interface ProofTimelineProps {
  event: Submission;
}

export function ProofTimeline({ event }: ProofTimelineProps) {
  const statusColors = {
    PENDING: '#F59E0B',
    SUBMITTED: '#3B82F6',
    APPROVED: '#10B981',
    REJECTED: '#EF4444'
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View 
          style={[
            styles.statusDot,
            { backgroundColor: statusColors[event.status] }
          ]}
        />
        <Text style={styles.eventTitle}>{event.eventTitle}</Text>
      </View>

      <View style={styles.timeline}>
        {/* Envio */}
        <View style={styles.timelineItem}>
          <View 
            style={[
              styles.timelineDot,
              { backgroundColor: '#3B82F6' }
            ]} 
          />
          <View>
            <Text style={styles.title}>
              Prova de Vida Enviada
            </Text>
            <Text style={styles.date}>
              {formatDate(event.submittedAt)}
            </Text>
          </View>
        </View>

        {/* Análise */}
        {event.status !== 'PENDING' && event.reviewedAt && (
          <View style={styles.timelineItem}>
            <View 
              style={[
                styles.timelineDot,
                { backgroundColor: statusColors[event.status] }
              ]} 
            />
            <View>
              <Text style={styles.title}>
                {event.status === 'APPROVED' ? 'Aprovada' : 'Rejeitada'}
                {event.reviewedBy && ` por ${event.reviewedBy.name}`}
              </Text>
              <Text style={styles.date}>
                {formatDate(event.reviewedAt)}
              </Text>
              {event.comments && (
                <Text style={styles.comments}>
                  "{event.comments}"
                </Text>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}