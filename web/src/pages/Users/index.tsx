import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { api } from '@/lib/axios.ts';
import { Button } from '@/components/ui/Button';
import { UserTable } from './components/UserTable';
import { CreateUserModal } from './components/CreateUserModal';
import { EditUserModal } from './components/EditUserModal';
import { DeleteUserModal } from './components/DeleteUserModal';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { User, UserTableType } from '@/types/user';
import { getUser } from '@/utils/auth';

export function UsersPage() {
  const { subdomain } = useParams();
  const [selectedTab, setSelectedTab] = useState<UserTableType>('app');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const currentUser = getUser();
  const isSuperAdmin = currentUser?.isSuperAdmin === true;

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['users', subdomain, selectedTab],
    queryFn: async () => {
      if (!subdomain) throw new Error('Subdomain is required');
      const response = await api.get(`/users/${subdomain}/users`, {
        params: { type: selectedTab }
      });
      return response.data;
    },
    enabled: !!subdomain
  });

  // Organization admin can only view users, not manage them
  const showAdminTab = currentUser?.role === 'ADMIN' || isSuperAdmin;

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="flex-none p-6 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Usuários</h1>
            <p className="mt-2 text-sm text-gray-700">
              Gerencie os usuários do sistema
            </p>
          </div>
          {isSuperAdmin && (
            <div>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                Adicionar usuário
              </Button>
            </div>
          )}
        </div>

        <div className="mt-6">
          <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as UserTableType)}>
            <TabsList>
              <TabsTrigger value="app">Usuários do App</TabsTrigger>
              {showAdminTab && (
                <TabsTrigger value="admin">Administradores</TabsTrigger>
              )}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className={`flex-1 min-h-0 ${isSuperAdmin ? 'p-6' : 'px-0 py-6'}`}>
        <div className="h-full">
          <UserTable
            users={users || []}
            isLoading={isLoading}
            onEdit={(user) => {
              if (isSuperAdmin) {
                setSelectedUser(user);
                setIsEditModalOpen(true);
              }
            }}
            onDelete={(user) => {
              if (isSuperAdmin) {
                setSelectedUser(user);
                setIsDeleteModalOpen(true);
              }
            }}
            type={selectedTab}
            showActions={isSuperAdmin}
          />
        </div>
      </div>

      {isSuperAdmin && (
        <>
          <CreateUserModal
            open={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            type={selectedTab}
            organizationId={currentUser?.organization?.id || ''}
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
        </>
      )}
    </div>
  );
}