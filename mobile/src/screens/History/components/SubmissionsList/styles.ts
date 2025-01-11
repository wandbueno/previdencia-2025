import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B',
    marginTop: 8
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  date: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#1E293B'
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
  reviewInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  reviewLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#64748B',
    marginRight: 4
  },
  reviewValue: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#1E293B'
  },
  comments: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0'
  },
  commentsLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4
  },
  commentsText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#1E293B'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    maxHeight: '80%'
  },
  modalTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#1E293B',
    marginBottom: 16
  },
  historyEntry: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  historyAction: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14
  },
  historyDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B'
  },
  historyReviewer: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4
  },
  historyComments: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#1E293B',
    marginTop: 4
  },
  closeButton: {
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  closeButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#1E293B'
  }
});