import { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { User } from '@/types/user';
import { adjustDateToBrasilia } from '@/utils/format';

interface EditAppUserModalProps {
  user: User;
  open: boolean;
  onClose: () => void;
}

const editAppUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')).nullable(),
  active: z.boolean(),
  password: z.string().min(5, 'Senha deve ter no mínimo 5 caracteres').optional().or(z.literal('')),
  rg: z.string().min(1, 'RG é obrigatório'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  address: z.string().optional().or(z.literal('')).nullable(),
  phone: z.string().optional().or(z.literal('')).nullable(),
  registrationNumber: z.string().optional().or(z.literal('')).nullable(),
  processNumber: z.string().optional().or(z.literal('')).nullable(),
  benefitStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  benefitEndDate: z.string().min(1, 'Data fim ou VITALICIO é obrigatório'),
  benefitType: z.enum(['APOSENTADORIA', 'PENSAO']),
  retirementType: z.string().optional().or(z.literal('')).nullable(),
  insuredName: z.string().optional().or(z.literal('')).nullable(),
  legalRepresentative: z.string().optional().or(z.literal('')).nullable(),
  canProofOfLife: z.boolean(),
  canRecadastration: z.boolean(),
}).refine(
  (data) => {
    if (data.benefitType === 'PENSAO') {
      return !!data.insuredName;
    }
    return true;
  },
  {
    message: 'Nome do instituidor é obrigatório para pensão',
    path: ['insuredName']
  }
);

type EditAppUserFormData = z.infer<typeof editAppUserSchema>;

