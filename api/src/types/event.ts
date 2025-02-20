export type EventType = 'PROOF_OF_LIFE' | 'RECADASTRATION';
export type EventStatus = 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

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

export interface EventResponse {
  id: string;
  type: EventType;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  active: boolean;
  status?: EventStatus;
  organizationId: string;
  organizationName?: string;
  created_at: string;
  updated_at: string;
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