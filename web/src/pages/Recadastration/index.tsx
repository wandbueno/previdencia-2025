import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { getUser } from '@/utils/auth';
import { ReviewRecadastrationModal } from './components/ReviewRecadastrationModal';

interface Recadastration {
  id: string;
  user: {
    name: string;
    cpf: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  data: Record<string, any>;
  documentsUrls: Record<string, string>;
  comments?: string;
  createdAt: string;
  reviewedAt?: string;
}

export function RecadastrationPage() {
  const [selectedRecadastration, setSelectedRecadastration] = useState<Recadastration | null>(null);
  const user = getUser();

  const { data: recadastrations, isLoading } = useQuery<Recadastration[]>({
    queryKey: ['recadastration'],
    queryFn: async () => {
      const response = await api.get('/recadastration');
      return response.data;
    },
  });

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
  };

  const statusLabels = {
    PENDING: 'Pendente',
    APPROVED: 'Aprovado',
    REJECTED: 'Rejeitado',
  };

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Recadastramento</h1>
          <p className="mt-2 text-sm text-gray-700">
            {user?.role === 'ORGANIZATION_ADMIN'
              ? 'Lista de todos os recadastramentos enviados.'
              : 'Histórico de recadastramentos.'}
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
                      Data de Envio
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    {user?.role === 'ORGANIZATION_ADMIN' && (
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                        <span className="sr-only">Ações</span>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recadastrations?.map((recadastration) => (
                    <tr key={recadastration.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                        {recadastration.user.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {recadastration.user.cpf}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(recadastration.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          statusColors[recadastration.status]
                        }`}>
                          {statusLabels[recadastration.status]}
                        </span>
                      </td>
                      {user?.role === 'ORGANIZATION_ADMIN' && (
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          {recadastration.status === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => setSelectedRecadastration(recadastration)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              Revisar
                            </button>
                          )}
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

      {selectedRecadastration && (
        <ReviewRecadastrationModal
          recadastration={selectedRecadastration}
          open={!!selectedRecadastration}
          onClose={() => setSelectedRecadastration(null)}
        />
      )}
    </div>
  );
}