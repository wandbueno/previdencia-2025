import { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Camera as ExpoCamera, CameraType, requestCameraPermissionsAsync, getCameraPermissionsAsync } from 'expo-camera';
import { Image } from 'react-native';
import { Button } from '../Button';
import { styles } from './styles';

interface CameraProps {
  photo?: string;
  onCapture: (photo: { uri: string }) => void;
  onRetake?: () => void;
  frontCamera?: boolean;
  showGuides?: boolean;
  guideText?: string;
  guideBorderRadius?: number;
}

export function Camera({ 
  photo, 
  onCapture, 
  onRetake, 
  frontCamera = false,
  showGuides = false,
  guideText,
  guideBorderRadius = 8
}: CameraProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const cameraRef = useRef<ExpoCamera>(null);

  useEffect(() => {
    (async () => {
      const { status: existingStatus } = await getCameraPermissionsAsync();
      
      if (existingStatus === 'granted') {
        setHasPermission(true);
        return;
      }

      const { status } = await requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0284C7" />
        <Text style={styles.text}>Verificando permissões da câmera...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Sem acesso à câmera</Text>
        <Text style={[styles.text, styles.subText]}>
          Permita o acesso à câmera nas configurações do seu dispositivo para continuar.
        </Text>
      </View>
    );
  }

  async function handleTakePhoto() {
    if (cameraRef.current && cameraReady) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          skipProcessing: true
        });
        onCapture(photo);
      } catch (error) {
        console.error('Error taking photo:', error);
      }
    }
  }

  if (photo) {
    return (
      <View style={styles.previewContainer}>
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
    <View style={styles.container}>
      <ExpoCamera 
        ref={cameraRef}
        style={styles.camera} 
        type={frontCamera ? CameraType.front : CameraType.back}
        onCameraReady={() => setCameraReady(true)}
      >
        {showGuides && (
          <View style={styles.guideOverlay}>
            <View style={[
              styles.guideBox,
              { borderRadius: guideBorderRadius }
            ]}>
              {guideText && (
                <Text style={styles.guideText}>{guideText}</Text>
              )}
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.captureButton,
              !cameraReady && styles.captureButtonDisabled
            ]}
            onPress={handleTakePhoto}
            disabled={!cameraReady}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </ExpoCamera>
    </View>
  );
}