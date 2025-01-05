import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const frameWidth = width * 0.8;
const frameHeight = frameWidth * 0.63; // Proporção de um RG/CNH (aspect ratio)

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  camera: {
    flex: 1
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 24
  },
  header: {
    alignItems: 'center',
    marginTop: 48
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 8
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center'
  },
  frame: {
    width: frameWidth,
    height: frameHeight,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignSelf: 'center',
    marginTop: 48,
    borderRadius: 8
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 24
  },
  text: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24
  }
});