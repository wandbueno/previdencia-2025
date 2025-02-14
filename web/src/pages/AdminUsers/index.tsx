import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { UserTable } from './components/UserTable';
import { CreateAdminUserModal } from './components/CreateAdminUserModal';
import { CreateAppUserModal } from './components/CreateAppUserModal';
import { EditAdminUserModal } from './components/EditAdminUserModal';
import { EditAppUserModal } from './components/EditAppUserModal';
import { DeleteUserModal } from './components/DeleteUserModal';
import { ViewUserModal } from '../Users/components/ViewUserModal';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { User, UserTableType } from '@/types/user';
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext';

interface Organization {
  id: string;
  name: string;
  subdomain: string;
  state: string;
  city: string;
  active: boolean;
  services: string[];
}

export function AdminUsersPageWrapper() {
  return (
    <OrganizationProvider>
      <AdminUsersPage />
    </OrganizationProvider>
  );
}

export function AdminUsersPage() {
  const [selectedTab, setSelectedTab] = useState<UserTableType>('admin');
  const [selectedOrganization, setSelectedOrganization] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const { data: organizations } = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: async () => {
      const response = await api.get('/organizations');
      console.log('Organizations response:', response.data);
      return response.data;
    }
  });

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['users', selectedTab, selectedOrganization],
    queryFn: async () => {
      if (!selectedOrganization) return [];
      const response = await api.get('/users', {
        params: { 
          type: selectedTab,
          organizationId: selectedOrganization
        }
      });
      return response.data;
    },
    enabled: !!selectedOrganization,
  });

  const { setOrganizationId } = useOrganization();

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Usuários</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie os usuários do sistema
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Organização
          </label>
          <Select
            options={organizations?.map(org => ({
              value: org.id,
              label: `${org.name} (${org.subdomain})`
            })) || []}
            value={selectedOrganization || undefined}
            onChange={(option) => {
              setSelectedOrganization(option?.value || '');
              setOrganizationId(option?.value || '');
            }}
            placeholder="Selecione uma organização"
          />
        </div>

        {selectedOrganization && (
          <>
            <div className="flex justify-between items-center">
              <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as UserTableType)}>
                <TabsList>
                  <TabsTrigger value="admin">Usuários Administrativos</TabsTrigger>
                  <TabsTrigger value="app">Usuários do App</TabsTrigger>
                </TabsList>
              </Tabs>

              <Button onClick={() => setIsCreateModalOpen(true)}>
                Criar Usuário
              </Button>
            </div>

            <div className="mt-6">
              <UserTable
                users={users || []}
                isLoading={isLoading}
                type={selectedTab}
                onEdit={(user) => {
                  setSelectedUser(user);
                  setIsEditModalOpen(true);
                }}
                onDelete={(user) => {
                  setSelectedUser(user);
                  setIsDeleteModalOpen(true);
                }}
                onView={(user) => {
                  setSelectedUser(user);
                  setIsViewModalOpen(true);
                }}
              />
            </div>
          </>
        )}
      </div>

      {selectedTab === 'admin' ? (
        <CreateAdminUserModal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          organizationId={selectedOrganization}
        />
      ) : (
        <CreateAppUserModal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          organizationId={selectedOrganization}
        />
      )}

      {selectedUser && (
        <>
          {selectedTab === 'admin' ? (
            <EditAdminUserModal
              user={selectedUser}
              open={isEditModalOpen}
              onClose={() => {
                setSelectedUser(null);
                setIsEditModalOpen(false);
              }}
              organizationId={selectedOrganization}
            />
          ) : (
            <EditAppUserModal
              user={selectedUser}
              open={isEditModalOpen}
              onClose={() => {
                setSelectedUser(null);
                setIsEditModalOpen(false);
              }}
              organizationId={selectedOrganization}
            />
          )}

          <DeleteUserModal
            user={selectedUser}
            open={isDeleteModalOpen}
            onClose={() => {
              setSelectedUser(null);
              setIsDeleteModalOpen(false);
            }}
            type={selectedTab}
            organizationId={selectedOrganization}
          />

          <ViewUserModal
            user={selectedUser}
            open={isViewModalOpen}
            type={selectedTab}
            onClose={() => {
              setSelectedUser(null);
              setIsViewModalOpen(false);
            }}
          />
        </>
      )}
    </div>
  );
}