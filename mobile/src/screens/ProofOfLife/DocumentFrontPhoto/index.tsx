// mobile/src/screens/ProofOfLife/DocumentFrontPhoto/index.tsx
import { useState } from 'react';
import { View, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CameraPreview } from '@/components/CameraPreview';
import { Button } from '@/components/Button';
import { styles } from './styles';
import type { RootStackScreenProps } from '@/types/navigation';

type DocumentFrontPhotoNavigationProp = RootStackScreenProps<'documentFrontPhoto'>['navigation'];
type DocumentFrontPhotoRouteProp = RootStackScreenProps<'documentFrontPhoto'>['route'];

export function DocumentFrontPhoto() {
  const [photo, setPhoto] = useState<string>();
  const navigation = useNavigation<DocumentFrontPhotoNavigationProp>();
  const route = useRoute<DocumentFrontPhotoRouteProp>();
  const { event } = route.params;

  function handleCapture(result: { uri: string }) {
    setPhoto(result.uri);
  }

  function handleRetake() {
    setPhoto(undefined);
  }

  function handleContinue() {
    if (photo) {
      navigation.navigate('documentBackPhoto', { 
        documentFrontPhoto: { uri: photo },
        event 
      });
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Frente do Documento</Text>
      <Text style={styles.subtitle}>
        Posicione a frente do documento dentro da área indicada
      </Text>

      <View style={styles.preview}>
        <CameraPreview
          photo={photo}
          onCapture={handleCapture}
          onRetake={handleRetake}
          frontCamera={false}
          allowGallery={true}
        />
      </View>

      {photo && (
        <View style={styles.footer}>
          <Button onPress={handleContinue}>
            Continuar
          </Button>
        </View>
      )}
    </View>
  );
}