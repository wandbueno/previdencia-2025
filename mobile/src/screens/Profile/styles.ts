import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC'
  },
  content: {
    flex: 1,
    padding: 24
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  field: {
    marginBottom: 16
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4
  },
  value: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#1E293B'
  },
  noServices: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#94A3B8',
    fontStyle: 'italic'
  }
});