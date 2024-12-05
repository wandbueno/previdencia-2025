import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { CreateOrganizationModal } from './components/CreateOrganizationModal';
import { EditOrganizationModal } from './components/EditOrganizationModal';
import { DeleteOrganizationModal } from './components/DeleteOrganizationModal';

interface Organization {
  id: string;
  name: string;
  subdomain: string;
  state: string;
  city: string;
  active: boolean;
  services: string[];
}

export function OrganizationsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: organizations, isLoading } = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: async () => {
      const response = await api.get('/organizations');
      return response.data;
    },
  });

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Organizações</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de todas as organizações cadastradas no sistema.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Adicionar organização
          </Button>
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
                      Nome
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Subdomínio
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Cidade/UF
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Serviços
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {organizations?.map((organization) => (
                    <tr key={organization.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                        {organization.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {organization.subdomain}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {organization.city}/{organization.state}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {organization.services.map(service => 
                          service === 'PROOF_OF_LIFE' ? 'Prova de Vida' : 'Recadastramento'
                        ).join(', ')}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          organization.active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {organization.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <Button
                          variant="ghost"
                          className="text-primary-600 hover:text-primary-900 mr-2"
                          onClick={() => {
                            setSelectedOrganization(organization);
                            setIsEditModalOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-red-600 hover:text-red-900"
                          onClick={() => {
                            setSelectedOrganization(organization);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          Excluir
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <CreateOrganizationModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {selectedOrganization && (
        <>
          <EditOrganizationModal
            organization={selectedOrganization}
            open={isEditModalOpen}
            onClose={() => {
              setSelectedOrganization(null);
              setIsEditModalOpen(false);
            }}
          />

          <DeleteOrganizationModal
            organization={selectedOrganization}
            open={isDeleteModalOpen}
            onClose={() => {
              setSelectedOrganization(null);
              setIsDeleteModalOpen(false);
            }}
          />
        </>
      )}
    </div>
  );
}