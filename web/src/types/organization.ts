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
  logo_url?: string;
  active: boolean;
  services: string[];
  created_at: string;
  updated_at: string;
}
