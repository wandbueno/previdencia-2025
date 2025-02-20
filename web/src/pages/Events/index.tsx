import { useState } from 'react';
import { CreateEventModal } from './components/CreateEventModal';
import { EditEventModal } from './components/EditEventModal';
import { EventList } from './components/EventList';
import { EventResponse } from '@/types/event';
import { Button } from '@/components/ui/Button';

export function EventsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);

  function handleEditEvent(event: EventResponse) {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Eventos</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          Criar Evento
        </Button>
      </div>

      <EventList onEdit={handleEditEvent} />

      <CreateEventModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {selectedEvent && (
        <EditEventModal
          open={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedEvent(null);
          }}
          event={selectedEvent}
        />
      )}
    </div>
  );
}