import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { User, UserTableType } from '@/types/user';

interface UserFormProps {
  user?: User;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  type: UserTableType;
}

const baseSchema = {
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().optional().or(z.literal('')),
  rg: z.string().min(1, 'RG é obrigatório'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  address: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  registrationNumber: z.string().min(1, 'Matrícula é obrigatória'),
  processNumber: z.string().min(1, 'Processo é obrigatório'),
  benefitStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  benefitEndDate: z.string().min(1, 'Data fim ou VITALICIO é obrigatório'),
  benefitType: z.enum(['APOSENTADORIA', 'PENSAO']),
  retirementType: z.string().optional().or(z.literal('')),
  insuredName: z.string().optional().or(z.literal('')),
  legalRepresentative: z.string().optional().or(z.literal('')),
  canProofOfLife: z.boolean().optional(),
  canRecadastration: z.boolean().optional(),
};

const createUserSchema = z.object({
  ...baseSchema,
  cpf: z.string().regex(/^\d{11}$/, 'CPF inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const updateUserSchema = z.object({
  ...baseSchema,
  active: z.boolean(),
});

type FormData = z.infer<typeof createUserSchema> | z.infer<typeof updateUserSchema>;

const benefitTypes = [
  { value: 'APOSENTADORIA', label: 'Aposentadoria' },
  { value: 'PENSAO', label: 'Pensão' }
];

export function UserForm({ user, onSubmit, onCancel, isSubmitting, type }: UserFormProps) {
  const isEditing = !!user;
  const schema = isEditing ? updateUserSchema : createUserSchema;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: user ? {
      name: user.name,
      email: user.email || '',
      active: user.active,
      canProofOfLife: user.canProofOfLife,
      canRecadastration: user.canRecadastration,
      rg: user.rg || '',
      birthDate: user.birthDate || '',
      address: user.address || '',
      phone: user.phone || '',
      registrationNumber: user.registrationNumber || '',
      processNumber: user.processNumber || '',
      benefitStartDate: user.benefitStartDate || '',
      benefitEndDate: user.benefitEndDate || '',
      benefitType: user.benefitType || 'APOSENTADORIA',
      retirementType: user.retirementType || '',
      insuredName: user.insuredName || '',
      legalRepresentative: user.legalRepresentative || ''
    } : {
      canProofOfLife: false,
      canRecadastration: false,
      benefitType: 'APOSENTADORIA' as const,
      email: '',
      address: '',
      phone: '',
      retirementType: '',
      insuredName: '',
      legalRepresentative: ''
    }
  });

  const benefitType = watch('benefitType');
  const birthDate = watch('birthDate');

  // Calculate if user is underage based on birth date
  const isUnderage = birthDate ? new Date(birthDate) > new Date(new Date().setFullYear(new Date().getFullYear() - 18)) : false;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Input
            label="Nome *"
            {...register('name')}
            error={errors.name?.message}
          />
        </div>

        {!isEditing && (
          <div>
            <Input
              label="CPF *"
              {...register('cpf')}
              error={(errors as any).cpf?.message}
            />
          </div>
        )}

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
            value={watch('benefitType')}
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

        {!isEditing && (
          <div>
            <Input
              label="Senha *"
              type="password"
              {...register('password')}
              error={(errors as any).password?.message}
            />
          </div>
        )}

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

        {isEditing && (
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('active')}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
              />
              <span className="text-sm text-gray-900">
                Usuário ativo
              </span>
            </label>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {isEditing ? 'Salvar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}