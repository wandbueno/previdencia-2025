import { Fragment } from 'react';
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

interface CreateAppUserModalProps {
  open: boolean;
  onClose: () => void;
  organizationId: string;
}

const appUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  cpf: z.string().min(11, 'CPF inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  type: z.literal('app'),
  organizationId: z.string(),
  rg: z.string().min(1, 'RG é obrigatório'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  address: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  registrationNumber: z.string().optional().or(z.literal('')),
  processNumber: z.string().optional().or(z.literal('')),
  benefitStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  benefitEndDate: z.string().min(1, 'Data fim ou VITALICIO é obrigatório'),
  benefitType: z.enum(['APOSENTADORIA', 'PENSAO']),
  retirementType: z.string().optional().nullable(),
  pensionGrantorName: z.string().optional().nullable(),
  legalRepresentative: z.string().optional().nullable(),
  canProofOfLife: z.boolean().default(false),
  canRecadastration: z.boolean().default(false),
}).refine(
  (data) => {
    if (data.benefitType === 'PENSAO') {
      return !!data.pensionGrantorName;
    }
    return true;
  },
  {
    message: 'Nome do instituidor é obrigatório para pensão',
    path: ['pensionGrantorName']
  }
);

type AppUserFormData = z.infer<typeof appUserSchema>;

export function CreateAppUserModal({ open, onClose, organizationId }: CreateAppUserModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting: isCreating }
  } = useForm<AppUserFormData>({
    resolver: zodResolver(appUserSchema),
    defaultValues: {
      type: 'app',
      organizationId,
      benefitType: 'APOSENTADORIA',
      canProofOfLife: false,
      canRecadastration: false,
    },
  });

  const { mutateAsync: createUser } = useMutation({
    mutationFn: async (data: AppUserFormData) => {
      // Formatar as datas antes de enviar
      const formattedData = {
        ...data,
        birthDate: data.birthDate.split('T')[0], // Remover a parte do tempo se existir
        benefitStartDate: data.benefitStartDate.split('T')[0], // Remover a parte do tempo se existir
      };
      
      const response = await api.post('/users', formattedData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuário criado com sucesso!');
      handleClose();
    },
    onError: (error: any) => {
      console.error('Error creating user:', error);
      toast.error(
        error.response?.data?.error || 
        error.response?.data?.message || 
        'Erro ao criar usuário'
      );
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const watchBenefitType = useWatch({
    control,
    name: 'benefitType',
  });

  const onSubmit = async (data: AppUserFormData) => {
    await createUser(data);
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                <div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold leading-6 text-gray-900"
                    >
                      Novo Usuário do App
                    </Dialog.Title>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Primeira coluna */}
                    <div className="space-y-4">
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

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
                            CPF
                          </label>
                          <Input
                            id="cpf"
                            type="text"
                            error={errors.cpf?.message}
                            {...register('cpf')}
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
                      </div>

                      <div className="grid grid-cols-2 gap-4">
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
                    </div>

                    {/* Segunda coluna */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
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
                              onChange={(option) => field.onChange(option.value)}
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
                      )}

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

                      <div className="grid grid-cols-2 gap-4">
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
                            placeholder="Ex: Vitalício ou DD/MM/AAAA"
                            error={errors.benefitEndDate?.message}
                            {...register('benefitEndDate')}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                          Senha
                        </label>
                        <Input
                          id="password"
                          type="password"
                          error={errors.password?.message}
                          {...register('password')}
                        />
                      </div>

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
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        reset();
                        onClose();
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" loading={isCreating}>
                      Criar
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
