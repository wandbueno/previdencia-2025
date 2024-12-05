import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { getCurrentTimestamp } from '../../utils/database';

interface UpdateUserRequest {
  id: string;
  name: string;
  email: string;
  active: boolean;
  subdomain?: string;
  type?: 'admin' | 'app';
  organizationId?: string;
}

export class UpdateUserService {
  async execute({ id, name, email, active, subdomain, type, organizationId }: UpdateUserRequest) {
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
          SELECT email FROM app_users WHERE id = ?
        `).get(id) as { email: string } | undefined;

        if (!user) {
          throw new AppError('User not found');
        }

        // Check if email is already in use by another user
        if (email !== user.email) {
          const emailExists = organizationDb.prepare(`
            SELECT 1 FROM app_users WHERE email = ? AND id != ?
          `).get(email, id);

          if (emailExists) {
            throw new AppError('Email already in use');
          }
        }

        const timestamp = getCurrentTimestamp();

        // Update user
        organizationDb.prepare(`
          UPDATE app_users
          SET name = ?, email = ?, active = ?, updated_at = ?
          WHERE id = ?
        `).run(
          name,
          email,
          active ? 1 : 0,
          timestamp,
          id
        );

        return {
          id,
          name,
          email,
          active,
          updatedAt: timestamp
        };
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
        SELECT email FROM ${tableName} WHERE id = ?
      `).get(id) as { email: string } | undefined;

      if (!user) {
        throw new AppError('User not found');
      }

      // Check if email is already in use by another user
      if (email !== user.email) {
        const emailExists = organizationDb.prepare(`
          SELECT 1 FROM ${tableName} WHERE email = ? AND id != ?
        `).get(email, id);

        if (emailExists) {
          throw new AppError('Email already in use');
        }
      }

      const timestamp = getCurrentTimestamp();

      // Update user
      organizationDb.prepare(`
        UPDATE ${tableName}
        SET name = ?, email = ?, active = ?, updated_at = ?
        WHERE id = ?
      `).run(
        name,
        email,
        active ? 1 : 0,
        timestamp,
        id
      );

      return {
        id,
        name,
        email,
        active,
        updatedAt: timestamp
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error updating user:', error);
      throw new AppError('Error updating user');
    }
  }
}