export type UserType = 'ADMIN' | 'USER';
export type UserTableType = 'admin' | 'app';

export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  role: UserType;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  organizationId?: string;
  organizationName?: string;
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

export interface CreateUserDTO {
  name: string;
  email: string;
  cpf: string;
  password: string;
  tableType: UserTableType;
  organizationId: string;
}

export interface UpdateUserDTO {
  id: string;
  name: string;
  email: string;
  active: boolean;
  subdomain?: string;
  tableType?: UserTableType;
  organizationId?: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  cpf: string;
  role: UserType;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  organizationId?: string;
  organizationName?: string;
}

export interface UserTokenPayload {
  id: string;
  email?: string;
  isSuperAdmin?: boolean;
  organizationId?: string;
  role?: UserType;
}