import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Event } from '@/types/event';
import { Button } from '@/components/ui/Button';
import { CreateEventModal } from './components/CreateEventModal';
import { EventList } from './components/EventList';
import { getUser } from '@/utils/auth';

export function EventsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const user = getUser();
  const isAdmin = Boolean(user?.role === 'ADMIN' || user?.isSuperAdmin);

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await api.get('/events');
      return response.data;
    }
  });

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Eventos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie os eventos de prova de vida e recadastramento
          </p>
        </div>
        {isAdmin && (
          <div className="mt-4 sm:mt-0">
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Criar Evento
            </Button>
          </div>
        )}
      </div>

      <div className="mt-8">
        <EventList 
          events={events || []} 
          isLoading={isLoading}
          isAdmin={isAdmin}
        />
      </div>

      {isAdmin && (
        <CreateEventModal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </div>
  );
}