import { View, Text } from 'react-native';
import { styles } from './styles';

interface EmptySubmissionsProps {
  type: 'PROOF_OF_LIFE' | 'RECADASTRATION';
}

export function EmptySubmissions({ type }: EmptySubmissionsProps) {
  const message = type === 'PROOF_OF_LIFE'
    ? 'Você ainda não realizou nenhuma prova de vida'
    : 'Você ainda não realizou nenhum recadastramento';

  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}