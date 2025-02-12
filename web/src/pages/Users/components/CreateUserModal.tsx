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
import { useParams } from 'react-router-dom';
import { UserTableType } from '@/types/user';
import { getUser } from '@/utils/auth';

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  type: UserTableType;
  organizationId: string;
}

const createUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF inválido'),
  email: z.string().optional().or(z.literal('')),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  canProofOfLife: z.boolean().optional(),
  canRecadastration: z.boolean().optional(),
  rg: z.string().min(1, 'RG é obrigatório'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  address: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  registrationNumber: z.string().optional().or(z.literal('')),
  processNumber: z.string().optional().or(z.literal('')),
  benefitStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  benefitEndDate: z.string().min(1, 'Data fim ou VITALICIO é obrigatório'),
  benefitType: z.enum(['APOSENTADORIA', 'PENSAO']),
  retirementType: z.string().optional().or(z.literal('')),
  insuredName: z.string().optional().or(z.literal('')),
  legalRepresentative: z.string().optional().or(z.literal(''))
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

const benefitTypes = [
  { value: 'APOSENTADORIA', label: 'Aposentadoria' },
  { value: 'PENSAO', label: 'Pensão' }
];

export function CreateUserModal({ open, onClose, type, organizationId }: CreateUserModalProps) {
  const { subdomain } = useParams();
  const queryClient = useQueryClient();
  const currentUser = getUser();
  const isSuperAdmin = currentUser?.isSuperAdmin === true;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      canProofOfLife: false,
      canRecadastration: false,
      benefitType: 'APOSENTADORIA',
      email: '',
      address: '',
      phone: '',
      retirementType: '',
      insuredName: '',
      legalRepresentative: '',
      registrationNumber: '',
      processNumber: ''
    }
  });

  const benefitType = watch('benefitType');
  const birthDate = watch('birthDate');

  // Calculate if user is underage based on birth date
  const isUnderage = birthDate ? new Date(birthDate) > new Date(new Date().setFullYear(new Date().getFullYear() - 18)) : false;

  const { mutate: createUser, isPending } = useMutation({
    mutationFn: async (data: CreateUserFormData) => {
      const baseUrl = isSuperAdmin ? '/users' : `/users/${subdomain}/users`;
      
      const response = await api.post(baseUrl, {
        ...data,
        type,
        organizationId
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', subdomain, type] });
      toast.success('Usuário criado com sucesso!');
      handleClose();
    },
    onError: (error: any) => {
      console.error('Error creating user:', error);
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-gray-900"
                  >
                    Novo {type === 'admin' ? 'Administrador' : 'Usuário'}
                  </Dialog.Title>

                  <form
                    className="mt-6"
                    onSubmit={handleSubmit(data => {
                      console.log('Form data:', data);
                      createUser(data);
                    })}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Input
                          label="Nome *"
                          {...register('name')}
                          error={errors.name?.message}
                        />
                      </div>

                      <div>
                        <Input
                          label="CPF *"
                          {...register('cpf')}
                          error={errors.cpf?.message}
                        />
                      </div>

                      <div>
                        <Input
                          label="RG *"
                          {...register('rg')}
                          error={errors.rg?.message}
                        />
                      </div>

                      <div>
                        <Input
                          label="Email"
                          type="email"
                          {...register('email')}
                          error={errors.email?.message}
                        />
                      </div>
                      <div>
                        <Input
                          label="Telefone"
                          {...register('phone')}
                          error={errors.phone?.message}
                        />
                      </div>

                      <div>
                        <Input
                          label="Data de Nascimento *"
                          type="date"
                          {...register('birthDate')}
                          error={errors.birthDate?.message}
                        />
                      </div>

                      <div>
                        <Input
                          label="Endereço"
                          {...register('address')}
                          error={errors.address?.message}
                        />
                      </div>

                      <div>
                        <Input
                          label="Matrícula"
                          {...register('registrationNumber')}
                          error={errors.registrationNumber?.message}
                        />
                      </div>

                      <div>
                        <Input
                          label="Processo"
                          {...register('processNumber')}
                          error={errors.processNumber?.message}
                        />
                      </div>

                      <div>
                        <Input
                          label="Data Início do Benefício"
                          type="date"
                          {...register('benefitStartDate')}
                          error={errors.benefitStartDate?.message}
                        />
                      </div>

                      <div>
                        <Input
                          label="Data Fim do Benefício"
                          placeholder="Data ou VITALICIO"
                          {...register('benefitEndDate')}
                          error={errors.benefitEndDate?.message}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo de Benefício *
                        </label>
                        <Select
                          options={benefitTypes}
                          value={benefitType}
                          onChange={(value) => setValue('benefitType', value as 'APOSENTADORIA' | 'PENSAO')}
                          error={errors.benefitType?.message}
                        />
                      </div>

                      {benefitType === 'APOSENTADORIA' && (
                        <div>
                          <Input
                            label="Tipo de Aposentadoria"
                            {...register('retirementType')}
                            error={errors.retirementType?.message}
                          />
                        </div>
                      )}

                      {benefitType === 'PENSAO' && (
                        <div>
                          <Input
                            label="Nome do Segurado"
                            {...register('insuredName')}
                            error={errors.insuredName?.message}
                          />
                        </div>
                      )}

                      {isUnderage && (
                        <div className="col-span-2">
                          <Input
                            label="Representante Legal"
                            {...register('legalRepresentative')}
                            error={errors.legalRepresentative?.message}
                          />
                        </div>
                      )}

                      <div>
                        <Input
                          label="Senha *"
                          type="password"
                          {...register('password')}
                          error={errors.password?.message}
                        />
                      </div>

                      {type === 'app' && (
                        <div className="col-span-2 space-y-2">
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