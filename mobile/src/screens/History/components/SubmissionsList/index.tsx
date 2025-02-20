import { View, Text, ActivityIndicator } from 'react-native';
import { useSubmissions } from '@/hooks/useSubmissions';
import { EmptySubmissions } from './EmptySubmissions';
import { SubmissionCard } from './SubmissionCard';
import { styles } from './styles';
import { ProofOfLifeSubmission, RecadastrationSubmission } from '@/types/submission';

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
    <View style={styles.container}>
      {submissions.map((submission) => (
        <SubmissionCard 
          key={submission.id} 
          submission={submission as ProofOfLifeSubmission | RecadastrationSubmission}
        />
      ))}
    </View>
  );
}