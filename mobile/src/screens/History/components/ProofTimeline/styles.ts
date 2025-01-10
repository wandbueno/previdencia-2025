import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  eventTitle: {
    marginLeft: 8,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#1E293B',
  },
  timeline: {
    marginLeft: 6,
    borderLeftWidth: 2,
    borderLeftColor: '#E2E8F0',
    paddingLeft: 16,
    marginTop: 16,
  },
  timelineItem: {
    position: 'relative',
    marginBottom: 24,
  },
  timelineDot: {
    position: 'absolute',
    left: -22,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  title: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#1E293B',
  },
  date: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  comments: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#475569',
    fontStyle: 'italic',
    marginTop: 8,
  },
});