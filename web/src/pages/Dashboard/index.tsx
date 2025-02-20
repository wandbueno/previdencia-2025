import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { StatCard } from '@/components/StatCard';
import { AlertItem } from '@/components/AlertItem';
import clsx from 'clsx';
import { 
  UsersIcon, 
  DocumentCheckIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
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
import { Bar, Doughnut } from 'react-chartjs-2';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const statusColors = {
  SUBMITTED: '#FFB547', // Amarelo
  APPROVED: '#05CD99',  // Verde
  REJECTED: '#FF5B5B',  // Vermelho
  PENDING: '#4318FF'    // Azul
};

const statusLabels = {
  SUBMITTED: 'Enviado',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
  PENDING: 'Pendente'
};

export function DashboardPage() {
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/stats');
      return response.data;
    }
  });

  const stats = dashboardData?.stats || {
    totalUsers: 0,
    proofsThisMonth: 0,
    pendingProofs: 0,
    nearExpiration: 0
  };

  const organization = dashboardData?.organization;

  // Configuração do gráfico de status
  const statusChartData = {
    labels: dashboardData?.charts.proofsByStatus.map((item: any) => statusLabels[item.status as keyof typeof statusLabels]) || [],
    datasets: [
      {
        data: dashboardData?.charts.proofsByStatus.map((item: any) => item.count) || [],
        backgroundColor: dashboardData?.charts.proofsByStatus.map((item: any) => statusColors[item.status as keyof typeof statusColors]) || [],
      },
    ],
  };

  // Configuração do gráfico mensal
  const monthlyChartData = {
    labels: dashboardData?.charts.proofsByMonth.map((item: any) => 
      format(parseISO(item.month + '-01'), 'MMM/yyyy', { locale: ptBR })
    ) || [],
    datasets: [
      {
        label: 'Provas de Vida',
        data: dashboardData?.charts.proofsByMonth.map((item: any) => item.count) || [],
        backgroundColor: '#4318FF',
      },
    ],
  };

  const monthlyChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Provas de Vida por Mês',
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho da Organização */}
      {organization && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {organization.city} - {organization.state}
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Usuários"
          value={stats.totalUsers}
          icon={UsersIcon}
          color="#4318FF"
        />
        <StatCard
          title="Provas este Mês"
          value={stats.proofsThisMonth}
          icon={DocumentCheckIcon}
          color="#05CD99"
        />
        <StatCard
          title="Provas Pendentes"
          value={stats.pendingProofs}
          icon={ClockIcon}
          color="#FFB547"
        />
        <StatCard
          title="Próximas do Vencimento"
          value={stats.nearExpiration}
          icon={ExclamationTriangleIcon}
          color="#FF5B5B"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status das Provas de Vida</h3>
          <div className="h-64">
            <Doughnut 
              data={statusChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolução Mensal</h3>
          <div className="h-64">
            <Bar 
              data={monthlyChartData}
              options={monthlyChartOptions}
            />
          </div>
        </div>
      </div>

      {/* Alerts and Recent Proofs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Alertas e Notificações
          </h2>
          <div className="space-y-3">
            {stats.nearExpiration > 0 && (
              <AlertItem 
                icon={ClockIcon}
                message={`${stats.nearExpiration} usuários com prazo próximo do vencimento`}
                color="#FFB547"
              />
            )}
            {stats.pendingProofs > 0 && (
              <AlertItem 
                icon={ExclamationTriangleIcon}
                message={`${stats.pendingProofs} provas de vida pendentes de análise`}
                color="#FF5B5B"
              />
            )}
          </div>
        </div>

        {/* Recent Proofs Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Provas de Vida Recentes
          </h2>
          <div className="space-y-3">
            {dashboardData?.recentProofs?.map((proof: any, index: number) => (
              <div key={`recent-proof-${proof.id}-${index}`} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={clsx(
                  'w-2 h-2 rounded-full',
                  proof.status === 'SUBMITTED' ? 'bg-blue-500' :
                  proof.status === 'APPROVED' ? 'bg-green-500' :
                  proof.status === 'REJECTED' ? 'bg-red-500' :
                  'bg-gray-500'
                )} />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{proof.user_name}</span>
                    {' enviou uma prova de vida'}
                  </p>
                  <p className="text-xs text-gray-500">{formatDistanceToNow(parseISO(proof.created_at), { addSuffix: true, locale: ptBR })}</p>
                </div>
              </div>
            ))}
            {(!dashboardData?.recentProofs || dashboardData.recentProofs.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhuma prova de vida enviada nas últimas 24 horas
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
