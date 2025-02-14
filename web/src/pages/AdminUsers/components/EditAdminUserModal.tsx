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
import { User } from '@/types/user';

interface EditAdminUserModalProps {
  user: User;
  open: boolean;
  onClose: () => void;
  organizationId: string;
}

const editAdminUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  active: z.boolean(),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional().or(z.literal('')),
});

type EditAdminUserFormData = z.infer<typeof editAdminUserSchema>;

export function EditAdminUserModal({ user, open, onClose, organizationId }: EditAdminUserModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<EditAdminUserFormData>({
    resolver: zodResolver(editAdminUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      active: user.active,
      password: '',
    }
  });

  const { mutate: updateUser, isPending } = useMutation({
    mutationFn: async (data: EditAdminUserFormData) => {
      // Remove o campo password se estiver vazio
      const payload = {
        ...data,
        type: 'admin',
        organizationId
      };
      
      if (!data.password) {
        delete payload.password;
      }

      const response = await api.put(`/users/${user.id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'admin', organizationId] });
      toast.success('Usuário atualizado com sucesso!');
      handleClose();
    },
    onError: (error: any) => {
      console.error('Error updating user:', error);
      toast.error(
        error.response?.data?.message || 'Erro ao atualizar usuário'
      );
    }
  });

  function handleClose() {
    reset();
    onClose();
  }

  const onSubmit = (data: EditAdminUserFormData) => {
    updateUser(data);
  };

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
                    className="text-lg font-semibold leading-6 text-gray-900 mb-4"
                  >
                    Editar Usuário Administrativo
                  </Dialog.Title>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Nome
                      </label>
                      <Input
                        id="name"
                        type="text"
                        error={errors.name?.message}
                        {...register('name')}
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        error={errors.email?.message}
                        {...register('email')}
                      />
                    </div>

                    <div>
                      <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
                        CPF
                      </label>
                      <Input
                        id="cpf"
                        type="text"
                        value={user.cpf || '-'}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Nova Senha (opcional)
                      </label>
                      <Input
                        id="password"
                        type="password"
                        error={errors.password?.message}
                        {...register('password')}
                        placeholder="Digite para alterar a senha"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="active"
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                        {...register('active')}
                      />
                      <label htmlFor="active" className="text-sm text-gray-700">
                        Usuário ativo
                      </label>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isPending}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" variant="primary" loading={isPending}>
                        Salvar
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
