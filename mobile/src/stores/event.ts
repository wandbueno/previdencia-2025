// src/stores/event.ts
import { create } from 'zustand';
import { api } from '@/lib/api';

export interface Event {
  id: string;
  type: 'PROOF_OF_LIFE' | 'RECADASTRATION';
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

interface EventState {
  events: Event[];
  loading: boolean;
  fetchEvents: () => Promise<void>;
}

export const useEventStore = create<EventState>((set) => ({
  events: [],
  loading: false,
  fetchEvents: async () => {
    try {
      set({ loading: true });
      const response = await api.get('/events');
      set({ events: response.data });
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      set({ loading: false });
    }
  }
}));
