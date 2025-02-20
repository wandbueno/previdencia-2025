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
        : new Date(dateString + 'T00:00:00-03:00');

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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Título
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organização
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((event: EventResponse) => (
                <tr 
                  key={event.id}
                  className={`${!event.active ? 'bg-gray-50' : ''} hover:bg-gray-100 transition-colors`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      event.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {event.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{event.title}</div>
                    {event.description && (
                      <div className="text-sm text-gray-500">{event.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {event.type === 'PROOF_OF_LIFE' ? 'Prova de Vida' : 'Recadastramento'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getOrganizationName(event.organizationId, event.organizationName)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatEventDate(event.start_date)} - {formatEventDate(event.end_date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(event)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar evento"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(event)}
                        className="text-red-600 hover:text-red-900"
                        title="Excluir evento"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}