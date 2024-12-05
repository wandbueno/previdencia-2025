import { cn } from '@/utils/cn';

interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}

interface AlertItemProps {
  icon: React.ComponentType<IconProps>;
  message: string;
  color: string;
}

export function AlertItem({ icon: Icon, message, color }: AlertItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white">
      <div 
        className={cn("p-2 rounded-lg")} 
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon 
          className={cn("w-5 h-5")} 
          style={{ color }} 
        />
      </div>
      <span className="text-sm text-gray-600">{message}</span>
    </div>
  );
}