import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { getDefaultRoute, setAuthToken, setUser } from '@/utils/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft } from 'lucide-react';
import LogoPublixel from '../../assets/PUBLIXEL2025min.png';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { subdomain } = useParams();

  const { data: organization } = useQuery({
    queryKey: ['organization', subdomain],
    queryFn: async () => {
      if (!subdomain) return null;
      const response = await api.get(`/organizations/public/${subdomain}`);
      return response.data;
    },
    enabled: !!subdomain,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function handleLogin(data: LoginFormData) {
    try {
      const endpoint = subdomain ? '/auth/organization/login' : '/auth/superadmin/login';
      const response = await api.post(endpoint, {
        ...data,
        subdomain
      });
  
      const { token, ...user } = response.data;
  
      setAuthToken(token);
      setUser(user);
  
      // Redirect based on user type
      const redirectPath = getDefaultRoute();
      navigate(redirectPath);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Ocorreu um erro ao fazer login'
      );
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-6">
          <img
            className="h-14 w-auto mx-auto"
            src={LogoPublixel}
            alt="Prova de Vida & Recadastramento"
          />
        </div>

        <div className="bg-white shadow-lg rounded-lg p-5 transform transition-all duration-200 hover:shadow-xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {subdomain ? organization?.name : 'Área Administrativa'}
            </h1>
            {subdomain && organization && (
              <p className="mt-2 text-sm text-gray-600">
                {organization.city}/{organization.state}
              </p>
            )}
            {!subdomain && (
              <p className="mt-2 text-sm text-gray-600">
                Sistema de Controle Interno para Câmaras
              </p>
            )}
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(handleLogin)}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                error={errors.email?.message}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Senha
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
                error={errors.password?.message}
              />
            </div>

            <Button type="submit" className="w-full" loading={isSubmitting}>
              Entrar
            </Button>

            <div className="text-center">
              <Link
                to="/"
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para seleção de organizações
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}