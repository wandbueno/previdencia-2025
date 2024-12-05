import { MapPinIcon, UserIcon, ClockIcon } from '@heroicons/react/24/outline';
import { StatCard } from '@/components/StatCard';
import { AlertItem } from '@/components/AlertItem';
import { ActivityCard } from '@/components/ActivityCard';
import { StatusCard } from '@/components/StatusCard';
import { navigation } from '@/constants/navigation';

export function DashboardPage() {
  const organization = {
    name: "Fundo municipal de previdencia social dos servidores",
    location: "Arraias - TO",
    period: "01/03/2024 a 30/04/2024"
  };

  const stats = [
    {
      title: "Total de Usuários",
      value: "1.234",
      icon: UserIcon,
      color: "#4318FF"
    },
    {
      title: "Provas Realizadas",
      value: "856",
      icon: UserIcon,
      color: "#05CD99"
    },
    {
      title: "Provas Pendentes",
      value: "378",
      icon: ClockIcon,
      color: "#FFB547"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <div className="mt-2 flex items-center gap-6">
          <div className="flex items-center gap-2 text-gray-500">
            <MapPinIcon className="w-5 h-5" />
            <span>{organization.location}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <UserIcon className="w-5 h-5" />
            <span>{organization.name}</span>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Período atual: {organization.period}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
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
            icon={UserIcon}
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