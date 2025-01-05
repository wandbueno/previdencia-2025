import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const frameSize = width * 0.8;

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
    width: frameSize,
    height: frameSize,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: frameSize / 2,
    alignSelf: 'center',
    marginTop: 48
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  text: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24
  }
});