import { View, Text } from 'react-native';
import { ProofOfLifeSubmission, RecadastrationSubmission } from '@/types/submission';
import { formatDate } from '@/utils/date';
import { styles } from './styles';

interface SubmissionCardProps {
  submission: ProofOfLifeSubmission | RecadastrationSubmission;
}

export function SubmissionCard({ submission }: SubmissionCardProps) {
  const statusColors = {
    PENDING: '#F59E0B',
    APPROVED: '#10B981',
    REJECTED: '#EF4444'
  };

  const statusLabels = {
    PENDING: 'Pendente',
    APPROVED: 'Aprovado',
    REJECTED: 'Rejeitado'
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.date}>
          {formatDate(submission.createdAt)}
        </Text>
        <View 
          style={[
            styles.badge,
            { backgroundColor: `${statusColors[submission.status]}20` }
          ]}
        >
          <Text 
            style={[
              styles.badgeText,
              { color: statusColors[submission.status] }
            ]}
          >
            {statusLabels[submission.status]}
          </Text>
        </View>
      </View>

      {submission.reviewedAt && (
        <View style={styles.reviewInfo}>
          <Text style={styles.reviewLabel}>Revisado em:</Text>
          <Text style={styles.reviewValue}>
            {formatDate(submission.reviewedAt)}
          </Text>
        </View>
      )}

      {submission.comments && (
        <View style={styles.comments}>
          <Text style={styles.commentsLabel}>Observações:</Text>
          <Text style={styles.commentsText}>{submission.comments}</Text>
        </View>
      )}
    </View>
  );
}