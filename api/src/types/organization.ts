export interface Organization {
  id: string;
  name: string;
  subdomain: string;
  state: string;
  city: string;
  active: boolean;
  services: string[];
}

export interface CreateOrganizationDTO {
  name: string;
  subdomain: string;
  state: string;
  city: string;
  services: string[];
}

export interface UpdateOrganizationDTO {
  id: string;
  name: string;
  state: string;
  city: string;
  active: boolean;
  services: string[];
}