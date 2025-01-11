import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { useState } from 'react';
import { ProofOfLifeSubmission, RecadastrationSubmission } from '@/types/submission';
import { formatDate } from '@/utils/date';
import { styles } from './styles';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface SubmissionCardProps {
  submission: ProofOfLifeSubmission | RecadastrationSubmission;
}

interface HistoryEntry {
  id: string;
  action: 'SUBMITTED' | 'RESUBMITTED' | 'APPROVED' | 'REJECTED';
  comments?: string;
  reviewer_name?: string;
  created_at: string;
}

export function SubmissionCard({ submission }: SubmissionCardProps) {
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

  const { data: history } = useQuery<HistoryEntry[]>({
    queryKey: ['proof-history', submission.id],
    queryFn: async () => {
      const response = await api.get(`/proof-of-life/${submission.id}/history`);
      return response.data;
    },
    enabled: isHistoryVisible
  });

  const statusColors = {
    PENDING: '#F59E0B',
    SUBMITTED: '#3B82F6',
    APPROVED: '#10B981',
    REJECTED: '#EF4444'
  };

  const statusLabels = {
    PENDING: 'Pendente',
    SUBMITTED: 'Em Análise',
    APPROVED: 'Aprovado',
    REJECTED: 'Rejeitado'
  };

  const actionLabels = {
    SUBMITTED: 'Enviado',
    RESUBMITTED: 'Reenviado',
    APPROVED: 'Aprovado',
    REJECTED: 'Rejeitado'
  };

  // Pega apenas o último registro de cada tipo de ação
  const uniqueHistory = history?.reduce((acc, current) => {
    const existingEntry = acc.find(entry => entry.action === current.action);
    if (!existingEntry || new Date(current.created_at) > new Date(existingEntry.created_at)) {
      // Remove o registro antigo se existir
      const filtered = acc.filter(entry => entry.action !== current.action);
      // Adiciona o novo registro
      return [...filtered, current];
    }
    return acc;
  }, [] as HistoryEntry[]);

  // Ordena por data, mais recente primeiro
  const sortedHistory = uniqueHistory?.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <>
      <TouchableOpacity 
        style={styles.card}
        onPress={() => setIsHistoryVisible(true)}
      >
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
      </TouchableOpacity>

      <Modal
        visible={isHistoryVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsHistoryVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Histórico</Text>

            {sortedHistory?.map((entry) => (
              <View key={entry.id} style={styles.historyEntry}>
                <View style={styles.historyHeader}>
                  <Text style={[
                    styles.historyAction,
                    { color: entry.action === 'APPROVED' ? '#10B981' : 
                            entry.action === 'REJECTED' ? '#EF4444' : 
                            '#3B82F6' }
                  ]}>
                    {actionLabels[entry.action]}
                  </Text>
                  <Text style={styles.historyDate}>
                    {formatDate(entry.created_at)}
                  </Text>
                </View>

                {entry.reviewer_name && (
                  <Text style={styles.historyReviewer}>
                    por {entry.reviewer_name}
                  </Text>
                )}

                {entry.comments && (
                  <Text style={styles.historyComments}>
                    {entry.comments}
                  </Text>
                )}
              </View>
            ))}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsHistoryVisible(false)}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}