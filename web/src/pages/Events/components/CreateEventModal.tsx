import { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EventType, EventResponse } from '@/types/event';
import { getUser } from '@/utils/auth';

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
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
    active: z.boolean().optional()
  });

  type CreateEventFormData = z.infer<typeof createEventSchema>;

  const defaultValues = event ? {
    organizationId: event.organizationId,
    type: event.type,
    title: event.title,
    description: event.description || '',
    startDate: event.start_date,
    endDate: event.end_date,
    active: event.active
  } : {
    organizationId: user?.organization?.id || '',
    type: 'PROOF_OF_LIFE' as const,
    title: '',
    description: '',
    startDate: '',
    endDate: '',
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
        startDate: event.start_date,
        endDate: event.end_date,
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
        startDate: data.startDate,
        endDate: data.endDate,
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
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-gray-900"
                  >
                    {event ? 'Editar Evento' : 'Novo Evento'}
                  </Dialog.Title>

                  <form
                    className="mt-6 space-y-6"
                    onSubmit={handleSubmit((data) => {
                      console.log('Form Submit Data:', data);
                      saveEvent(data);
                    })}
                  >
                    {user?.isSuperAdmin && (
                      <div>
                        <label htmlFor="organizationId" className="block text-sm font-medium text-gray-900">
                          Organização
                        </label>
                        <Select
                          id="organizationId"
                          value={watch('organizationId') || ''}
                          options={organizations?.map(org => ({
                            value: org.id,
                            label: org.name
                          })) || []}
                          onChange={(value) => setValue('organizationId', value)}
                          error={errors.organizationId?.message}
                        />
                      </div>
                    )}

                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-900">
                        Tipo
                      </label>
                      <Select
                        id="type"
                        value={watch('type')}
                        options={eventTypes}
                        onChange={(value) => setValue('type', value as EventType)}
                        error={errors.type?.message}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="title"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Título
                      </label>
                      <div className="mt-2">
                        <Input
                          id="title"
                          {...register('title')}
                          error={errors.title?.message}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Descrição (opcional)
                      </label>
                      <div className="mt-2">
                        <Input
                          id="description"
                          {...register('description')}
                          error={errors.description?.message}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="startDate"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          Data de Início
                        </label>
                        <div className="mt-2">
                          <Input
                            id="startDate"
                            type="date"
                            {...register('startDate')}
                            error={errors.startDate?.message}
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="endDate"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          Data de Término
                        </label>
                        <div className="mt-2">
                          <Input
                            id="endDate"
                            type="date"
                            {...register('endDate')}
                            error={errors.endDate?.message}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          {...register('active')}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-900">Ativo</span>
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
                        {event ? 'Salvar' : 'Criar'}
                      </Button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}