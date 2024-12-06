import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { getCurrentTimestamp } from '../../utils/database';
import { UpdateUserDTO, UserType, UserTableType } from '../../types/user';

interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  active: number;
  role: UserType;
}

export class UpdateUserService {
  async execute({ id, name, email, active, subdomain, tableType, organizationId }: UpdateUserDTO) {
    try {
      const mainDb = db.getMainDb();
      const tableName = tableType === 'admin' ? 'admin_users' : 'app_users';

      // Get organization info
      const organization = mainDb.prepare(`
        SELECT id, subdomain, name FROM organizations 
        WHERE ${subdomain ? 'subdomain = ?' : 'id = ?'} AND active = 1
      `).get(subdomain || organizationId) as { id: string; subdomain: string; name: string } | undefined;

      if (!organization) {
        throw new AppError('Organization not found or inactive');
      }

      const organizationDb = await db.getOrganizationDb(organization.subdomain);

      // Check if user exists
      const user = organizationDb.prepare(`
        SELECT id, email, name, active, role FROM ${tableName} WHERE id = ?
      `).get(id) as DatabaseUser | undefined;

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
        role: user.role,
        updatedAt: timestamp,
        organizationId: organization.id,
        organizationName: organization.name
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