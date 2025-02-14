import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },
  previewContainer: {
    flex: 1,
  },
  preview: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderContainer: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  placeholderImage: {
    width: screenWidth * 0.95,
    height: screenHeight * 0.7,
    transform: [{ rotate: '-90deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 0,
  },
});