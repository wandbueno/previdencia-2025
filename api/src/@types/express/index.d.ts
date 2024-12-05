import { Database } from 'better-sqlite3';

declare global {
  namespace Express {
    interface Request {
      organization?: {
        id: string;
        name: string;
        subdomain: string;
      };
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