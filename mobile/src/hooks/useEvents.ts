import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { Event } from '@/types/event';
import { User } from '@/types/user';

export function useEvents() {
  const { user } = useAuthStore() as { user: User | null };

  return useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await api.get('/events');
      
      if (!user) return [];

      // Filtra eventos baseado nas permissões do usuário e organização
      const filteredEvents = response.data.filter((event: Event) => {
        // Verifica se o evento pertence à organização do usuário
        const isFromOrganization = event.organizationId === user.organization.id;
        
        // Verifica se o usuário tem permissão para o tipo de evento
        const hasPermission = 
          (event.type === 'PROOF_OF_LIFE' && Boolean(user.canProofOfLife)) ||
          (event.type === 'RECADASTRATION' && Boolean(user.canRecadastration));
        
        return event.active && isFromOrganization && hasPermission;
      });

      return filteredEvents;
    },
    enabled: !!user // Só executa se tiver usuário logado
  });
}