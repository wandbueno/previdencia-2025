import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';

interface DeleteUserRequest {
  id: string;
  subdomain?: string;
  type?: 'admin' | 'app';
  organizationId?: string;
}

export class DeleteUserService {
  async execute({ id, subdomain, type, organizationId }: DeleteUserRequest) {
    try {
      const mainDb = db.getMainDb();

      // For organization users
      if (subdomain) {
        const organization = mainDb.prepare(`
          SELECT id FROM organizations WHERE subdomain = ? AND active = 1
        `).get(subdomain) as { id: string } | undefined;

        if (!organization) {
          throw new AppError('Organization not found or inactive');
        }

        const organizationDb = await db.getOrganizationDb(subdomain);

        // Check if user exists
        const user = organizationDb.prepare(`
          SELECT 1 FROM app_users WHERE id = ?
        `).get(id);

        if (!user) {
          throw new AppError('User not found');
        }

        // Delete user
        organizationDb.prepare(`
          DELETE FROM app_users WHERE id = ?
        `).run(id);

        return;
      }

      // For super admin users
      if (!organizationId || !type) {
        throw new AppError('Organization ID and type are required');
      }

      const organization = mainDb.prepare(`
        SELECT subdomain FROM organizations WHERE id = ? AND active = 1
      `).get(organizationId) as { subdomain: string } | undefined;

      if (!organization) {
        throw new AppError('Organization not found or inactive');
      }

      const organizationDb = await db.getOrganizationDb(organization.subdomain);

      const tableName = type === 'admin' ? 'admin_users' : 'app_users';

      // Check if user exists
      const user = organizationDb.prepare(`
        SELECT 1 FROM ${tableName} WHERE id = ?
      `).get(id);

      if (!user) {
        throw new AppError('User not found');
      }

      // Delete user
      organizationDb.prepare(`
        DELETE FROM ${tableName} WHERE id = ?
      `).run(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error deleting user:', error);
      throw new AppError('Error deleting user');
    }
  }
}