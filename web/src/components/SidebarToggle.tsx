import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { cn } from '@/utils/cn';

interface SidebarToggleProps {
  expanded: boolean;
  onChange: (expanded: boolean) => void;
}

export function SidebarToggle({ expanded, onChange }: SidebarToggleProps) {
  return (
    <button
      onClick={() => onChange(!expanded)}
      className={cn(
        "absolute -right-3 top-6",
        "flex h-6 w-6 items-center justify-center",
        "rounded-full border border-gray-200 bg-white shadow-sm",
        "hover:bg-gray-50 hover:shadow",
        "transition-all duration-200"
      )}
      title={expanded ? "Recolher menu" : "Expandir menu"}
    >
      {expanded ? (
        <ChevronLeftIcon className="h-4 w-4 text-gray-600" />
      ) : (
        <ChevronRightIcon className="h-4 w-4 text-gray-600" />
      )}
    </button>
  );
}