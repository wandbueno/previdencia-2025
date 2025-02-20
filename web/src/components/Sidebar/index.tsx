import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { getUser } from '@/utils/auth';
import { superAdminNavigation, organizationNavigation } from '@/constants/navigation';
import { cn } from '@/utils/cn';
import { SidebarToggle } from '../SidebarToggle';

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

export function Sidebar({ open, onOpenChange, isExpanded, onExpandedChange }: SidebarProps) {
  const location = useLocation();
  const { subdomain } = useParams();
  const user = getUser();

  const navigation = user?.isSuperAdmin ? superAdminNavigation : organizationNavigation;

  return (
    <>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={onOpenChange}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => onOpenChange(false)}
                    >
                      <span className="sr-only">Fechar menu</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>

                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-3 pb-4">
                  <div className="mt-4">
                    <SidebarContent 
                      location={location} 
                      navigation={navigation} 
                      expanded={true} 
                      subdomain={subdomain}
                    />
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className={cn(
        "hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:flex-col bg-white shadow-sm transition-all duration-300 mt-14",
        isExpanded ? "lg:w-56" : "lg:w-14"
      )}>
        <div className="flex grow flex-col h-full">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1">
              <div className="px-4 py-2">
                <div className="h-2 flex items-center">
                  <SidebarToggle expanded={isExpanded} onChange={onExpandedChange} />
                </div>
                <div className="mt-2">
                  <SidebarContent 
                    location={location} 
                    navigation={navigation} 
                    expanded={isExpanded} 
                    subdomain={subdomain}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface SidebarContentProps {
  location: { pathname: string };
  navigation: Array<{
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
  expanded: boolean;
  subdomain?: string;
}

function SidebarContent({ location, navigation, expanded, subdomain }: SidebarContentProps) {
  function getHref(href: string) {
    if (subdomain && !href.startsWith('/')) {
      return `/${subdomain}/${href}`;
    }
    return href;
  }

  return (
    <nav className="flex flex-1 flex-col">
      <ul role="list" className="flex flex-1 flex-col gap-y-1">
        <li>
          <ul role="list" className="space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={getHref(item.href)}
                  className={cn(
                    'flex items-center rounded-lg transition-colors group',
                    location.pathname === getHref(item.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50',
                    expanded ? 'px-2.5 py-1.5' : 'justify-center p-1.5',
                  )}
                  title={!expanded ? item.name : undefined}
                >
                  <div className={cn(
                    'rounded-lg transition-colors p-1',
                    location.pathname === getHref(item.href) ? 'bg-blue-100' : 'group-hover:bg-blue-100'
                  )}>
                    <item.icon
                      className={cn(
                        'w-4 h-4',
                        location.pathname === getHref(item.href)
                          ? 'text-blue-600'
                          : 'text-gray-400 group-hover:text-blue-600'
                      )}
                      aria-hidden="true"
                    />
                  </div>
                  {expanded && <span className="ml-2 text-sm font-medium">{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      </ul>
    </nav>
  );
}