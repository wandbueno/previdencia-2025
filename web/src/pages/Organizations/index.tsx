import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { CreateOrganizationModal } from './components/CreateOrganizationModal';
import { EditOrganizationModal } from './components/EditOrganizationModal';
import { DeleteOrganizationModal } from './components/DeleteOrganizationModal';
import { OrganizationTable } from './components/OrganizationTable';
import { ViewOrganizationModal } from './components/ViewOrganizationModal';
import { Organization } from '@/types/organization';

export function OrganizationsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const { data: organizations, isLoading } = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: async () => {
      const response = await api.get('/organizations');
      console.log('API Response:', response.data);
      return response.data;
    }
  });

  useEffect(() => {
    console.log('Organizations:', organizations);
  }, [organizations]);

  function handleView(organization: Organization) {
    setSelectedOrganization(organization);
    setIsViewModalOpen(true);
  }

  function handleEdit(organization: Organization) {
    setSelectedOrganization(organization);
    setIsEditModalOpen(true);
  }

  function handleDelete(organization: Organization) {
    setSelectedOrganization(organization);
    setIsDeleteModalOpen(true);
  }

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

      <div className="mt-8">
        <OrganizationTable
          organizations={organizations || []}
          isLoading={isLoading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <CreateOrganizationModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {selectedOrganization && (
        <>
          <EditOrganizationModal
            open={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedOrganization(null);
            }}
            organization={selectedOrganization}
          />

          <DeleteOrganizationModal
            open={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedOrganization(null);
            }}
            organization={selectedOrganization}
          />

          <ViewOrganizationModal
            organization={selectedOrganization}
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
          />
        </>
      )}
    </div>
  );
}