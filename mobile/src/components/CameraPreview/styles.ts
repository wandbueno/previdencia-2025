import { StyleSheet } from 'react-native';

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
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 0,
  },
});