import { UserIcon } from '@heroicons/react/24/outline';

export function ActivityCard() {
  const activities = [
    {
      id: 1,
      user: 'João Silva',
      action: 'enviou uma nova prova de vida',
      time: '2 minutos atrás'
    },
    {
      id: 2,
      user: 'Maria Santos',
      action: 'atualizou seus dados cadastrais',
      time: '5 minutos atrás'
    },
    {
      id: 3,
      user: 'Pedro Oliveira',
      action: 'teve sua prova de vida aprovada',
      time: '10 minutos atrás'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Últimas Atividades
      </h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-blue-50">
              <UserIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-900">
                <span className="font-medium">{activity.user}</span>{' '}
                {activity.action}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}