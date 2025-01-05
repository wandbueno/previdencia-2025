// src/screens/Home/styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC'
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    paddingTop: 64,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  greeting: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: '#1E293B'
  },
  organization: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B',
    marginTop: 4
  },
  content: {
    flex: 1
  },
  contentContainer: {
    padding: 24
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 16
  },
  eventsContainer: {
    gap: 16
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center'
  }
});
