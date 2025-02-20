import { cn } from '@/utils/cn';

interface LogoProps {
  className?: string;
  expanded?: boolean;
}

export function Logo({ className, expanded = true }: LogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <img
        src="/PUBLIXEL2025min.png"
        alt="Publixel"
        className={cn(
          "h-8 transition-all duration-300",
          expanded ? "w-auto" : "w-8 object-cover object-left"
        )}
      />
    </div>
  );
}