export interface OrganizationRow {
  id: string;
  name: string;
  subdomain: string;
  cnpj: string;
  state: string;
  city: string;
  address: string;
  cep: string;
  phone: string;
  email: string;
  logo_url: string | null;
  active: number;
  services: string;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  subdomain: string;
  cnpj: string;
  state: string;
  city: string;
  address: string;
  cep: string;
  phone: string;
  email: string;
  logo_url: string | null;
  active: boolean;
  services: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateOrganizationDTO {
  name: string;
  subdomain: string;
  cnpj: string;
  state: string;
  city: string;
  address: string;
  cep: string;
  phone: string;
  email: string;
  logo_url: string | null;
  services: string[];
  active?: boolean;
}

export interface UpdateOrganizationDTO {
  name?: string;
  cnpj?: string;
  state?: string;
  city?: string;
  address?: string;
  cep?: string;
  phone?: string;
  email?: string;
  logo_url?: string | null;
  services?: string[];
  active?: boolean;
}

export interface ListOrganizationsFilters {
  active?: boolean;
  state?: string;
  city?: string;
  search?: string;
}