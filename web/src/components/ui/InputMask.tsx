import { forwardRef } from 'react';
import { IMaskInput } from 'react-imask';
import { cn } from '@/lib/utils';

type InputMaskProps = {
  error?: string;
  onChangeUnmasked?: (unmaskedValue: string) => void;
  mask: string;
  value?: string;
  className?: string;
  placeholder?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
};

export const InputMask = forwardRef<HTMLInputElement, InputMaskProps>(
  ({ className, error, onChangeUnmasked, mask, ...props }, ref) => {
    return (
      <>
        <IMaskInput
          {...props}
          mask={mask}
          unmask={true}
          onAccept={(_, mask) => {
            onChangeUnmasked?.(mask.unmaskedValue);
          }}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500',
            className
          )}
          inputRef={ref}
        />
        {error && <span className="text-sm text-red-500">{error}</span>}
      </>
    );
  }
);

InputMask.displayName = 'InputMask';
