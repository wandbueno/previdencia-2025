import { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '@/components/Button';
import { styles } from './styles';
import { RootStackScreenProps } from '@/types/navigation';

type ProofOfLifeNavigationProp = RootStackScreenProps<'proofOfLife'>['navigation'];
type ProofOfLifeRouteProp = RootStackScreenProps<'proofOfLife'>['route'];

export function ProofOfLife() {
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const navigation = useNavigation<ProofOfLifeNavigationProp>();
  const route = useRoute<ProofOfLifeRouteProp>();
  const { event } = route.params;

  async function handleStart() {
    try {
      setIsRequestingPermission(true);
      
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status === 'granted') {
        navigation.navigate('documentPhoto', { event });
      } else {
        Alert.alert(
          'Permissão necessária',
          'Para realizar a prova de vida, é necessário permitir o acesso à câmera.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      Alert.alert(
        'Erro',
        'Não foi possível acessar a câmera. Por favor, tente novamente.'
      );
    } finally {
      setIsRequestingPermission(false);
    }
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

        <Button 
          onPress={handleStart}
          loading={isRequestingPermission}
        >
          Iniciar Prova de Vida
        </Button>
      </View>
    </View>
  );
}