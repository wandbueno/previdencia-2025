import { Event } from '@/types/event';
import { formatDate } from '@/utils/format';
import { Badge } from '@/components/ui/Badge';

interface EventListProps {
  events: Event[];
  isLoading: boolean;
  isAdmin: boolean;
}

export function EventList({ events, isLoading, isAdmin }: EventListProps) {
  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!events.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">
          Nenhum evento cadastrado
        </h3>
        {isAdmin && (
          <p className="mt-2 text-sm text-gray-500">
            Clique no botão "Criar Evento" para começar.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {events.map(event => (
        <div
          key={event.id}
          className="bg-white shadow-sm rounded-lg p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {event.type === 'PROOF_OF_LIFE' ? '📸' : '📝'}
                </span>
                <h3 className="text-lg font-semibold text-gray-900">
                  {event.title}
                </h3>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {event.type === 'PROOF_OF_LIFE' ? 'Prova de Vida' : 'Recadastramento'}
              </p>
              {event.description && (
                <p className="mt-2 text-sm text-gray-600">{event.description}</p>
              )}
              <div className="mt-4 space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Início:</span>{' '}
                  {formatDate(event.startDate)}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Término:</span>{' '}
                  {formatDate(event.endDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <Badge variant={event.active ? 'success' : 'error'}>
                {event.active ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}