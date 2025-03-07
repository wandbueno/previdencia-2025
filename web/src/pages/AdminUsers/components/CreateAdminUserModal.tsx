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

interface CreateAdminUserModalProps {
  open: boolean;
  onClose: () => void;
  organizationId: string;
}

const adminUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  cpf: z.string().min(11, 'CPF inválido'),
  password: z.string().min(5, 'Senha deve ter no mínimo 5 caracteres'),
  type: z.literal('admin'),
  organizationId: z.string(),
});

type AdminUserFormData = z.infer<typeof adminUserSchema>;

export function CreateAdminUserModal({ open, onClose, organizationId }: CreateAdminUserModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AdminUserFormData>({
    resolver: zodResolver(adminUserSchema),
    defaultValues: {
      type: 'admin',
      organizationId: '', // We'll set this using setValue when the component mounts
    },
  });

  // Set organizationId when the component mounts or when it changes
  useEffect(() => {
    setValue('organizationId', organizationId);
  }, [organizationId, setValue]);

  const { mutateAsync: createUser, isPending } = useMutation({
    mutationFn: async (data: AdminUserFormData) => {
      console.log('Sending request with data:', JSON.stringify(data, null, 2));
      const response = await api.post('/users', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário criado com sucesso!');
      handleClose();
    },
    onError: (error: any) => {
      console.error('Full error response:', {
        data: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        error: error
      });
      toast.error(error.response?.data?.message || 'Erro ao criar usuário');
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  async function handleCreateUser(data: AdminUserFormData) {
    console.log('Creating admin user with data:', data);
    try {
      await createUser({
        ...data,
        organizationId: organizationId // Ensure organizationId is explicitly set
      });
    } catch (error) {
      console.error('Error details:', error);
    }
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
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Criar Usuário Administrador
                  </Dialog.Title>

                  <form
                    onSubmit={handleSubmit(handleCreateUser)}
                    className="mt-4 space-y-4"
                  >
                    <Input
                      label="Nome"
                      {...register('name')}
                      error={errors.name?.message}
                    />

                    <Input
                      label="Email"
                      type="email"
                      {...register('email')}
                      error={errors.email?.message}
                    />

                    <Input
                      label="CPF"
                      {...register('cpf')}
                      error={errors.cpf?.message}
                    />

                    <Input
                      label="Senha"
                      type="password"
                      {...register('password')}
                      error={errors.password?.message}
                    />

                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                      <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        disabled={isPending}
                      >
                        Criar
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full"
                        onClick={handleClose}
                      >
                        Cancelar
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
