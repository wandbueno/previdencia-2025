import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { Event } from '@/types/event';
import { User } from '@/types/user';

export function useEvents() {
  const { user } = useAuthStore() as { user: User | null };

  return useQuery<Event[]>({
    queryKey: ['events', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const response = await api.get('/events', {
        params: {
          userId: user.id
        }
      });
      
      // Transform API response to match our Event type
      const events = response.data.map((event: any) => ({
        ...event,
        startDate: event.start_date,
        endDate: event.end_date,
        createdAt: event.created_at,
        updatedAt: event.updated_at
      }));

      // Filter events based on user permissions
      const filteredEvents = events.filter((event: Event) => {
        const isFromOrganization = event.organizationId === user.organization.id;
        const hasPermission = 
          (event.type === 'PROOF_OF_LIFE' && Boolean(user.canProofOfLife)) ||
          (event.type === 'RECADASTRATION' && Boolean(user.canRecadastration));
        
        return event.active && isFromOrganization && hasPermission;
      });

      return filteredEvents;
    },
    enabled: !!user?.id
  });
}