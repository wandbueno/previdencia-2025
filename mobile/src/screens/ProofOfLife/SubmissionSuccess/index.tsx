import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '@/components/Button';
import { styles } from './styles';

export function SubmissionSuccess() {
  const navigation = useNavigation();

  function handleGoHome() {
    navigation.navigate('home');
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