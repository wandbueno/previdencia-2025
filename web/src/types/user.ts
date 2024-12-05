export interface User {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  role: 'ADMIN' | 'USER';
  active: boolean;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  organizationName: string;
}

export interface Organization {
  id: string;
  name: string;
  subdomain: string;
  state: string;
  city: string;
  active: boolean;
  services: string[];
}

export interface CreateUserFormData {
  name: string;
  email: string;
  cpf?: string;
  password: string;
  type: 'admin' | 'app';
  organizationId: string;
}

export interface UpdateUserFormData {
  name: string;
  email: string;
  active: boolean;
  type: 'admin' | 'app';
  organizationId: string;
}