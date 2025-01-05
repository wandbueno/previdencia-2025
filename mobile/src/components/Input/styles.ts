import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    gap: 4
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#1E293B'
  },
  input: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#1E293B'
  },
  inputError: {
    borderColor: '#EF4444'
  },
  error: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4
  }
});