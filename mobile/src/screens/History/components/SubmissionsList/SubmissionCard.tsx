import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useState } from 'react';
import { ProofOfLifeSubmission, RecadastrationSubmission } from '@/types/submission';
import { formatDateTime } from '@/utils/date';
import { styles } from './styles';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/Button';

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

  const { data: history, isLoading } = useQuery<HistoryEntry[]>({
    queryKey: ['proof-history', submission.id],
    queryFn: async () => {
      const response = await api.get(`/proof-of-life/history/${submission.id}`);
      return response.data;
    },
    enabled: isHistoryVisible // Só busca quando o modal estiver aberto
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

  const actionIcons = {
    SUBMITTED: '📤',
    RESUBMITTED: '🔄',
    APPROVED: '✅',
    REJECTED: '❌'
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.card}
        onPress={() => setIsHistoryVisible(true)}
      >
        {/* Título do evento como primeiro elemento, agora mais destacado */}
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>
            {submission.event.title}
          </Text>
          
          {/* Badge de status agora ao lado do título */}
          <View style={[
            styles.badge,
            { backgroundColor: `${statusColors[submission.status]}20` }
          ]}>
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

        {/* Informações de atualização abaixo do título */}
        <View style={styles.header}>
          <View>
            <Text style={styles.reviewLabel}>Última atualização:</Text>
            <Text style={styles.reviewValue}>
              {formatDateTime(submission.reviewedAt || submission.createdAt)}
            </Text>
            {submission.reviewedBy && (
              <Text style={styles.reviewerName}>
                por {submission.reviewedBy}
              </Text>
            )}
          </View>
        </View>

        {submission.comments && (
          <View style={styles.timelineComments}>
            <Text style={styles.timelineCommentsText}>
              {submission.comments}
            </Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.viewHistoryButton}
          onPress={() => setIsHistoryVisible(true)}
        >
          <Text style={styles.viewHistoryText}>Ver histórico completo</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      <Modal
        visible={isHistoryVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsHistoryVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Histórico da Prova de Vida</Text>
            <Text style={styles.modalSubtitle}>{submission.event.title}</Text>

            <ScrollView style={styles.timeline}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Carregando histórico...</Text>
                </View>
              ) : !history?.length ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Nenhum histórico encontrado</Text>
                </View>
              ) : (
                history.map((entry, index) => (
                  <View key={entry.id} style={styles.timelineEntry}>
                    <View style={styles.timelineIcon}>
                      <Text style={styles.timelineIconText}>
                        {actionIcons[entry.action]}
                      </Text>
                    </View>
                    
                    <View style={styles.timelineContent}>
                      <View style={styles.timelineHeader}>
                        <Text style={[
                          styles.timelineAction,
                          { color: entry.action === 'APPROVED' ? '#10B981' : 
                                  entry.action === 'REJECTED' ? '#EF4444' : 
                                  '#3B82F6' }
                        ]}>
                          {actionLabels[entry.action]}
                        </Text>
                        <Text style={styles.timelineDate}>
                          {formatDateTime(entry.created_at)}
                        </Text>
                      </View>

                      {entry.reviewer_name && (
                        <Text style={styles.timelineReviewer}>
                          Revisado por {entry.reviewer_name}
                        </Text>
                      )}

                      {entry.comments && (
                        <View style={styles.timelineComments}>
                          <Text style={styles.timelineCommentsText}>
                            {entry.comments}
                          </Text>
                        </View>
                      )}
                    </View>

                    {index < history.length - 1 && (
                      <View style={styles.timelineConnector} />
                    )}
                  </View>
                ))
              )}
            </ScrollView>

            <View style={styles.closeButton}>
              <Button onPress={() => setIsHistoryVisible(false)}>
                Fechar
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}