export function EditAppUserModal({ user, open, onClose }: EditAppUserModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors }
  } = useForm<EditAppUserFormData>({
    resolver: zodResolver(editAppUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email || '',
      active: user.active,
      password: '',
      rg: user.rg || '',
      birthDate: adjustDateToBrasilia(user.birthDate),
      address: user.address || '',
      phone: user.phone || '',
      registrationNumber: user.registrationNumber || '',
      processNumber: user.processNumber || '',
      benefitStartDate: adjustDateToBrasilia(user.benefitStartDate),
      benefitEndDate: user.benefitEndDate || 'VITALICIO',
      benefitType: user.benefitType || 'APOSENTADORIA',
      retirementType: user.retirementType || '',
      insuredName: user.insuredName || '',
      legalRepresentative: user.legalRepresentative || '',
      canProofOfLife: user.canProofOfLife || false,
      canRecadastration: user.canRecadastration || false,
    }
  });

  // Observar o tipo de benefício para mostrar campos específicos
  const watchBenefitType = useWatch({
    control,
    name: 'benefitType',
  });

  // Atualizar campos dependentes quando o tipo de benefício mudar
  useEffect(() => {
    if (watchBenefitType === 'APOSENTADORIA') {
      setValue('insuredName', '');
    } else if (watchBenefitType === 'PENSAO') {
      setValue('retirementType', '');
    }
  }, [watchBenefitType, setValue]);

  // Reset form with user data when user changes
  useEffect(() => {
    reset({
      name: user.name,
      email: user.email || '',
      active: user.active,
      password: '',
      rg: user.rg || '',
      birthDate: adjustDateToBrasilia(user.birthDate),
      address: user.address || '',
      phone: user.phone || '',
      registrationNumber: user.registrationNumber || '',
      processNumber: user.processNumber || '',
      benefitStartDate: adjustDateToBrasilia(user.benefitStartDate),
      benefitEndDate: user.benefitEndDate || 'VITALICIO',
      benefitType: user.benefitType || 'APOSENTADORIA',
      retirementType: user.retirementType || '',
      insuredName: user.insuredName || '',
      legalRepresentative: user.legalRepresentative || '',
      canProofOfLife: user.canProofOfLife || false,
      canRecadastration: user.canRecadastration || false,
    });
  }, [user, reset]);

  function handleClose() {
    reset();
    onClose();
  }

  const { mutateAsync: updateUser, isPending } = useMutation({
    mutationFn: async (data: EditAppUserFormData) => {
      const formattedData = {
        ...data,
        id: user.id,
        type: 'app' as const,
        organizationId: user.organizationId,
        
        // Formatar campos obrigatórios
        birthDate: data.birthDate.split('T')[0],
        benefitStartDate: data.benefitStartDate.split('T')[0],
        benefitEndDate: data.benefitEndDate || 'VITALICIO',
        
        // Campos condicionais
        insuredName: data.benefitType === 'PENSAO' ? data.insuredName || null : null,
        retirementType: data.benefitType === 'APOSENTADORIA' ? data.retirementType || null : null,
        
        // Campos opcionais como null se vazios
        email: data.email || null,
        address: data.address || null,
        phone: data.phone || null,
        registrationNumber: data.registrationNumber || null,
        processNumber: data.processNumber || null,
        legalRepresentative: data.legalRepresentative || null,
      };

      console.log('Dados enviados:', JSON.stringify(formattedData, null, 2));
      
      try {
        const response = await api.put(`/users/${user.id}`, formattedData);
        return response.data;
      } catch (error: any) {
        if (error.response?.data?.details) {
          console.error('Detalhes da validação:', error.response.data.details);
        }
        console.error('Erro completo:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário atualizado com sucesso!');
      handleClose();
    },
    onError: (error: any) => {
      console.error('Error updating user:', error);
      toast.error(
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Erro ao atualizar usuário'
      );
    },
  });

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
                          value={user.rg}
                          disabled
                          className="bg-gray-50"
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
                          Número de Matrícula
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
                        <label htmlFor="benefitType" className="block text-sm font-medium text-gray-700">
                          Tipo de Benefício
                        </label>
                        <Controller
                          control={control}
                          name="benefitType"
                          render={({ field }) => (
                            <Select
                              id="benefitType"
                              error={errors.benefitType?.message}
                              value={field.value}
                              onChange={field.onChange}
                              options={[
                                { value: 'APOSENTADORIA', label: 'Aposentadoria' },
                                { value: 'PENSAO', label: 'Pensão' }
                              ]}
                              placeholder="Selecione o tipo de benefício"
                            />
                          )}
                        />
                      </div>

                      {watchBenefitType === 'APOSENTADORIA' && (
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
                      )}

                      {watchBenefitType === 'PENSAO' && (
                        <div>
                          <label htmlFor="insuredName" className="block text-sm font-medium text-gray-700">
                            Nome do Instituidor
                          </label>
                          <Input
                            id="insuredName"
                            type="text"
                            error={errors.insuredName?.message}
                            {...register('insuredName')}
                          />
                        </div>
                      )}

                      <div>
                        <label htmlFor="benefitStartDate" className="block text-sm font-medium text-gray-700">
                          Data Início do Benefício
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
                          Data Fim do Benefício
                        </label>
                        <Input
                          id="benefitEndDate"
                          type="text"
                          placeholder="Data ou VITALICIO"
                          error={errors.benefitEndDate?.message}
                          {...register('benefitEndDate')}
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
                        <label htmlFor="active" className="block text-sm font-medium text-gray-700">
                          Status
                        </label>
                        <Controller
                          control={control}
                          name="active"
                          render={({ field }) => (
                            <Select
                              id="active"
                              error={errors.active?.message}
                              value={field.value}
                              onChange={field.onChange}
                              options={[
                                { value: true, label: 'Ativo' },
                                { value: false, label: 'Inativo' }
                              ]}
                              placeholder="Selecione o status"
                            />
                          )}
                        />
                      </div>

                      <div>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            {...register('canProofOfLife')}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium">Pode realizar Prova de Vida</span>
                        </label>
                      </div>

                      <div>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            {...register('canRecadastration')}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium">Pode realizar Recadastramento</span>
                        </label>
                      </div>
                    </div>

                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                      <Button
                        type="submit"
                        disabled={isPending}
                        className="sm:col-start-2"
                      >
                        {isPending ? 'Salvando...' : 'Salvar'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="sm:col-start-1 sm:mt-0"
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
