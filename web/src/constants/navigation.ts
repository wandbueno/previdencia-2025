import {
  HomeIcon,
  BuildingOfficeIcon,
  UsersIcon,
  IdentificationIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

export const superAdminNavigation = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: HomeIcon,
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
  {
    name: 'Recadastramento',
    href: 'recadastration',
    icon: DocumentTextIcon,
  },
];