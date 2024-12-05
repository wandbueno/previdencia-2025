import { UseFormRegister } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface LoginFormProps {
  register: UseFormRegister<any>;
  errors: Record<string, any>;
  isLoading: boolean;
  onSubmit: () => void;
  isSuperAdmin?: boolean;
}

export function LoginForm({
  register,
  errors,
  isLoading,
  onSubmit,
  isSuperAdmin,
}: LoginFormProps) {
  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div>
        <label
          htmlFor="cpf"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          {isSuperAdmin ? 'E-mail' : 'CPF'}
        </label>
        <div className="mt-2">
          <Input
            id="cpf"
            type={isSuperAdmin ? 'email' : 'text'}
            {...register('cpf')}
            error={errors.cpf?.message}
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

      <Button type="submit" className="w-full" loading={isLoading}>
        Entrar
      </Button>
    </form>
  );
}