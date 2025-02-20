import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { cn } from '@/utils/cn';

export interface Option<T> {
  value: T;
  label: string;
}

interface SelectProps<T> {
  id?: string;
  options: Option<T>[];
  value?: T;
  onChange?: (value: T) => void;
  name?: string;
  onBlur?: () => void;
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
  placeholder = 'Selecione uma opção',
  disabled,
  error,
  label
}: SelectProps<T>) {
  const selectedOption = options.find(option => option.value === value) || null;

  const handleChange = (option: Option<T>) => {
    onChange?.(option.value);
  };

  return (
    <div>
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
        >
          <div className="relative mt-1">
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
                {options.map((option, index) => (
                  <Listbox.Option
                    key={index}
                    className={({ active }) =>
                      cn(
                        'relative cursor-default select-none py-2 pl-10 pr-4',
                        active ? 'bg-primary-100 text-primary-900' : 'text-gray-900'
                      )
                    }
                    value={option}
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={cn('block truncate', selected && 'font-semibold')}>
                          {option.label}
                        </span>

                        {selected && (
                          <span
                            className={cn(
                              'absolute inset-y-0 left-0 flex items-center pl-3',
                              active ? 'text-primary-600' : 'text-primary-600'
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
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}