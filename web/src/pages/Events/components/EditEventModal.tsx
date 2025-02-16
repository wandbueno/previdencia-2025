import { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EventResponse } from '@/types/event';
import { XMarkIcon } from '@heroicons/react/24/outline';

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
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Hora inválida'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Hora inválida'),
  active: z.boolean().optional()
}).refine((data) => {
  const start = new Date(`${data.startDate}T${data.startTime}:00-03:00`);
  const end = new Date(`${data.endDate}T${data.endTime}:00-03:00`);
  return start <= end;
}, {
  message: 'A data de início deve ser anterior à data de término',
  path: ['endDate']
});

type EditEventFormData = z.infer<typeof editEventSchema>;

export function EditEventModal({ open, onClose, event }: EditEventModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm<EditEventFormData>({
    resolver: zodResolver(editEventSchema),
    defaultValues: {
      type: event.type,
      title: event.title,
      description: event.description || '',
      startDate: event.start_date.split('T')[0],
      startTime: event.start_date.split('T')[1]?.substring(0, 5) || '00:00',
      endDate: event.end_date.split('T')[0],
      endTime: event.end_date.split('T')[1]?.substring(0, 5) || '23:59',
      active: event.active
    }
  });

  useEffect(() => {
    if (event) {
      reset({
        type: event.type,
        title: event.title,
        description: event.description || '',
        startDate: event.start_date.split('T')[0],
        startTime: event.start_date.split('T')[1]?.substring(0, 5) || '00:00',
        endDate: event.end_date.split('T')[0],
        endTime: event.end_date.split('T')[1]?.substring(0, 5) || '23:59',
        active: event.active
      });
    }
  }, [event, reset]);

  const { mutate: updateEvent, isPending } = useMutation({
    mutationFn: async (data: EditEventFormData) => {
      const payload = {
        ...data,
        startDate: `${data.startDate}T${data.startTime}:00-03:00`,
        endDate: `${data.endDate}T${data.endTime}:00-03:00`,
        organizationId: event.organizationId
      };

      console.log('Update payload:', payload);

      const response = await api.put(`/events/${event.id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Evento atualizado com sucesso!');
      queryClient.invalidateQueries({ 
        queryKey: ['events']
      });
      handleClose();
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Erro ao atualizar evento');
    }
  });

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={onClose}
      >
        <div className="flex min-h-screen items-center justify-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="relative w-full transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:max-w-4xl sm:p-6">
              <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                <button
                  type="button"
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={handleClose}
                >
                  <span className="sr-only">Fechar</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-gray-900"
                  >
                    Editar Evento
                  </Dialog.Title>

                  <div className="mt-6">
                    <form 
                      className="space-y-6"
                      onSubmit={handleSubmit((data) => updateEvent(data))}
                    >
                      <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                          Tipo
                        </label>
                        <Controller
                          control={control}
                          name="type"
                          render={({ field }) => (
                            <Select
                              id="type"
                              options={eventTypes}
                              value={field.value}
                              onChange={field.onChange}
                              error={errors.type?.message}
                            />
                          )}
                        />
                      </div>

                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                          Título
                        </label>
                        <Input
                          id="title"
                          {...register('title')}
                          error={errors.title?.message}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Descrição
                        </label>
                        <Input
                          id="description"
                          {...register('description')}
                          error={errors.description?.message}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="startDate"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Data e Hora de Início
                        </label>
                        <div className="mt-1 grid grid-cols-2 gap-2">
                          <Input
                            id="startDate"
                            type="date"
                            error={errors.startDate?.message}
                            {...register('startDate')}
                          />
                          <Input
                            id="startTime"
                            type="time"
                            error={errors.startTime?.message}
                            {...register('startTime')}
                          />
                        </div>
                        {errors.startDate?.message && (
                          <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="endDate"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Data e Hora de Término
                        </label>
                        <div className="mt-1 grid grid-cols-2 gap-2">
                          <Input
                            id="endDate"
                            type="date"
                            error={errors.endDate?.message}
                            {...register('endDate')}
                          />
                          <Input
                            id="endTime"
                            type="time"
                            error={errors.endTime?.message}
                            {...register('endTime')}
                          />
                        </div>
                        {errors.endDate?.message && (
                          <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            {...register('active')}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">Ativo</span>
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
                        <Button 
                          type="submit" 
                          loading={isPending}
                          disabled={isPending}
                        >
                          Salvar
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}