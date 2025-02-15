import { create } from 'zustand';
import { api } from '@/lib/api';

interface User {
  id: string;
  name: string;
  cpf: string;
  email: string;
  role: string;
  rg?: string;
  benefitType?: 'APOSENTADORIA' | 'PENSAO';
  retirementType?: string;
  benefitStartDate?: string;
  benefitEndDate?: string;
  canProofOfLife?: boolean;
  canRecadastration?: boolean;
  organization: {
    id: string;
    name: string;
    subdomain: string;
  };
}

interface AuthState {
  token: string | null;
  user: User | null;
  signIn: (token: string, user: User) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  signIn: (token, user) => {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    set({ token, user });
  },
  signOut: () => {
    api.defaults.headers.common.Authorization = '';
    set({ token: null, user: null });
  }
}));