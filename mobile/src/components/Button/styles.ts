// mobile/src/components/Button/styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    height: 48,
    backgroundColor: '#0284C7',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginVertical: 12,
  },
  secondary: {
    backgroundColor: '#E2E8F0',
  },
  disabled: {
    backgroundColor: '#94A3B8'
  },
  text: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF'
  },
  secondaryText: {
    color: '#1E293B'
  }
});
