import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/axios';
import { setAuthToken, setUser } from '@/utils/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface OrganizationLoginModalProps {
  open: boolean;
  onClose: () => void;
  subdomain: string;
}

const loginSchema = z.object({
  cpf: z.string().regex(/^\d{11}$/, 'CPF inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function OrganizationLoginModal({ open, onClose, subdomain }: OrganizationLoginModalProps) {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function handleLogin(data: LoginFormData) {
    try {
      const response = await api.post('/auth/organization/login', {
        ...data,
        subdomain,
      });

      const { token, ...user } = response.data;

      setAuthToken(token);
      setUser(user);

      navigate('/dashboard');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Ocorreu um erro ao fazer login'
      );
    }
  }

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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                <div>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-gray-900"
                  >
                    Acesse sua conta
                  </Dialog.Title>

                  <form
                    className="mt-6 space-y-6"
                    onSubmit={handleSubmit(handleLogin)}
                  >
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
                          type="text"
                          autoComplete="username"
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
                          autoComplete="current-password"
                          {...register('password')}
                          error={errors.password?.message}
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" loading={isSubmitting}>
                        Entrar
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