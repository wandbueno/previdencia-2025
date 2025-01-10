import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { Submission } from '@/types/submission';

export function useSubmissions(type: 'PROOF_OF_LIFE' | 'RECADASTRATION') {
  const { user } = useAuthStore();

  return useQuery<Submission[]>({
    queryKey: ['submissions', type, user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const endpoint = type === 'PROOF_OF_LIFE' ? '/proof-of-life' : '/recadastration';
      const response = await api.get(endpoint, {
        params: {
          userId: user.id
        }
      });

      // Mapeia a resposta da API para o formato esperado pelo componente
      return response.data.map((item: any) => ({
        id: item.id,
        eventId: item.eventId,
        eventTitle: item.eventTitle,
        status: item.status,
        selfieUrl: item.selfieUrl,
        documentUrl: item.documentUrl,
        comments: item.comments,
        submittedAt: item.submittedAt,
        reviewedAt: item.reviewedAt,
        reviewedBy: item.reviewedBy,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }));
    },
    enabled: !!user?.id // Só executa se tiver usuário logado
  });
}