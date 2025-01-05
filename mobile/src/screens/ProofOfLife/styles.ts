import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC'
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between'
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    color: '#1E293B',
    marginBottom: 24
  },
  info: {
    flex: 1,
    marginBottom: 24
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 16
  },
  requirements: {
    marginBottom: 24
  },
  requirement: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 8
  },
  warning: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center'
  }
});