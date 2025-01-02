// mobile/src/screens/SelectOrganization/styles.ts
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
  list: {
    paddingBottom: 24,
    gap: 12
  },
  organizationButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  organizationButtonSelected: {
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF'
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
  }
});
