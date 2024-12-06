import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { UserTable } from './components/UserTable';
import { CreateUserModal } from './components/CreateUserModal';
import { EditUserModal } from './components/EditUserModal';
import { DeleteUserModal } from './components/DeleteUserModal';
import { User } from '@/types/user';
import { getUser } from '@/utils/auth';

export function UsersPage() {
  const { subdomain } = useParams();
  const currentUser = getUser();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['users', subdomain],
    queryFn: async () => {
      if (!subdomain) throw new Error('Subdomain is required');
      const response = await api.get(`/${subdomain}/users`);
      return response.data;
    },
    enabled: !!subdomain
  });

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Usuários</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de usuários do sistema
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Adicionar usuário
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <UserTable
          users={users || []}
          isLoading={isLoading}
          onEdit={(user) => {
            setSelectedUser(user);
            setIsEditModalOpen(true);
          }}
          onDelete={(user) => {
            setSelectedUser(user);
            setIsDeleteModalOpen(true);
          }}
        />
      </div>

      <CreateUserModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
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
          />

          <DeleteUserModal
            user={selectedUser}
            open={isDeleteModalOpen}
            onClose={() => {
              setSelectedUser(null);
              setIsDeleteModalOpen(false);
            }}
          />
        </>
      )}
    </div>
  );
}
