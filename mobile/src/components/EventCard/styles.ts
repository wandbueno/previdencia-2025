// src/components/EventCard/styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#1E293B',
    flex: 1,
    marginRight: 12
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  badgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12
  },
  type: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12
  },
  dates: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  dateLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#1E293B',
    marginRight: 4
  },
  dateText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B'
  },
  remaining: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#0284C7'
  }
});
