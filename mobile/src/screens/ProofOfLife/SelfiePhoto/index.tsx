import { useState } from 'react';
import { View, Text, SafeAreaView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CameraPreview } from '@/components/CameraPreview';
import { Button } from '@/components/Button';
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
  const { documentPhoto, event } = route.params;

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

      await createProofOfLife({
        documentPhoto,
        selfiePhoto: { uri: photo },
        eventId: event.id
      });

      navigation.navigate('submissionSuccess');
    } catch (error: any) {
      console.error('Error submitting proof of life:', error);
      Alert.alert(
        'Erro',
        error.message || 'Erro ao enviar prova de vida. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Selfie</Text>
        <Text style={styles.subtitle}>
          Posicione seu rosto dentro da área indicada e mantenha uma expressão neutra
        </Text>
      </View>

      <View style={styles.cameraContainer}>
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
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar'}
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
}