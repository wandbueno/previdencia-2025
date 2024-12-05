import { db } from '../../lib/database';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { AppError } from '../../errors/AppError';

interface AuthRequest {
  email: string;
  password: string;
  subdomain: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  active: number;
}

interface Organization {
  id: string;
  name: string;
  subdomain: string;
  state: string;
  city: string;
  active: number;
  services: string;
}

export class OrganizationAuthService {
  async execute({ email, password, subdomain }: AuthRequest) {
    try {
      const mainDb = db.getMainDb();

      // Get organization
      const organization = mainDb.prepare(`
        SELECT * FROM organizations 
        WHERE subdomain = ? AND active = 1
      `).get(subdomain) as Organization;

      if (!organization) {
        throw new AppError('Organization not found or inactive', 401);
      }

      // Get organization database
      const organizationDb = await db.getOrganizationDb(subdomain);

      // Get admin user
      const user = organizationDb.prepare(`
        SELECT * FROM admin_users 
        WHERE email = ? AND active = 1
      `).get(email) as AdminUser;

      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }

      const passwordMatch = await compare(password, user.password);

      if (!passwordMatch) {
        throw new AppError('Invalid credentials', 401);
      }

      const token = sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          organizationId: organization.id
        },
        process.env.JWT_SECRET as string,
        {
          expiresIn: '1d'
        }
      );

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: {
          id: organization.id,
          name: organization.name,
          subdomain: organization.subdomain,
          state: organization.state,
          city: organization.city
        },
        token
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error in organization authentication:', error);
      throw new AppError('Internal server error', 500);
    }
  }
}