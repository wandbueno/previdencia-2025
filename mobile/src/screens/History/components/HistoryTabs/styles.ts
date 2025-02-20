import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 4,
    marginHorizontal: 24,
    marginTop: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6
  },
  activeTab: {
    backgroundColor: '#0284C7'
  },
  tabText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#64748B'
  },
  activeTabText: {
    color: '#FFFFFF'
  }
});