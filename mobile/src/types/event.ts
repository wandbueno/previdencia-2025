// src/types/event.ts
export type EventType = 'PROOF_OF_LIFE' | 'RECADASTRATION';
export type EventStatus = 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface Event {
  id: string;
  type: EventType;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  active: boolean;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  organizationName: string;
}
