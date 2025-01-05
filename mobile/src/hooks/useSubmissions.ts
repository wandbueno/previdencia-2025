import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { Submission } from '@/types/submission';

export function useSubmissions(type: 'PROOF_OF_LIFE' | 'RECADASTRATION') {
  const { user } = useAuthStore();

  return useQuery<Submission[]>({
    queryKey: ['submissions', type],
    queryFn: async () => {
      const endpoint = type === 'PROOF_OF_LIFE' ? '/proof-of-life' : '/recadastration';
      const response = await api.get(endpoint);
      return response.data;
    },
    enabled: !!user // Só executa se tiver usuário logado
  });
}