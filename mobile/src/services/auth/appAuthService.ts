import { api } from '@/lib/api';
import { User } from '@/types/user';

interface LoginResponse {
  token: string;
  user: User;
}

interface LoginCredentials {
  cpf: string;
  password: string;
  subdomain: string;
}

export async function login({ cpf, password, subdomain }: LoginCredentials): Promise<LoginResponse> {
  const response = await api.post('/auth/app/login', {
    cpf,
    password,
    subdomain
  });

  // Converte os valores 0/1 para boolean
  const user = {
    ...response.data,
    canProofOfLife: Boolean(response.data.canProofOfLife),
    canRecadastration: Boolean(response.data.canRecadastration)
  };

  return {
    token: response.data.token,
    user
  };
}