import { useState } from 'react';
import { View, Text } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button } from '@/components/Button';
import { api } from '@/lib/api';
import { styles } from './styles';

type RouteParams = {
  documentPhoto: {
    uri: string;
  };
}

export function SelfiePhoto() {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [camera, setCamera] = useState<Camera | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { documentPhoto } = route.params as RouteParams;

  async function handleSubmit(selfieUri: string) {
    try {
      setIsSubmitting(true);

      // Upload document photo
      const documentFormData = new FormData();
      documentFormData.append('file', {
        uri: documentPhoto.uri,
        type: 'image/jpeg',
        name: 'document.jpg'
      } as any);

      const documentResponse = await api.post('/upload/document', documentFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Upload selfie photo
      const selfieFormData = new FormData();
      selfieFormData.append('file', {
        uri: selfieUri,
        type: 'image/jpeg',
        name: 'selfie.jpg'
      } as any);

      const selfieResponse = await api.post('/upload/selfie', selfieFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Create proof of life submission
      await api.post('/proof-of-life', {
        documentUrl: documentResponse.data.file.path,
        selfieUrl: selfieResponse.data.file.path
      });

      navigation.navigate('submissionSuccess');
    } catch (error) {
      console.error('Error submitting proof of life:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleTakePhoto() {
    if (!camera) return;

    try {
      const photo = await camera.takePictureAsync({
        quality: 0.7,
        skipProcessing: true
      });

      await handleSubmit(photo.uri);
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  }

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          Precisamos de sua permissão para usar a câmera
        </Text>
        <Button onPress={requestPermission}>
          Permitir Câmera
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={setCamera}
        style={styles.camera}
        type={CameraType.front}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.title}>Selfie</Text>
            <Text style={styles.subtitle}>
              Posicione seu rosto dentro da área indicada
            </Text>
          </View>

          <View style={styles.frame} />

          <View style={styles.footer}>
            <Button 
              onPress={handleTakePhoto}
              loading={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Tirar Foto'}
            </Button>
          </View>
        </View>
      </Camera>
    </View>
  );
}