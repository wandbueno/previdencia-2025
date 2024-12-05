import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { User, CreateUserFormData, UpdateUserFormData } from '@/types/user';

interface UserFormProps {
  user?: User;
  onSubmit: (data: CreateUserFormData | UpdateUserFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const createUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF inválido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  role: z.enum(['ORGANIZATION_ADMIN', 'USER']),
  initialPassword: z.string().min(4, 'Senha deve ter no mínimo 4 caracteres').optional()
});

const updateUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  active: z.boolean(),
  resetPassword: z.boolean().optional()
});

const roles = [
  { value: 'ORGANIZATION_ADMIN', label: 'Administrador' },
  { value: 'USER', label: 'Usuário' }
];

export function UserForm({ user, onSubmit, onCancel, isSubmitting }: UserFormProps) {
  const isEditing = !!user;
  const schema = isEditing ? updateUserSchema : createUserSchema;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: user ? {
      name: user.name,
      email: user.email,
      active: user.active
    } : undefined
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

      {!isEditing && (
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
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          E-mail
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

      {!isEditing && (
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Tipo
          </label>
          <div className="mt-2">
            <Select
              options={roles}
              onChange={(value) => setValue('role', value as 'ORGANIZATION_ADMIN' | 'USER')}
              error={errors.role?.message}
            />
          </div>
        </div>
      )}

      {isEditing ? (
        <>
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

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('resetPassword')}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
              />
              <span className="text-sm text-gray-900">
                Resetar senha
              </span>
            </label>
            {register('resetPassword').checked && (
              <p className="mt-1 text-sm text-gray-500">
                A senha será redefinida para os últimos 4 dígitos do CPF
              </p>
            )}
          </div>
        </>
      ) : (
        <div>
          <label
            htmlFor="initialPassword"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Senha Inicial (opcional)
          </label>
          <div className="mt-2">
            <Input
              id="initialPassword"
              type="password"
              {...register('initialPassword')}
              error={errors.initialPassword?.message}
            />
            <p className="mt-1 text-sm text-gray-500">
              Se não informada, será utilizado os últimos 4 dígitos do CPF
            </p>
          </div>
        </div>
      )}

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