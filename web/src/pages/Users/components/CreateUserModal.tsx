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
import { useParams } from 'react-router-dom';
import { UserTableType } from '@/types/user';

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  type: UserTableType;
}

const createUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF inválido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  canProofOfLife: z.boolean().optional(),
  canRecadastration: z.boolean().optional()
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

export function CreateUserModal({ open, onClose, type }: CreateUserModalProps) {
  const { subdomain } = useParams();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      canProofOfLife: false,
      canRecadastration: false
    }
  });

  const { mutate: createUser, isPending } = useMutation({
    mutationFn: async (data: CreateUserFormData) => {
      const response = await api.post(`/users/${subdomain}/users`, {
        ...data,
        type
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', subdomain, type] });
      toast.success('Usuário criado com sucesso!');
      handleClose();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Erro ao criar usuário'
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
                    Novo {type === 'admin' ? 'Administrador' : 'Usuário'}
                  </Dialog.Title>

                  <form
                    className="mt-6 space-y-6"
                    onSubmit={handleSubmit(data => createUser(data))}
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
                        htmlFor="cpf"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        CPF
                      </label>
                      <div className="mt-2">
                        <Input
                          id="cpf"
                          {...register('cpf')}
                          error={errors.cpf?.message}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Email
                      </label>
                      <div className="mt-2">
                        <Input
                          id="email"
                          type="email"
                          {...register('email')}
                          error={errors.email?.message}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Senha
                      </label>
                      <div className="mt-2">
                        <Input
                          id="password"
                          type="password"
                          {...register('password')}
                          error={errors.password?.message}
                        />
                      </div>
                    </div>

                    {type === 'app' && (
                      <div className="space-y-2">
                        <div>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              {...register('canProofOfLife')}
                              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                            />
                            <span className="text-sm text-gray-900">
                              Pode realizar Prova de Vida
                            </span>
                          </label>
                        </div>

                        <div>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              {...register('canRecadastration')}
                              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                            />
                            <span className="text-sm text-gray-900">
                              Pode realizar Recadastramento
                            </span>
                          </label>
                        </div>
                      </div>
                    )}

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