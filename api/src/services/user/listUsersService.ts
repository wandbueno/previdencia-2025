import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';

interface ListUsersRequest {
  subdomain?: string;
  type?: 'admin' | 'app';
  organizationId?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  role: string;
  active: number;
  created_at: string;
  updated_at: string;
}

export class ListUsersService {
  async execute({ subdomain, type, organizationId }: ListUsersRequest) {
    try {
      const mainDb = db.getMainDb();

      // For super admin listing users across organizations
      if (organizationId) {
        const organization = mainDb.prepare(`
          SELECT subdomain FROM organizations 
          WHERE id = ? AND active = 1
        `).get(organizationId) as { subdomain: string } | undefined;

        if (!organization) {
          throw new AppError('Organization not found or inactive');
        }

        const organizationDb = await db.getOrganizationDb(organization.subdomain);
        const tableName = type === 'admin' ? 'admin_users' : 'app_users';
        
        const users = organizationDb.prepare(`
          SELECT * FROM ${tableName}
          ORDER BY name ASC
        `).all() as User[];

        return users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          cpf: user.cpf,
          role: type === 'admin' ? 'ADMIN' : 'USER',
          active: Boolean(user.active),
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          organizationId
        }));
      }

      // For organization admin listing their own users
      if (subdomain) {
        const organization = mainDb.prepare(`
          SELECT id FROM organizations 
          WHERE subdomain = ? AND active = 1
        `).get(subdomain) as { id: string } | undefined;

        if (!organization) {
          throw new AppError('Organization not found or inactive');
        }

        const organizationDb = await db.getOrganizationDb(subdomain);
        const tableName = type === 'admin' ? 'admin_users' : 'app_users';
        
        const users = organizationDb.prepare(`
          SELECT * FROM ${tableName}
          ORDER BY name ASC
        `).all() as User[];

        return users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          cpf: user.cpf,
          role: type === 'admin' ? 'ADMIN' : 'USER',
          active: Boolean(user.active),
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          organizationId: organization.id
        }));
      }

      throw new AppError('Invalid request parameters');
    } catch (error) {
      console.error('Error listing users:', error);
      throw new AppError('Error listing users');
    }
  }
}