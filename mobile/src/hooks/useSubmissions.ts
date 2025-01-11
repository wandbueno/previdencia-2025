import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { Submission } from '@/types/submission';

export function useSubmissions(type: 'PROOF_OF_LIFE' | 'RECADASTRATION') {
  const { user } = useAuthStore();

  return useQuery<Submission[]>({
    queryKey: ['submissions', type, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Usa a nova rota de histórico para provas de vida
      const endpoint = type === 'PROOF_OF_LIFE' 
        ? '/proof-of-life/history' 
        : '/recadastration';
        
      const response = await api.get(endpoint);
      return response.data;
    },
    enabled: !!user?.id
  });
}