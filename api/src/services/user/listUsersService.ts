import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { UserTableType, UserResponse } from '../../types/user';

interface ListUsersRequest {
  subdomain?: string;
  tableType?: UserTableType;
  organizationId?: string;
}

export class ListUsersService {
  async execute({ subdomain, tableType, organizationId }: ListUsersRequest): Promise<UserResponse[]> {
    try {
      const mainDb = db.getMainDb();
      const tableName = tableType === 'admin' ? 'admin_users' : 'app_users';

      // For super admin listing users across organizations
      if (organizationId) {
        const organization = mainDb.prepare(`
          SELECT subdomain, name FROM organizations 
          WHERE id = ? AND active = 1
        `).get(organizationId) as { subdomain: string; name: string } | undefined;

        if (!organization) {
          throw new AppError('Organization not found or inactive');
        }

        const organizationDb = await db.getOrganizationDb(organization.subdomain);
        
        const users = organizationDb.prepare(`
          SELECT 
            id, name, email, cpf, role, active,
            created_at as createdAt,
            updated_at as updatedAt
          FROM ${tableName}
          ORDER BY name ASC
        `).all() as UserResponse[];

        return users.map(user => ({
          ...user,
          active: Boolean(user.active),
          organizationId,
          organizationName: organization.name
        }));
      }

      // For organization admin listing their own users
      if (subdomain) {
        const organization = mainDb.prepare(`
          SELECT id, name FROM organizations 
          WHERE subdomain = ? AND active = 1
        `).get(subdomain) as { id: string; name: string } | undefined;

        if (!organization) {
          throw new AppError('Organization not found or inactive');
        }

        const organizationDb = await db.getOrganizationDb(subdomain);
        
        const users = organizationDb.prepare(`
          SELECT 
            id, name, email, cpf, role, active,
            created_at as createdAt,
            updated_at as updatedAt
          FROM ${tableName}
          ORDER BY name ASC
        `).all() as UserResponse[];

        return users.map(user => ({
          ...user,
          active: Boolean(user.active),
          organizationId: organization.id,
          organizationName: organization.name
        }));
      }

      throw new AppError('Invalid request parameters');
    } catch (error) {
      console.error('Error listing users:', error);
      throw new AppError('Error listing users');
    }
  }
}