import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { getUser } from '@/utils/auth';
import { ReviewProofOfLifeModal } from './components/ReviewProofOfLifeModal';
import { EyeIcon } from '@heroicons/react/24/outline';

interface ProofOfLife {
  id: string;
  user: {
    name: string;
    cpf: string;
  };
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  selfieUrl: string;
  documentUrl: string;
  comments?: string;
  createdAt: string;
  reviewedAt?: string;
  event: {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
  };
}

export function ProofOfLifePage() {
  const [selectedProof, setSelectedProof] = useState<ProofOfLife | null>(null);
  const user = getUser();

  const { data: proofs, isLoading } = useQuery<ProofOfLife[]>({
    queryKey: ['proof-of-life'],
    queryFn: async () => {
      const response = await api.get('/proof-of-life');
      return response.data;
    },
  });

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    SUBMITTED: 'bg-blue-100 text-blue-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
  };

  const statusLabels = {
    PENDING: 'Pendente',
    SUBMITTED: 'Em Análise',
    APPROVED: 'Aprovado',
    REJECTED: 'Rejeitado',
  };

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Prova de Vida</h1>
          <p className="mt-2 text-sm text-gray-700">
            {user?.role === 'ADMIN'
              ? 'Lista de todas as provas de vida enviadas.'
              : 'Histórico de provas de vida.'}
          </p>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            {isLoading ? (
              <div>Carregando...</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                      Usuário
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      CPF
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Evento
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Data de Envio
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    {user?.role === 'ADMIN' && (
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                        <span className="sr-only">Ações</span>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {proofs?.map((proof) => (
                    <tr key={proof.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                        {proof.user.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {proof.user.cpf}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {proof.event.title}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(proof.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          statusColors[proof.status]
                        }`}>
                          {statusLabels[proof.status]}
                        </span>
                      </td>
                      {user?.role === 'ADMIN' && (
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <button
                            type="button"
                            onClick={() => setSelectedProof(proof)}
                            className="inline-flex items-center text-primary-600 hover:text-primary-900"
                            title={proof.status === 'SUBMITTED' ? 'Revisar prova de vida' : 'Ver detalhes'}
                          >
                            <EyeIcon className="h-5 w-5 mr-1" />
                            {proof.status === 'SUBMITTED' ? 'Revisar' : 'Ver detalhes'}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {selectedProof && (
        <ReviewProofOfLifeModal
          proof={selectedProof}
          open={!!selectedProof}
          onClose={() => setSelectedProof(null)}
        />
      )}
    </div>
  );
}