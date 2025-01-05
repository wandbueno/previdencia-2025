// src/constants/event.ts
import { EventType, EventStatus } from '@/types/event';

export const EVENT_TYPES: Record<EventType, string> = {
  PROOF_OF_LIFE: 'Prova de Vida',
  RECADASTRATION: 'Recadastramento'
};

export const EVENT_ICONS: Record<EventType, string> = {
  PROOF_OF_LIFE: 'camera',
  RECADASTRATION: 'description'
};

export const EVENT_STATUS_CONFIG: Record<EventStatus, { label: string, color: string }> = {
  PENDING: { label: 'Pendente', color: '#F59E0B' },
  SUBMITTED: { label: 'Em Análise', color: '#3B82F6' },
  APPROVED: { label: 'Aprovado', color: '#10B981' },
  REJECTED: { label: 'Rejeitado', color: '#EF4444' }
};
