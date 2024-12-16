import { Fragment } from 'react';
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
import { EventType } from '@/types/event';

interface CreateEventModalProps {
  open: boolean;
  onClose: () => void;
}

const createEventSchema = z.object({
  type: z.enum(['PROOF_OF_LIFE', 'RECADASTRATION']),
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
});

type CreateEventFormData = z.infer<typeof createEventSchema>;

const eventTypes = [
  { value: 'PROOF_OF_LIFE', label: 'Prova de Vida' },
  { value: 'RECADASTRATION', label: 'Recadastramento' }
];

export function CreateEventModal({ open, onClose }: CreateEventModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema)
  });

  const { mutate: createEvent, isPending } = useMutation({
    mutationFn: async (data: CreateEventFormData) => {
      const response = await api.post('/events', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Evento criado com sucesso!');
      handleClose();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Erro ao criar evento'
      );
    }
  });

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
                    Novo Evento
                  </Dialog.Title>

                  <form
                    className="mt-6 space-y-6"
                    onSubmit={handleSubmit(data => createEvent(data))}
                  >
                    <div>
                      <label
                        htmlFor="type"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Tipo
                      </label>
                      <div className="mt-2">
                        <Select
                          options={eventTypes}
                          onChange={(value) => setValue('type', value as EventType)}
                          error={errors.type?.message}
                        />
                      </div>
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

                    <div className="mt-6 flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" loading={isPending}>
                        Criar
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