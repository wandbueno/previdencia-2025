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
    textAlign: 'center'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  reviewLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B'
  },
  reviewValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#1E293B',
    marginTop: 2
  },
  reviewerName: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2
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
  eventInfo: {
    marginTop: 12
  },
  eventTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#1E293B'
  },
  timelineComments: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 8
  },
  timelineCommentsText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B'
  },
  viewHistoryButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center'
  },
  viewHistoryText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#0284C7'
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
    height: '80%',
    padding: 24,
    paddingBottom: 0
  },
  modalTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#1E293B',
    textAlign: 'center'
  },
  modalSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24
  },
  timeline: {
    flex: 1
  },
  timelineEntry: {
    flexDirection: 'row',
    marginBottom: 24,
    position: 'relative'
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  timelineIconText: {
    fontSize: 16
  },
  timelineContent: {
    flex: 1
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  timelineAction: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14
  },
  timelineDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B'
  },
  timelineReviewer: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 4
  },
  timelineConnector: {
    position: 'absolute',
    left: 16,
    top: 32,
    bottom: -8,
    width: 1,
    backgroundColor: '#E2E8F0'
  },
  closeButton: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0'
  },
  
});