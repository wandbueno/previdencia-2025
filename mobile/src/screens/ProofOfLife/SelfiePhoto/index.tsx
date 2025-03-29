import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CameraPreview } from '@/components/CameraPreview';
import { Button } from '@/components/Button';
import { Feather } from '@expo/vector-icons';
import { createProofOfLife } from '@/services';
import { styles } from './styles';
import type { RootStackScreenProps } from '@/types/navigation';

type SelfiePhotoNavigationProp = RootStackScreenProps<'selfiePhoto'>['navigation'];
type SelfiePhotoRouteProp = RootStackScreenProps<'selfiePhoto'>['route'];

export function SelfiePhoto() {
  const [photo, setPhoto] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigation = useNavigation<SelfiePhotoNavigationProp>();
  const route = useRoute<SelfiePhotoRouteProp>();
  const { event, documentFrontPhoto, documentBackPhoto, cpfPhoto } = route.params;

  function handleCapture(result: { uri: string }) {
    setPhoto(result.uri);
  }

  function handleRetake() {
    setPhoto(undefined);
  }

  async function handleSubmit() {
    if (!photo) return;

    try {
      setIsSubmitting(true);
      console.log('Submitting proof of life...', {
        documentFrontPhoto,
        documentBackPhoto,
        cpfPhoto,
        selfiePhoto: { uri: photo },
        eventId: event.id,
      });

      await createProofOfLife({
        documentFrontPhoto,
        documentBackPhoto,
        cpfPhoto,
        selfiePhoto: { uri: photo },
        eventId: event.id,
      });

      navigation.navigate('submissionSuccess');
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao enviar as fotos. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleGoBack() {
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={handleGoBack}
        style={styles.backButton}
      >
        <Feather name="chevron-left" size={24} color="#1E293B" />
      </TouchableOpacity>

      <Text style={styles.title}>Selfie</Text>
      <Text style={styles.subtitle}>
        Tire uma foto do seu rosto olhando diretamente para a câmera
      </Text>

      <View style={styles.preview}>
        <CameraPreview
          photo={photo}
          onCapture={handleCapture}
          onRetake={handleRetake}
          frontCamera={true}
        />
      </View>

      {photo && (
        <View style={styles.footer}>
          <Button 
            onPress={handleSubmit}
            loading={isSubmitting}
          >
            Finalizar
          </Button>
        </View>
      )}
    </View>
  );
}