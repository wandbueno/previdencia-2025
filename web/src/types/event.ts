export type EventType = 'PROOF_OF_LIFE' | 'RECADASTRATION';
export type EventStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Event {
  id: string;
  organizationId: string;
  type: EventType;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventDTO {
  type: EventType;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
}

export interface UpdateEventDTO {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

export interface EventResponse {
  id: string;
  type: 'PROOF_OF_LIFE' | 'RECADASTRATION';
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  active: boolean;
  organizationId: string;
  organizationName?: string;
}