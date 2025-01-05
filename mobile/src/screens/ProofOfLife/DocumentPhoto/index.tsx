import { useState } from 'react';
import { View, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CameraPreview } from '@/components/CameraPreview';
import { Button } from '@/components/Button';
import { styles } from './styles';
import type { RootStackScreenProps } from '@/types/navigation';

type DocumentPhotoNavigationProp = RootStackScreenProps<'documentPhoto'>['navigation'];
type DocumentPhotoRouteProp = RootStackScreenProps<'documentPhoto'>['route'];

export function DocumentPhoto() {
  const [photo, setPhoto] = useState<string>();
  const navigation = useNavigation<DocumentPhotoNavigationProp>();
  const route = useRoute<DocumentPhotoRouteProp>();
  const { event } = route.params;

  function handleCapture(result: { uri: string }) {
    setPhoto(result.uri);
  }

  function handleRetake() {
    setPhoto(undefined);
  }

  function handleContinue() {
    if (photo) {
      navigation.navigate('selfiePhoto', { 
        documentPhoto: { uri: photo },
        event 
      });
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Documento de Identificação</Text>
      <Text style={styles.subtitle}>
        Posicione seu documento dentro da área indicada
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