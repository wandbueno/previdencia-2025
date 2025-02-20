import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { api } from '@/lib/axios';
import { UserTable } from './components/UserTable';
import { ViewUserModal } from './components/ViewUserModal';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { User, UserTableType } from '@/types/user';
import { getUser } from '@/utils/auth';

export function UsersPage() {
  const { subdomain } = useParams();
  const [selectedTab, setSelectedTab] = useState<UserTableType>('app');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const currentUser = getUser();

  const { data: users, isLoading, error } = useQuery<User[]>({
    queryKey: ['users', subdomain, selectedTab],
    queryFn: async () => {
      if (!subdomain) throw new Error('Subdomain is required');
      const response = await api.get(`/users/${subdomain}/users`, {
        params: { type: selectedTab }
      });
      return response.data;
    },
    enabled: !!subdomain,
    retry: false // Don't retry on error
  });

  // Organization admin can only view users
  const showAdminTab = currentUser?.role === 'ADMIN';

  // Handle the case where subdomain is not provided
  if (!subdomain) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhuma organização selecionada</h3>
          <p className="mt-1 text-sm text-gray-500">
            Selecione uma organização para visualizar seus usuários.
          </p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Erro ao carregar usuários</h3>
          <p className="mt-1 text-sm text-gray-500">
            Ocorreu um erro ao carregar os usuários. Tente novamente mais tarde.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Usuários</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de usuários do sistema
          </p>
        </div>
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

      <div className="mt-6">
        <UserTable
          users={users || []}
          isLoading={isLoading}
          type={selectedTab}
          onView={(user) => setSelectedUser(user)}
        />
      </div>

      <ViewUserModal
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
        type={selectedTab}
      />
    </div>
  );
}