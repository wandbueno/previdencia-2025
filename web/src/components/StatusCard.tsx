import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Aprovadas', value: 856, color: '#05CD99' },
  { name: 'Pendentes', value: 378, color: '#FFB547' },
  { name: 'Rejeitadas', value: 124, color: '#FF5B5B' },
];

export function StatusCard() {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Status de Verificações
      </h2>
      <div className="flex items-center justify-between">
        <div className="w-[180px] h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 ml-8">
          <div className="space-y-4">
            {data.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.value}</span>
                  <span className="text-sm text-gray-500">
                    ({Math.round((item.value / total) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}