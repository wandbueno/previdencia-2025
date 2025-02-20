import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    gap: 4
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#1E293B'
  },
  select: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center'
  },
  selectError: {
    borderColor: '#EF4444'
  },
  picker: {
    flex: 1,
    marginLeft: 8
  },
  placeholder: {
    color: '#94A3B8',
    fontFamily: 'Inter_400Regular'
  },
  option: {
    color: '#1E293B',
    fontFamily: 'Inter_400Regular'
  },
  selectedOption: {
    fontFamily: 'Inter_500Medium',
    color: '#0284C7'
  },
  checkIcon: {
    marginRight: 12
  },
  error: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4
  }
});