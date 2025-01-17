import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
    padding: 24
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
  organizationInfo: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16
  },
  organizationName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#1E293B'
  },
  organizationLocation: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B',
    marginTop: 4
  },
  error: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center'
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    gap: 8
  },
  logo: {
    height: 24,
    width: 120
  },
  version: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B'
  }
});