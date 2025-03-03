import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { api } from '@/lib/axios';
import { UserTable } from './components/UserTable';
import { ViewUserModal } from './components/ViewUserModal';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { User, UserTableType } from '@/types/user';
import { getUser } from '@/utils/auth';

// Interfaces adicionadas para lidar com provas de vida
interface ProofOfLife {
  id: string;
  user: {
    id: string;
  };
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

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
  
  // Carregar dados de prova de vida usando o endpoint existente
  const { data: proofsOfLife } = useQuery<ProofOfLife[]>({
    queryKey: ['proof-of-life'],
    queryFn: async () => {
      const response = await api.get('/proof-of-life/admin?include=user');
      return response.data;
    },
    enabled: selectedTab === 'app' // Só carregar para a aba de usuários do app
  });
  
  // Criar um mapa de usuário para status de prova de vida
  const userProofStatusMap = new Map<string, string>();
  
  if (proofsOfLife && proofsOfLife.length > 0) {
    // Agrupar provas de vida por usuário e pegar a mais recente
    const userProofsMap = new Map<string, ProofOfLife[]>();
    
    proofsOfLife.forEach(proof => {
      const userId = proof.user.id;
      if (!userProofsMap.has(userId)) {
        userProofsMap.set(userId, []);
      }
      userProofsMap.get(userId)?.push(proof);
    });
    
    // Para cada usuário, pegar a prova mais recente e seu status
    userProofsMap.forEach((proofs, userId) => {
      // Ordenar por data de criação (mais recente primeiro)
      const sortedProofs = proofs.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      if (sortedProofs.length > 0) {
        userProofStatusMap.set(userId, sortedProofs[0].status);
      }
    });
  }
  
  // Adicionar o status da prova de vida à lista de usuários
  const usersWithProofStatus = users?.map(user => ({
    ...user,
    proofOfLifeStatus: userProofStatusMap.get(user.id) || null
  }));

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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Usuários</h1>
      </div>

      <Tabs defaultValue={selectedTab} onValueChange={(value) => setSelectedTab(value as UserTableType)}>
        <TabsList>
          <TabsTrigger value="app">Usuários do App</TabsTrigger>
          {showAdminTab && <TabsTrigger value="admin">Administradores</TabsTrigger>}
        </TabsList>
      </Tabs>

      <UserTable
        users={usersWithProofStatus || []}
        isLoading={isLoading}
        onView={setSelectedUser}
        type={selectedTab}
      />

      {selectedUser && (
        <ViewUserModal
          user={selectedUser}
          open={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          type={selectedTab}
        />
      )}
    </div>
  );
}