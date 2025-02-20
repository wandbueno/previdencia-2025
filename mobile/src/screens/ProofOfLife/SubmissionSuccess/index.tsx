// mobile/src/screens/ProofOfLife/SubmissionSuccess/index.tsx
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '@/components/Button';
import { styles } from './styles';
import type { RootStackScreenProps } from '@/types/navigation';

type SubmissionSuccessNavigationProp = RootStackScreenProps<'submissionSuccess'>['navigation'];

export function SubmissionSuccess() {
  const navigation = useNavigation<SubmissionSuccessNavigationProp>();

  function handleGoHome() {
    // Navigate to main tab and then to home screen
    navigation.reset({
      index: 0,
      routes: [{ name: 'main' }]
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Prova de Vida Enviada!</Text>
        
        <Text style={styles.description}>
          Suas informações foram enviadas com sucesso e serão analisadas em breve.
          Você pode acompanhar o status da sua prova de vida na aba "Histórico".
        </Text>

        <Button onPress={handleGoHome}>
          Voltar para o Início
        </Button>
      </View>
    </View>
  );
}
