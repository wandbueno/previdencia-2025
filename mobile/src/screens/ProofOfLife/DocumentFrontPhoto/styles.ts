import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
    padding: 24,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: '#1E293B',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
  },
  instructionContainer: {
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: '#FEF9C3', // Amarelo claro para destaque
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF08A',
  },
  instructionText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#854D0E', // Marrom escuro para contraste
    lineHeight: 22,
  },
  preview: {
    flex: 1,
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  footer: {
    marginTop: 'auto',
  },
});