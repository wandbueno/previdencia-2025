import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CameraPreview } from '@/components/CameraPreview';
import { Button } from '@/components/Button';
import { Feather } from '@expo/vector-icons';
import { styles } from './styles';
import type { RootStackScreenProps } from '@/types/navigation';

type CpfPhotoNavigationProp = RootStackScreenProps<'cpfPhoto'>['navigation'];
type CpfPhotoRouteProp = RootStackScreenProps<'cpfPhoto'>['route'];

export function CpfPhoto() {
  const [photo, setPhoto] = useState<string>();
  const navigation = useNavigation<CpfPhotoNavigationProp>();
  const route = useRoute<CpfPhotoRouteProp>();
  const { event, documentFrontPhoto, documentBackPhoto } = route.params;

  function handleCapture(result: { uri: string }) {
    setPhoto(result.uri);
  }

  function handleRetake() {
    setPhoto(undefined);
  }

  function handleContinue() {
    if (photo) {
      navigation.navigate('selfiePhoto', { 
        documentFrontPhoto,
        documentBackPhoto,
        cpfPhoto: { uri: photo },
        event 
      });
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

      <Text style={styles.title}>Foto do CPF</Text>
      <Text style={styles.subtitle}>
      Tire uma foto ou selecione da galeria o seu CPF.
      </Text>

      <View style={styles.preview}>
      <CameraPreview
        photo={photo}
        onCapture={handleCapture}
        onRetake={handleRetake}
        frontCamera={false}
        allowGallery={true}
        isCpfDocument={true}
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