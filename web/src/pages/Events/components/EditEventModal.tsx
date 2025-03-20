import { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EventType, EventResponse } from '@/types/event';

interface EditEventModalProps {
  open: boolean;
  onClose: () => void;
  event: EventResponse;
}

const eventTypes = [
  { value: 'PROOF_OF_LIFE' as const, label: 'Prova de Vida' },
  { value: 'RECADASTRATION' as const, label: 'Recadastramento' }
];

const editEventSchema = z.object({
  type: z.enum(['PROOF_OF_LIFE', 'RECADASTRATION']),
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  active: z.boolean().optional()
});

type EditEventFormData = z.infer<typeof editEventSchema>;

export function EditEventModal({ open, onClose, event }: EditEventModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<EditEventFormData>({
    resolver: zodResolver(editEventSchema),
    mode: 'onChange'
  });

  useEffect(() => {
    if (event) {
      reset({
        type: event.type,
        title: event.title,
        description: event.description || '',
        startDate: event.start_date,
        endDate: event.end_date,
        active: event.active
      });
      
      setValue('type', event.type);
    }
  }, [event, reset, setValue]);

  const { mutate: updateEvent, isPending } = useMutation({
    mutationFn: async (data: EditEventFormData) => {
      const payload = {
        ...data,
        organizationId: event.organizationId
      };

      const response = await api.put(`/events/${event.id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['events'],
        refetchType: 'active'
      });
      
      setTimeout(() => {
        toast.success('Evento atualizado com sucesso!');
        handleClose();
      }, 100);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar evento');
    }
  });

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-lg rounded-lg bg-white p-6">
                <Dialog.Title className="text-lg font-semibold">
                  Editar Evento
                </Dialog.Title>

                <form 
                  className="mt-6 space-y-6"
                  onSubmit={handleSubmit((data) => {
                    updateEvent(data);
                  })}
                >
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium">
                      Tipo
                    </label>
                    <Select
                      id="type"
                      options={eventTypes}
                      value={event.type}
                      onChange={(value) => setValue('type', value as EventType)}
                      error={errors.type?.message}
                    />
                  </div>

                  <div>
                    <label htmlFor="title" className="block text-sm font-medium">
                      Título
                    </label>
                    <Input
                      id="title"
                      {...register('title')}
                      error={errors.title?.message}
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium">
                      Descrição
                    </label>
                    <Input
                      id="description"
                      {...register('description')}
                      error={errors.description?.message}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium">
                        Data de Início
                      </label>
                      <Input
                        id="startDate"
                        type="date"
                        {...register('startDate')}
                        error={errors.startDate?.message}
                      />
                    </div>

                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium">
                        Data de Término
                      </label>
                      <Input
                        id="endDate"
                        type="date"
                        {...register('endDate')}
                        error={errors.endDate?.message}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        {...register('active')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium">Ativo</span>
                    </label>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" loading={isPending}>
                      Salvar
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 