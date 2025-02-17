import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { StatCard } from '@/components/StatCard';
import clsx from 'clsx';
import { 
  BuildingOffice2Icon,
  UsersIcon, 
  DocumentCheckIcon, 
  ClockIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export function SuperAdminDashboardPage() {
  const { data: dashboardData } = useQuery({
    queryKey: ['super-admin-dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/super-admin/stats');
      return response.data;
    }
  });

  const stats = dashboardData?.stats || {
    totalOrganizations: 0,
    systemStats: {
      totalUsers: 0,
      totalProofs: 0,
      pendingProofs: 0,
      proofsByStatus: {
        SUBMITTED: 0,
        APPROVED: 0,
        REJECTED: 0
      }
    }
  };

  // Configuração do gráfico de organizações por estado
  const stateChartData = {
    labels: dashboardData?.charts.organizationsByState?.map((item: any) => item.state) || [],
    datasets: [
      {
        label: 'Organizações',
        data: dashboardData?.charts.organizationsByState?.map((item: any) => item.count) || [],
        backgroundColor: '#4318FF',
      },
    ],
  };

  const stateChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Organizações por Estado',
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Organizações"
          value={stats.totalOrganizations}
          icon={BuildingOffice2Icon}
          color="#4318FF"
        />
        <StatCard
          title="Total de Usuários"
          value={stats.systemStats.totalUsers}
          icon={UsersIcon}
          color="#05CD99"
        />
        <StatCard
          title="Total de Provas"
          value={stats.systemStats.totalProofs}
          icon={DocumentCheckIcon}
          color="#FFB547"
        />
        <StatCard
          title="Provas Pendentes"
          value={stats.systemStats.pendingProofs}
          icon={ClockIcon}
          color="#FF5B5B"
        />
      </div>

      {/* Status das Provas e Distribuição */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status das Provas */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status das Provas</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="font-medium">Pendentes</span>
              </div>
              <span className="text-lg font-semibold">{stats.systemStats.proofsByStatus.SUBMITTED}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="font-medium">Aprovadas</span>
              </div>
              <span className="text-lg font-semibold">{stats.systemStats.proofsByStatus.APPROVED}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="font-medium">Rejeitadas</span>
              </div>
              <span className="text-lg font-semibold">{stats.systemStats.proofsByStatus.REJECTED}</span>
            </div>
          </div>
        </div>

        {/* Distribuição por Estado */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Estado</h3>
          <div className="h-64">
            <Bar 
              data={stateChartData}
              options={stateChartOptions}
            />
          </div>
        </div>
      </div>

      {/* Alertas do Sistema */}
      {dashboardData?.systemAlerts?.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas do Sistema</h3>
          <div className="space-y-4">
            {dashboardData.systemAlerts.map((alert: any, index: number) => (
              <div
                key={index}
                className={clsx(
                  'p-4 rounded-lg',
                  alert.type === 'error' ? 'bg-red-50 text-red-700' :
                  alert.type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                  'bg-blue-50 text-blue-700'
                )}
              >
                <p className="font-medium">{alert.message}</p>
                {alert.details && (
                  <div className="mt-2 text-sm space-y-1">
                    {alert.type === 'warning' ? (
                      <p className="text-sm">
                        Última atividade: {alert.details.lastActivity}
                      </p>
                    ) : alert.type === 'error' ? (
                      <p className="text-sm">
                        Taxa de rejeição: {alert.details.rate}
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
