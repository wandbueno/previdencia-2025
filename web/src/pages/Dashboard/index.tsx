import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { getUser } from '@/utils/auth';
import { StatCard } from '@/components/StatCard';
import { AlertItem } from '@/components/AlertItem';
import { ActivityCard } from '@/components/ActivityCard';
import { StatusCard } from '@/components/StatusCard';
import { 
  UsersIcon, 
  DocumentCheckIcon, 
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export function DashboardPage() {
  const user = getUser();
  const isAdmin = user?.role === 'ADMIN' || user?.isSuperAdmin;

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/stats');
      return response.data;
    }
  });

  const defaultStats = {
    totalUsers: 0,
    completedSubmissions: 0,
    pendingSubmissions: 0
  };

  const { totalUsers, completedSubmissions, pendingSubmissions } = stats || defaultStats;

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total de Usuários"
          value={totalUsers}
          icon={UsersIcon}
          color="#4318FF"
        />
        <StatCard
          title="Provas Realizadas"
          value={completedSubmissions}
          icon={DocumentCheckIcon}
          color="#05CD99"
        />
        <StatCard
          title="Provas Pendentes"
          value={pendingSubmissions}
          icon={ClockIcon}
          color="#FFB547"
        />
      </div>

      {/* Alerts Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Alertas e Notificações
        </h2>
        <div className="space-y-3">
          <AlertItem 
            icon={ClockIcon}
            message="15 usuários com prazo próximo do vencimento"
            color="#FFB547"
          />
          <AlertItem 
            icon={ExclamationTriangleIcon}
            message="8 provas de vida vencidas"
            color="#FF5B5B"
          />
          <AlertItem 
            icon={ClockIcon}
            message="3 verificações pendentes de análise"
            color="#4318FF"
          />
        </div>
      </div>

      {/* Activity and Status Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityCard />
        <StatusCard />
      </div>
    </div>
  );
}
