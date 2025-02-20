import { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EventType, EventResponse } from '@/types/event';
import { getUser } from '@/utils/auth';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface CreateEventModalProps {
  open: boolean;
  onClose: () => void;
  event?: EventResponse | null;
}

const eventTypes = [
  { value: 'PROOF_OF_LIFE' as const, label: 'Prova de Vida' },
  { value: 'RECADASTRATION' as const, label: 'Recadastramento' }
];

interface Organization {
  id: string;
  name: string;
}

export function CreateEventModal({ open, onClose, event }: CreateEventModalProps) {
  const queryClient = useQueryClient();
  const user = getUser();

  const createEventSchema = z.object({
    organizationId: user?.isSuperAdmin 
      ? z.string().uuid('Selecione uma organização')
      : z.string(),
    type: z.enum(['PROOF_OF_LIFE', 'RECADASTRATION']),
    title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
    description: z.string().optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Hora inválida'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Hora inválida'),
    active: z.boolean().optional()
  });

  type CreateEventFormData = z.infer<typeof createEventSchema>;

  const defaultValues = event ? {
    organizationId: event.organizationId || '',
    type: event.type,
    title: event.title,
    description: event.description || '',
    startDate: event.start_date.split('T')[0],
    startTime: event.start_date.split('T')[1]?.substring(0, 5) || '00:00',
    endDate: event.end_date.split('T')[0],
    endTime: event.end_date.split('T')[1]?.substring(0, 5) || '23:59',
    active: event.active
  } : {
    organizationId: user?.organization?.id || '',
    type: 'PROOF_OF_LIFE' as const,
    title: '',
    description: '',
    startDate: '',
    startTime: '00:00',
    endDate: '',
    endTime: '23:59',
    active: true
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues,
    mode: 'onChange'
  });

  useEffect(() => {
    if (event) {
      console.log('Resetting form with event:', event);
      const formData = {
        organizationId: event.organizationId,
        type: event.type,
        title: event.title,
        description: event.description || '',
        startDate: event.start_date.split('T')[0],
        startTime: event.start_date.split('T')[1]?.substring(0, 5) || '00:00',
        endDate: event.end_date.split('T')[0],
        endTime: event.end_date.split('T')[1]?.substring(0, 5) || '23:59',
        active: event.active
      };
      reset(formData);
      
      // Força a atualização dos campos do Select
      setValue('organizationId', event.organizationId);
      setValue('type', event.type);
    }
  }, [event, reset, setValue]);

  const { data: organizations } = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: async () => {
      const response = await api.get('/organizations');
      return response.data;
    },
    enabled: user?.isSuperAdmin === true
  });

  const { mutate: saveEvent, isPending } = useMutation({
    mutationFn: async (data: CreateEventFormData) => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('Form Data:', data);
      console.log('Event:', event);

      const payload = {
        type: data.type,
        title: data.title,
        description: data.description,
        startDate: `${data.startDate}T${data.startTime}:00-03:00`,
        endDate: `${data.endDate}T${data.endTime}:00-03:00`,
        active: data.active,
        organizationId: event ? event.organizationId : (user.isSuperAdmin ? data.organizationId : user.organization?.id)
      };

      console.log('Payload:', payload);

      if (event) {
        const response = await api.put(`/events/${event.id}`, payload);
        console.log('Update Response:', response.data);
        return response.data;
      } else {
        const response = await api.post('/events', payload);
        console.log('Create Response:', response.data);
        return response.data;
      }
    },
    onSuccess: (data) => {
      console.log('Mutation Success:', data);
      queryClient.invalidateQueries({ 
        queryKey: ['events'], 
        refetchType: 'active'
      });
      
      setTimeout(() => {
        toast.success(event ? 'Evento atualizado com sucesso!' : 'Evento criado com sucesso!');
        handleClose();
      }, 100);
    },
    onError: (error: any) => {
      console.error('Mutation Error:', error);
      toast.error(error.response?.data?.message || `Erro ao ${event ? 'atualizar' : 'criar'} evento`);
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
                  onClick={onClose}
                >
                  <span className="sr-only">Fechar</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="sm:flex sm:items-start">
                <div className="mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <Dialog.Title
                    as="h3"
                    className="text-base font-semibold leading-6 text-gray-900"
                  >
                    {event ? 'Editar Evento' : 'Criar Evento'}
                  </Dialog.Title>

                  <form
                    className="mt-6 space-y-6"
                    onSubmit={handleSubmit((data) => {
                      console.log('Form Submit Data:', data);
                      saveEvent(data);
                    })}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="title"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Título
                        </label>
                        <Input
                          id="title"
                          type="text"
                          className="mt-1"
                          error={errors.title?.message}
                          {...register('title')}
                        />
                      </div>

                      {user?.isSuperAdmin && (
                        <div>
                          <label
                            htmlFor="organizationId"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Organização
                          </label>
                          <Select
                            id="organizationId"
                            placeholder="Selecione uma organização"
                            options={
                              organizations?.map((org) => ({
                                value: org.id,
                                label: org.name,
                              })) || []
                            }
                            error={errors.organizationId?.message}
                            value={watch('organizationId')}
                            onChange={(value) => setValue('organizationId', value)}
                          />
                        </div>
                      )}

                      <div>
                        <label
                          htmlFor="type"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Tipo
                        </label>
                        <Select
                          id="type"
                          placeholder="Selecione um tipo"
                          options={eventTypes}
                          error={errors.type?.message}
                          value={watch('type')}
                          onChange={(value) => setValue('type', value as EventType)}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="startDate"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Data de Início
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            id="startDate"
                            type="date"
                            className="mt-1"
                            error={errors.startDate?.message}
                            {...register('startDate')}
                          />
                          <Input
                            id="startTime"
                            type="time"
                            className="mt-1"
                            error={errors.startTime?.message}
                            {...register('startTime')}
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="endDate"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Data de Término
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            id="endDate"
                            type="date"
                            className="mt-1"
                            error={errors.endDate?.message}
                            {...register('endDate')}
                          />
                          <Input
                            id="endTime"
                            type="time"
                            className="mt-1"
                            error={errors.endTime?.message}
                            {...register('endTime')}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Descrição
                      </label>
                      <Input
                        id="description"
                        type="text"
                        className="mt-1"
                        error={errors.description?.message}
                        {...register('description')}
                      />
                    </div>

                    <div className="mt-5 flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" loading={isPending}>
                        {event ? 'Salvar' : 'Criar'}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}