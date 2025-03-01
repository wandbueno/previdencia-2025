import {
  HomeIcon,
  BuildingOfficeIcon,
  UsersIcon,
  IdentificationIcon,
  CalendarIcon,
  ServerIcon,
} from '@heroicons/react/24/outline';

export const superAdminNavigation = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: HomeIcon,
  },
  {
    name: 'Eventos',
    href: '/admin/events',
    icon: CalendarIcon,
  },
  {
    name: 'Organizações',
    href: '/admin/organizations',
    icon: BuildingOfficeIcon,
  },
  {
    name: 'Usuários',
    href: '/admin/users',
    icon: UsersIcon,
  },
  {
    name: 'Backup',
    href: '/admin/backups',
    icon: ServerIcon,
  },
];

export const organizationNavigation = [
  {
    name: 'Dashboard',
    href: 'dashboard',
    icon: HomeIcon,
  },
  {
    name: 'Usuários',
    href: 'users',
    icon: UsersIcon,
  },
  {
    name: 'Prova de Vida',
    href: 'proof-of-life',
    icon: IdentificationIcon,
  },
];