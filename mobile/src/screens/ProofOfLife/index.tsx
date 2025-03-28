import { useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { styles } from './styles';
import { RootStackScreenProps } from '@/types/navigation';
import { 
  CreditCard, 
  FileText, 
  Camera, 
  AlertTriangle,
  FlipHorizontal,
  UserSquare2
} from 'lucide-react-native';

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
        navigation.navigate('documentFrontPhoto', { event });
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
      <Header />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Como funciona?</Text>
          
          <View style={styles.steps}>
            <View style={styles.step}>
              <View style={styles.stepIcon}>
                <CreditCard size={24} color="#0284C7" />
              </View>
              <Text style={styles.stepText}>
                Envie uma foto da frente do seu documento de identificação (RG ou CNH)
              </Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepIcon}>
                <FlipHorizontal size={24} color="#0284C7" />
              </View>
              <Text style={styles.stepText}>
                Envie uma foto do verso do seu documento de identificação (RG ou CNH)
              </Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepIcon}>
                <FileText size={24} color="#0284C7" />
              </View>
              <Text style={styles.stepText}>
                Envie uma foto do seu CPF
              </Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepIcon}>
                <UserSquare2 size={24} color="#0284C7" />
              </View>
              <Text style={styles.stepText}>
                Por fim, tire uma selfie olhando diretamente para a câmera
              </Text>
            </View>
          </View>

          <View style={styles.alert}>
            <AlertTriangle size={20} color="#F59E0B" />
            <Text style={styles.alertText}>
              Certifique-se de estar em um ambiente bem iluminado e que as fotos estejam nítidas e legíveis.
            </Text>
          </View>
        </View>

        <Button 
          onPress={handleStart}
          loading={isRequestingPermission}
        >
          Iniciar Prova de Vida
        </Button>
      </ScrollView>
    </View>
  );
}
