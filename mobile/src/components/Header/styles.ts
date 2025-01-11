// mobile/src/components/Header/styles.ts
import { StyleSheet, Platform, StatusBar } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  content: {
    padding: 16, // Reduced from 24 to 16
    paddingTop: 8, // Added to reduce top spacing
    paddingBottom: 12, // Added to maintain good bottom spacing
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
    marginTop: 2 // Reduced from 4 to 2
  }
});
