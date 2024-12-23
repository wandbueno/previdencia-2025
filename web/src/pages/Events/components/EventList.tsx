import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { EventFilters } from './EventFilters';
import { useState } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { EventResponse } from '@/types/event';

interface Organization {
  id: string;
  name: string;
}

interface EventListProps {
  onEdit: (event: EventResponse) => void;
}

export function EventList({ onEdit }: EventListProps) {
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const queryClient = useQueryClient();

  const { data: events, isLoading } = useQuery<EventResponse[]>({
    queryKey: ['events', selectedOrganization],
    queryFn: async () => {
      const response = await api.get('/events', {
        params: {
          organizationId: selectedOrganization || null
        }
      });
      return response.data;
    },
    refetchOnWindowFocus: false,
    staleTime: 0,
    gcTime: 0
  });

  const { data: organizations } = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: async () => {
      const response = await api.get('/organizations');
      return response.data;
    }
  });

  const { mutate: deleteEvent } = useMutation({
    mutationFn: async (event: EventResponse) => {
      await api.delete(`/events/${event.id}`, {
        data: {
          organizationId: event.organizationId
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Evento excluído com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao excluir evento');
    }
  });

  function getOrganizationName(orgId: string, eventName?: string) {
    return organizations?.find((org: Organization) => org.id === orgId)?.name || 
      eventName || 
      'N/A';
  }

  function formatEventDate(dateString: string | undefined) {
    try {
      if (!dateString) {
        return 'Data inválida';
      }

      // Se a data já estiver no formato ISO, usa parseISO
      // Senão, cria uma nova data
      const date = dateString.includes('T') 
        ? parseISO(dateString)
        : new Date(dateString);

      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error('Erro ao formatar data:', dateString, error);
      return 'Data inválida';
    }
  }

  function handleDelete(event: EventResponse) {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      deleteEvent(event);
    }
  }

  return (
    <div>
      <EventFilters
        organizationId={selectedOrganization}
        onOrganizationChange={setSelectedOrganization}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Carregando eventos...</div>
        </div>
      ) : !events?.length ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">
            Nenhum evento cadastrado
            {selectedOrganization && ' para esta organização'}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Use o botão "Criar Evento" para começar.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event: EventResponse) => (
            <div key={event.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-500">
                    {event.type === 'PROOF_OF_LIFE' ? 'Prova de Vida' : 'Recadastramento'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Organização: {getOrganizationName(event.organizationId, event.organizationName)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(event)}
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                    title="Editar evento"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(event)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Excluir evento"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Início: {formatEventDate(event.start_date)}
                </p>
                <p className="text-sm text-gray-600">
                  Término: {formatEventDate(event.end_date)}
                </p>
              </div>
              <div className="mt-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  event.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {event.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}