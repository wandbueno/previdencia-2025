import { View, Image } from 'react-native';
import { Button } from '../Button';
import * as ImagePicker from 'expo-image-picker';
import { DocumentOutline } from '../DocumentOutline';
import { DocumentBackOutline } from '../DocumentBackOutline';
import { SelfieOutline } from '../SelfieOutline';
import { styles } from './styles';

interface CameraPreviewProps {
  photo?: string;
  onCapture: (photo: { uri: string }) => void;
  onRetake?: () => void;
  frontCamera?: boolean;
  allowGallery?: boolean;
  isBackDocument?: boolean;
}

export function CameraPreview({ 
  photo, 
  onCapture, 
  onRetake, 
  frontCamera,
  allowGallery,
  isBackDocument = false
}: CameraPreviewProps) {
  async function handleTakePhoto() {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [3, 4],
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
        aspect: [3, 4],
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
      <View style={styles.placeholderContainer}>
        {photo ? (
          <View style={styles.preview}>
            <Image 
              source={{ uri: photo }} 
              style={styles.previewImage}
            />
          </View>
        ) : (
          <View style={styles.placeholder}>
            {frontCamera ? (
              <View style={styles.placeholderImage}>
                <SelfieOutline />
              </View>
            ) : (
              <View style={styles.placeholderImage}>
                {isBackDocument ? <DocumentBackOutline /> : <DocumentOutline />}
              </View>
            )}
          </View>
        )}
        <View style={styles.buttonContainer}>
          {photo ? (
            <Button 
              onPress={onRetake}
              variant="secondary"
              style={styles.secondaryButton}
            >
              Tirar nova foto
            </Button>
          ) : (
            <>
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
            </>
          )}
        </View>
      </View>
    </View>
  );
}