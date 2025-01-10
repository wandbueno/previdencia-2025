export const EVENT_TYPES = {
  PROOF_OF_LIFE: 'Prova de Vida',
  RECADASTRATION: 'Recadastramento'
} as const;

export const EVENT_STATUS_CONFIG = {
  PENDING: { label: 'Pendente', color: '#F59E0B' },
  SUBMITTED: { label: 'Em Análise', color: '#3B82F6' },
  APPROVED: { label: 'Aprovado', color: '#10B981' },
  REJECTED: { label: 'Rejeitado', color: '#EF4444' }
} as const;