import {
  HomeIcon,
  BuildingOfficeIcon,
  UsersIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';

export const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    superAdmin: true,
  },
  {
    name: 'Organizações',
    href: '/organizations',
    icon: BuildingOfficeIcon,
    superAdmin: true,
  },
  {
    name: 'Usuários',
    href: '/users',
    icon: UsersIcon,
    superAdmin: true,
  },
  {
    name: 'Prova de Vida',
    href: '/proof-of-life',
    icon: IdentificationIcon,
    superAdmin: false,
  },
];