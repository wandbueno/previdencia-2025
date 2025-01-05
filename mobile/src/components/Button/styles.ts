import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    height: 48,
    backgroundColor: '#0284C7',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24, // Add horizontal padding
    marginVertical: 12, // Add vertical margin
  },
  disabled: {
    backgroundColor: '#94A3B8'
  },
  text: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF'
  }
});