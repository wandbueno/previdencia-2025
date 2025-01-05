export type EventType = 'PROOF_OF_LIFE' | 'RECADASTRATION';
export type EventStatus = 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface Event {
  id: string;
  organization_id: string;
  type: EventType;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventResponse {
  id: string;
  organizationId: string;
  organizationName?: string;
  type: EventType;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  active: boolean;
  status?: EventStatus;
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