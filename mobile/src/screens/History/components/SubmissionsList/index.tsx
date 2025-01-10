import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { useSubmissions } from '@/hooks/useSubmissions';
import { EmptySubmissions } from './EmptySubmissions';
import { ProofTimeline } from '../ProofTimeline';
import { styles } from './styles';

interface SubmissionsListProps {
  type: 'PROOF_OF_LIFE' | 'RECADASTRATION';
}

export function SubmissionsList({ type }: SubmissionsListProps) {
  const { data: submissions, isLoading } = useSubmissions(type);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#0284C7" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (!submissions?.length) {
    return <EmptySubmissions type={type} />;
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {submissions.map((submission) => (
        <View key={submission.id} style={styles.submissionCard}>
          <ProofTimeline event={submission} />
        </View>
      ))}
    </ScrollView>
  );
}