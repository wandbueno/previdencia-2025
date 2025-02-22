import { UserType } from './user';

export interface RequestOrganization {
  id: string;
  name: string;
  subdomain: string;
  state: string;
  city: string;
  active: number;
  services: any[];
}

declare global {
  namespace Express {
    interface Request {
      organization?: RequestOrganization;
      user: {
        id: string;
        email?: string;
        isSuperAdmin?: boolean;
        organizationId?: string;
        role?: UserType;
      };
    }
  }
}

export {};
