import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { cn } from '@/utils/cn';

export interface Option<T> {
  value: T & (string | number)
  label: string;
}

interface SelectProps<T> {
  id?: string;
  options: Option<T>[];
  value?: T;
  onChange?: (option: Option<T>) => void;
  name?: string;
  onBlur?: () => void;
  ref?: React.Ref<any>;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
}

export function Select<T>({
  id,
  options,
  value,
  onChange,
  name,
  onBlur,
  ref,
  placeholder = 'Selecione uma opção',
  disabled,
  error,
  label
}: SelectProps<T>) {
  const selectedOption = options.find(option => option.value === value);

  const handleChange = (newOption: Option<T>) => {
    if (onChange) {
      if (name) {
        // Se estiver usando com react-hook-form, simular um evento de input
        const event = {
          target: { name, value: newOption.value },
          type: 'change'
        };
        onChange({ ...newOption, value: event.target.value } as any);
      } else {
        // Caso contrário, chamar onChange normalmente
        onChange(newOption);
      }
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div onBlur={onBlur}>
        <Listbox 
          value={selectedOption} 
          onChange={handleChange} 
          disabled={disabled}
          name={name}
          ref={ref}
        >
          <div className="relative">
            <Listbox.Button
              id={id}
              className={cn(
                'relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6',
                error && 'ring-red-300 focus:ring-red-500',
                disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed'
              )}
            >
              <span className="block truncate">
                {selectedOption?.label || placeholder}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {options.map((option) => (
                  <Listbox.Option
                    key={option.value}
                    value={option}
                    className={({ active }) =>
                      cn(
                        'relative cursor-default select-none py-2 pl-3 pr-9',
                        active ? 'bg-primary-600 text-white' : 'text-gray-900'
                      )
                    }
                  >
                    {({ active, selected }) => (
                      <>
                        <span
                          className={cn(
                            'block truncate',
                            selected && 'font-semibold'
                          )}
                        >
                          {option.label}
                        </span>

                        {selected && (
                          <span
                            className={cn(
                              'absolute inset-y-0 right-0 flex items-center pr-4',
                              active ? 'text-white' : 'text-primary-600'
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}