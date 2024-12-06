import { Organization } from './organization';
import { User } from './user';

declare global {
  namespace Express {
    interface Request {
      organization?: Organization;
      user: {
        id: string;
        email?: string;
        isSuperAdmin?: boolean;
        organizationId?: string;
        role?: string;
      };
    }
  }
}

export {};