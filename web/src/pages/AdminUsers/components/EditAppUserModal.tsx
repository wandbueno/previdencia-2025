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

interface EditAppUserModalProps {
  user: User;
  open: boolean;
  onClose: () => void;
  organizationId: string;
}

const editAppUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido').nullable(),
  active: z.boolean(),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional().or(z.literal('')),
  rg: z.string().min(1, 'RG é obrigatório'),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
  address: z.string().nullable(),
  phone: z.string().nullable(),
  registrationNumber: z.string().nullable(),
  processNumber: z.string().nullable(),
  benefitStartDate: z.string().optional(),
  benefitEndDate: z.string().optional(),
  benefitType: z.enum(['APOSENTADORIA', 'PENSAO']).optional(),
  retirementType: z.string().nullable(),
  pensionGrantorName: z.string().nullable(),
  legalRepresentative: z.string().nullable(),
  canProofOfLife: z.boolean(),
  canRecadastration: z.boolean(),
});

type EditAppUserFormData = z.infer<typeof editAppUserSchema>;

export function EditAppUserModal({ user, open, onClose, organizationId }: EditAppUserModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<EditAppUserFormData>({
    resolver: zodResolver(editAppUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      active: user.active,
      password: '',
      rg: user.rg,
      birthDate: user.birthDate,
      address: user.address,
      phone: user.phone,
      registrationNumber: user.registrationNumber,
      processNumber: user.processNumber,
      benefitStartDate: user.benefitStartDate,
      benefitEndDate: user.benefitEndDate,
      benefitType: user.benefitType as 'APOSENTADORIA' | 'PENSAO',
      retirementType: user.retirementType,
      pensionGrantorName: user.pensionGrantorName,
      legalRepresentative: user.legalRepresentative,
      canProofOfLife: user.canProofOfLife,
      canRecadastration: user.canRecadastration,
    }
  });

  const { mutate: updateUser, isPending } = useMutation({
    mutationFn: async (data: EditAppUserFormData) => {
      // Remove o campo password se estiver vazio
      const payload = {
        ...data,
        type: 'app',
      };
      
      if (!data.password) {
        delete payload.password;
      }

      const response = await api.put(`/${organizationId}/users/${user.id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'app', organizationId] });
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

  const onSubmit = (data: EditAppUserFormData) => {
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-gray-900 mb-4"
                  >
                    Editar Usuário do App
                  </Dialog.Title>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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
                        <label htmlFor="rg" className="block text-sm font-medium text-gray-700">
                          RG
                        </label>
                        <Input
                          id="rg"
                          type="text"
                          error={errors.rg?.message}
                          {...register('rg')}
                        />
                      </div>

                      <div>
                        <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                          Data de Nascimento
                        </label>
                        <Input
                          id="birthDate"
                          type="date"
                          error={errors.birthDate?.message}
                          {...register('birthDate')}
                        />
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          Telefone
                        </label>
                        <Input
                          id="phone"
                          type="tel"
                          error={errors.phone?.message}
                          {...register('phone')}
                        />
                      </div>

                      <div className="col-span-2">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                          Endereço
                        </label>
                        <Input
                          id="address"
                          type="text"
                          error={errors.address?.message}
                          {...register('address')}
                        />
                      </div>

                      <div>
                        <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
                          Número de Registro
                        </label>
                        <Input
                          id="registrationNumber"
                          type="text"
                          error={errors.registrationNumber?.message}
                          {...register('registrationNumber')}
                        />
                      </div>

                      <div>
                        <label htmlFor="processNumber" className="block text-sm font-medium text-gray-700">
                          Número do Processo
                        </label>
                        <Input
                          id="processNumber"
                          type="text"
                          error={errors.processNumber?.message}
                          {...register('processNumber')}
                        />
                      </div>

                      <div>
                        <label htmlFor="benefitStartDate" className="block text-sm font-medium text-gray-700">
                          Início do Benefício
                        </label>
                        <Input
                          id="benefitStartDate"
                          type="date"
                          error={errors.benefitStartDate?.message}
                          {...register('benefitStartDate')}
                        />
                      </div>

                      <div>
                        <label htmlFor="benefitEndDate" className="block text-sm font-medium text-gray-700">
                          Fim do Benefício
                        </label>
                        <Input
                          id="benefitEndDate"
                          type="date"
                          error={errors.benefitEndDate?.message}
                          {...register('benefitEndDate')}
                        />
                      </div>

                      <div>
                        <label htmlFor="benefitType" className="block text-sm font-medium text-gray-700">
                          Tipo de Benefício
                        </label>
                        <select
                          id="benefitType"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          {...register('benefitType')}
                        >
                          <option value="">Selecione...</option>
                          <option value="APOSENTADORIA">Aposentadoria</option>
                          <option value="PENSAO">Pensão</option>
                        </select>
                        {errors.benefitType && (
                          <p className="mt-1 text-sm text-red-600">{errors.benefitType.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="retirementType" className="block text-sm font-medium text-gray-700">
                          Tipo de Aposentadoria
                        </label>
                        <Input
                          id="retirementType"
                          type="text"
                          error={errors.retirementType?.message}
                          {...register('retirementType')}
                        />
                      </div>

                      <div>
                        <label htmlFor="pensionGrantorName" className="block text-sm font-medium text-gray-700">
                          Nome do Instituidor da Pensão
                        </label>
                        <Input
                          id="pensionGrantorName"
                          type="text"
                          error={errors.pensionGrantorName?.message}
                          {...register('pensionGrantorName')}
                        />
                      </div>

                      <div>
                        <label htmlFor="legalRepresentative" className="block text-sm font-medium text-gray-700">
                          Representante Legal
                        </label>
                        <Input
                          id="legalRepresentative"
                          type="text"
                          error={errors.legalRepresentative?.message}
                          {...register('legalRepresentative')}
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
                    </div>

                    <div className="flex items-center gap-4">
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

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="canProofOfLife"
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                          {...register('canProofOfLife')}
                        />
                        <label htmlFor="canProofOfLife" className="text-sm text-gray-700">
                          Pode fazer prova de vida
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="canRecadastration"
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                          {...register('canRecadastration')}
                        />
                        <label htmlFor="canRecadastration" className="text-sm text-gray-700">
                          Pode fazer recadastramento
                        </label>
                      </div>
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
