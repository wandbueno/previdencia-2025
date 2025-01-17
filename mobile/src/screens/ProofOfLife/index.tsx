import { useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Camera } from 'expo-camera';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { styles } from './styles';
import { RootStackScreenProps } from '@/types/navigation';
import { FileText, Camera as CameraIcon, AlertTriangle } from 'lucide-react-native';

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
      
      const { status } = await Camera.requestCameraPermissionsAsync();
      
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
      <Header />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Como funciona?</Text>
          
          <View style={styles.steps}>
            <View style={styles.step}>
              <View style={styles.stepIcon}>
                <FileText size={24} color="#0284C7" />
              </View>
              <Text style={styles.stepText}>
                Tire uma foto do seu documento de identificação (RG ou CNH)
              </Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepIcon}>
                <CameraIcon size={24} color="#0284C7" />
              </View>
              <Text style={styles.stepText}>
                Tire uma selfie para confirmar sua identidade
              </Text>
            </View>
          </View>

          <View style={styles.alert}>
            <AlertTriangle size={20} color="#F59E0B" />
            <Text style={styles.alertText}>
              Certifique-se de estar em um ambiente bem iluminado e que as fotos estejam nítidas
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