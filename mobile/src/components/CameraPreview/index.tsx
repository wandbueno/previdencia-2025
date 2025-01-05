import { View, Image } from 'react-native';
import { Button } from '../Button';
import * as ImagePicker from 'expo-image-picker';
import { styles } from './styles';

interface CameraPreviewProps {
  photo?: string;
  onCapture: (photo: { uri: string }) => void;
  onRetake?: () => void;
  frontCamera?: boolean;
  allowGallery?: boolean;
}

export function CameraPreview({ 
  photo, 
  onCapture, 
  onRetake, 
  frontCamera,
  allowGallery 
}: CameraPreviewProps) {
  async function handleTakePhoto() {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: frontCamera ? [1, 1] : [4, 3],
        quality: 0.7,
        cameraType: frontCamera ? 
          ImagePicker.CameraType.front : 
          ImagePicker.CameraType.back
      });

      if (!result.canceled && result.assets[0]) {
        onCapture({ uri: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  }

  async function handlePickImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: frontCamera ? [1, 1] : [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        onCapture({ uri: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  }

  return (
    <View style={styles.container}>
      {photo ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photo }} style={styles.preview} />
          <View style={styles.buttonContainer}>
            <Button onPress={onRetake}>
              Tirar nova foto
            </Button>
          </View>
        </View>
      ) : (
        <View style={styles.placeholderContainer}>
          <View style={styles.placeholder} />
          <View style={styles.buttonContainer}>
            <Button onPress={handleTakePhoto}>
              Tirar foto
            </Button>
            {allowGallery && (
              <Button 
                onPress={handlePickImage}
                style={{ marginTop: 12 }}
              >
                Escolher da galeria
              </Button>
            )}
          </View>
        </View>
      )}
    </View>
  );
}