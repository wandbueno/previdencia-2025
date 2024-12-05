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

const createOrganizationSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  subdomain: z.string().min(3, 'Subdomínio deve ter no mínimo 3 caracteres')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Subdomínio inválido'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres'),
  city: z.string().min(3, 'Cidade deve ter no mínimo 3 caracteres'),
  services: z.array(z.string()).min(1, 'Selecione pelo menos um serviço')
});

type CreateOrganizationFormData = z.infer<typeof createOrganizationSchema>;

interface CreateOrganizationModalProps {
  open: boolean;
  onClose: () => void;
}

const services = [
  { value: 'PROOF_OF_LIFE', label: 'Prova de Vida' },
  { value: 'RECADASTRATION', label: 'Recadastramento' }
];

export function CreateOrganizationModal({ open, onClose }: CreateOrganizationModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<CreateOrganizationFormData>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      services: []
    }
  });

  const selectedServices = watch('services');

  const { mutate: createOrganization, isPending } = useMutation({
    mutationFn: async (data: CreateOrganizationFormData) => {
      const response = await api.post('/organizations', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organização criada com sucesso!');
      handleClose();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Erro ao criar organização'
      );
    }
  });

  function handleClose() {
    reset();
    onClose();
  }

  function toggleService(value: string) {
    const services = selectedServices || [];
    const index = services.indexOf(value);

    if (index === -1) {
      setValue('services', [...services, value]);
    } else {
      setValue('services', services.filter(service => service !== value));
    }
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
                    Nova Organização
                  </Dialog.Title>

                  <form
                    className="mt-6 space-y-6"
                    onSubmit={handleSubmit(data => createOrganization(data))}
                  >
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Nome
                      </label>
                      <div className="mt-2">
                        <Input
                          id="name"
                          {...register('name')}
                          error={errors.name?.message}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="subdomain"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Subdomínio
                      </label>
                      <div className="mt-2">
                        <Input
                          id="subdomain"
                          {...register('subdomain')}
                          error={errors.subdomain?.message}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="state"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          Estado
                        </label>
                        <div className="mt-2">
                          <Input
                            id="state"
                            {...register('state')}
                            error={errors.state?.message}
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="city"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          Cidade
                        </label>
                        <div className="mt-2">
                          <Input
                            id="city"
                            {...register('city')}
                            error={errors.city?.message}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium leading-6 text-gray-900">
                        Serviços
                      </label>
                      <div className="mt-2 space-y-2">
                        {services.map(service => (
                          <label
                            key={service.value}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="checkbox"
                              checked={selectedServices?.includes(service.value)}
                              onChange={() => toggleService(service.value)}
                              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                            />
                            <span className="text-sm text-gray-900">
                              {service.label}
                            </span>
                          </label>
                        ))}
                        {errors.services && (
                          <p className="text-sm text-red-600">
                            {errors.services.message}
                          </p>
                        )}
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