// import { useNavigate, useParams } from 'react-router-dom';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { toast } from 'react-hot-toast';
// import { api } from '@/lib/axios';
// import { setAuthToken, setUser } from '@/utils/auth';
// import { Button } from '@/components/ui/Button';
// import { Input } from '@/components/ui/Input';

// const loginSchema = z.object({
//   email: z.string().email('Email inválido'),
//   password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
// });

// type LoginFormData = z.infer<typeof loginSchema>;

// export function LoginPage() {
//   const navigate = useNavigate();
//   const { subdomain } = useParams();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//   } = useForm<LoginFormData>({
//     resolver: zodResolver(loginSchema),
//   });

//   async function handleLogin(data: LoginFormData) {
//     try {
//       const response = await api.post('/auth/organization/login', {
//         ...data,
//         subdomain,
//       });

//       const { token, ...user } = response.data;

//       setAuthToken(token);
//       setUser(user);

//       navigate('/dashboard');
//     } catch (error: any) {
//       toast.error(
//         error.response?.data?.message || 'Ocorreu um erro ao fazer login'
//       );
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-sm">
//       <div>
//           <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
//             Login Administrativo
//           </h2>          
//         </div>

//         <form className="mt-6 space-y-6" onSubmit={handleSubmit(handleLogin)}>
//           <div>
//             <label
//               htmlFor="email"
//               className="block text-sm font-medium leading-6 text-gray-900"
//             >
//               Email
//             </label>
//             <div className="mt-2">
//               <Input
//                 id="email"
//                 type="email"
//                 autoComplete="email"
//                 {...register('email')}
//                 error={errors.email?.message}
//               />
//             </div>
//           </div>

//           <div>
//             <label
//               htmlFor="password"
//               className="block text-sm font-medium leading-6 text-gray-900"
//             >
//               Senha
//             </label>
//             <div className="mt-2">
//               <Input
//                 id="password"
//                 type="password"
//                 autoComplete="current-password"
//                 {...register('password')}
//                 error={errors.password?.message}
//               />
//             </div>
//           </div>

//           <Button type="submit" className="w-full" loading={isSubmitting}>
//             Entrar
//           </Button>

//           <div className="text-center">
//             <Button
//               type="button"
//               variant="link"
//               onClick={() => navigate('/')}
//               className="text-gray-600"
//             >
//               ← Voltar para seleção de organizações
//             </Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }