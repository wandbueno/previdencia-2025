import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { UserTable } from './components/UserTable';
import { CreateUserModal } from './components/CreateUserModal';
import { EditUserModal } from './components/EditUserModal';
import { DeleteUserModal } from './components/DeleteUserModal';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { User, Organization } from '@/types/user';

export function AdminUsersPage() {
  const [selectedTab, setSelectedTab] = useState<'admin' | 'app'>('admin');
  const [selectedOrganization, setSelectedOrganization] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: organizations } = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: async () => {
      const response = await api.get('/organizations');
      return response.data;
    },
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
    enabled: !!selectedOrganization
  });

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Usuários</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie os usuários do sistema
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!selectedOrganization}
          >
            Adicionar usuário
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'admin' | 'app')}>
          <TabsList>
            <TabsTrigger value="admin">Usuários Administrativos</TabsTrigger>
            <TabsTrigger value="app">Usuários do App</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-6 max-w-xs">
        <label
          htmlFor="organization"
          className="block text-sm font-medium text-gray-700"
        >
          Organização
        </label>
        <div className="mt-1">
          <Select
            id="organization"
            placeholder="Selecione uma organização"
            value={selectedOrganization}
            onChange={setSelectedOrganization}
            options={
              organizations?.map((org) => ({
                value: org.id,
                label: `${org.name} - ${org.city}/${org.state}`
              })) || []
            }
          />
        </div>
      </div>

      <div className="mt-6">
        <UserTable
          users={users || []}
          isLoading={isLoading}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
        />
      </div>

      <CreateUserModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        type={selectedTab}
        organizationId={selectedOrganization}
      />

      {selectedUser && (
        <>
          <EditUserModal
            user={selectedUser}
            open={isEditModalOpen}
            onClose={() => {
              setSelectedUser(null);
              setIsEditModalOpen(false);
            }}
            type={selectedTab}
          />

          <DeleteUserModal
            user={selectedUser}
            open={isDeleteModalOpen}
            onClose={() => {
              setSelectedUser(null);
              setIsDeleteModalOpen(false);
            }}
            type={selectedTab}
          />
        </>
      )}
    </div>
  );
}