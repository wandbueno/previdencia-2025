import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardDisabled: {
    opacity: 0.8,
    backgroundColor: '#F8FAFC',
  },
  content: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#1E293B',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  info: {
    gap: 8,
  },
  type: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#64748B',
  },
  dates: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  dateLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#1E293B',
    marginRight: 4,
  },
  dateText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B',
  },
  remaining: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#0284C7',
  },
  statusMessage: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#3B82F6',
    fontStyle: 'italic',
  },
  statusMessageError: {
    color: '#EF4444',
  },
  statusMessageSuccess: {
    color: '#10B981',
  },
  statusMessageInfo: {
    color: '#64748B',
  }
});