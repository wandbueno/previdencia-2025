import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, id, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            {label}
          </label>
        )}
        <div className={cn(label && "mt-2")}>
          <input
            id={id}
            ref={ref}
            className={cn(
              'block w-full rounded-lg border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300',
              'placeholder:text-gray-400',
              'focus:ring-2 focus:ring-inset focus:ring-primary-600',
              'sm:text-sm sm:leading-6',
              error && 'ring-red-300 focus:ring-red-500',
              className
            )}
            {...props}
          />
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';