// mobile/src/screens/ProofOfLife/DocumentPhoto/index.tsx
import { useState } from 'react';
import { View, Text } from 'react-native';
import { Camera } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { Button } from '@/components/Button';
import { styles } from './styles';
import { RootStackScreenProps } from '@/types/navigation';

type DocumentPhotoNavigationProp = RootStackScreenProps<'documentPhoto'>['navigation'];

export function DocumentPhoto() {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [cameraRef, setCameraRef] = useState<Camera | null>(null);
  const navigation = useNavigation<DocumentPhotoNavigationProp>();

  async function handleTakePhoto() {
    if (!cameraRef) return;

    try {
      const photo = await cameraRef.takePictureAsync({
        quality: 0.7,
        skipProcessing: true
      });

      navigation.navigate('selfiePhoto', { documentPhoto: photo });
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

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          Sem acesso à câmera
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
        ref={ref => setCameraRef(ref)}
        style={styles.camera}
        type={Camera.Constants.Type.back}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.title}>Documento de Identificação</Text>
            <Text style={styles.subtitle}>
              Posicione seu documento dentro da área indicada
            </Text>
          </View>

          <View style={styles.frame} />

          <View style={styles.footer}>
            <Button onPress={handleTakePhoto}>
              Tirar Foto
            </Button>
          </View>
        </View>
      </Camera>
    </View>
  );
}
