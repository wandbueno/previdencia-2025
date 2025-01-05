// mobile/src/screens/Login/styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
    padding: 24
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8F9FC',
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    alignItems: 'center',
    marginTop: 64,
    marginBottom: 48
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    color: '#1E293B'
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#64748B',
    marginTop: 8
  },
  form: {
    gap: 16
  },
  error: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center'
  }
});
