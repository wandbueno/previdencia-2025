import { View, Text, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '@/components/Button';
import { styles } from './styles';
import { RootStackParamList, RootStackScreenProps } from '@/types/navigation';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';

type ProofOfLifeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'proofOfLife'>;

export function ProofOfLife({ route }: RootStackScreenProps<'proofOfLife'>) {
  const navigation = useNavigation<ProofOfLifeNavigationProp>();
  const { event } = route.params;
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  function handleAcceptTerms() {
    Alert.alert(
      'Termos de Uso',
      'Ao prosseguir, você concorda em fornecer suas informações e imagens para fins de prova de vida.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Aceitar',
          onPress: () => {
            setHasAcceptedTerms(true);
            navigation.navigate('documentPhoto');
          }
        }
      ]
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{event.title}</Text>
        
        <View style={styles.info}>
          <Text style={styles.description}>
            Para realizar sua prova de vida, você precisará:
          </Text>

          <View style={styles.requirements}>
            <Text style={styles.requirement}>
              • Tirar uma foto do seu documento de identificação (RG ou CNH)
            </Text>
            <Text style={styles.requirement}>
              • Tirar uma selfie
            </Text>
          </View>

          <Text style={styles.warning}>
            Certifique-se de estar em um ambiente bem iluminado e que as fotos estejam nítidas.
          </Text>
        </View>

        <Button onPress={handleAcceptTerms}>
          Iniciar Prova de Vida
        </Button>
      </View>
    </View>
  );
}
