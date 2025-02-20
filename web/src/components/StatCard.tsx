import { cn } from '@/utils/cn';

interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<IconProps>;
  color: string;
}

export function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="mt-2 text-3xl font-bold" style={{ color }}>
            {value}
          </p>
        </div>
        <div 
          className={cn("p-3 rounded-lg")} 
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon 
            className={cn("w-6 h-6")} 
            style={{ color }} 
          />
        </div>
      </div>
    </div>
  );
}