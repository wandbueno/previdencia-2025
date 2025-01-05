import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC'
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center'
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32
  }
});