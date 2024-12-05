import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { getUser, clearAuth } from '@/utils/auth';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';

export function Header() {
  const navigate = useNavigate();
  const user = getUser();

  function handleLogout() {
    clearAuth();
    navigate('/');
  }

  return (
    <div className="flex flex-1 items-center justify-end">
      <Menu as="div" className="relative">
        <Menu.Button className="-m-1.5 flex items-center p-1.5">
          <span className="sr-only">Abrir menu do usuário</span>
          <UserCircleIcon className="h-8 w-8 text-gray-500" aria-hidden="true" />
          <span className="hidden lg:flex lg:items-center">
            <span className="ml-4 text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
              {user?.name}
            </span>
          </span>
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  onClick={handleLogout}
                  className={cn(
                    active ? 'bg-gray-50' : '',
                    'block w-full px-3 py-1 text-sm leading-6 text-gray-900 text-left'
                  )}
                >
                  Sair
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}