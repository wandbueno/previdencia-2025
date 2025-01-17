import { useState, useRef, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { Image } from 'react-native';
import { Button } from '../Button';
import { styles } from './styles';

interface CameraPreviewProps {
  photo?: string;
  onCapture: (photo: { uri: string }) => void;
  onRetake?: () => void;
  frontCamera?: boolean;
}

export function CameraPreview({ 
  photo, 
  onCapture, 
  onRetake, 
  frontCamera = false
}: CameraPreviewProps) {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [type] = useState(frontCamera ? CameraType.front : CameraType.back);
  const [cameraReady, setCameraReady] = useState(false);
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    requestPermission();
  }, []);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Verificando permissões da câmera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Sem acesso à câmera</Text>
        <Button onPress={requestPermission}>
          Permitir acesso
        </Button>
      </View>
    );
  }

  async function takePicture() {
    if (cameraRef.current && cameraReady) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          skipProcessing: true
        });
        onCapture(photo);
      } catch (error) {
        console.error('Error taking picture:', error);
      }
    }
  }

  if (photo) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photo }} style={styles.preview} />
        <View style={styles.buttonContainer}>
          <Button onPress={onRetake}>
            Tirar nova foto
          </Button>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={type}
        onCameraReady={() => setCameraReady(true)}
      >
        <View style={styles.overlay}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.captureButton, !cameraReady && styles.captureButtonDisabled]}
              onPress={takePicture}
              disabled={!cameraReady}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>
        </View>
      </Camera>
    </SafeAreaView>
  );
}