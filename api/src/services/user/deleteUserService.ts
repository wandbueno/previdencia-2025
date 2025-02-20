import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { UserTableType } from '../../types/user';

interface DeleteUserRequest {
  id: string;
  tableType: UserTableType;
  organizationId: string;
}

export class DeleteUserService {
  async execute({ id, tableType, organizationId }: DeleteUserRequest) {
    try {
      const mainDb = db.getMainDb();
      const tableName = tableType === 'admin' ? 'admin_users' : 'app_users';

      // Get organization
      const organization = mainDb.prepare(`
        SELECT subdomain FROM organizations WHERE id = ? AND active = 1
      `).get(organizationId) as { subdomain: string } | undefined;

      if (!organization) {
        throw new AppError('Organization not found or inactive');
      }

      const organizationDb = await db.getOrganizationDb(organization.subdomain);

      // Check if user exists
      const user = organizationDb.prepare(`
        SELECT 1 FROM ${tableName} WHERE id = ?
      `).get(id);

      if (!user) {
        throw new AppError('User not found');
      }

      // Start transaction
      organizationDb.exec('BEGIN TRANSACTION');

      try {
        // Delete related records first
        if (tableName === 'app_users') {
          // Delete proof of life records
          organizationDb.prepare(`
            DELETE FROM proof_of_life_history WHERE user_id = ?
          `).run(id);

          organizationDb.prepare(`
            DELETE FROM proof_of_life WHERE user_id = ?
          `).run(id);

          // Delete recadastration records
          organizationDb.prepare(`
            DELETE FROM recadastration WHERE user_id = ?
          `).run(id);
        }

        // Delete user
        const result = organizationDb.prepare(`
          DELETE FROM ${tableName} WHERE id = ?
        `).run(id);

        if (result.changes === 0) {
          throw new AppError('Error deleting user');
        }

        // Commit transaction
        organizationDb.exec('COMMIT');
      } catch (error) {
        // Rollback on error
        organizationDb.exec('ROLLBACK');
        throw error;
      }

      return;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error deleting user:', error);
      throw new AppError('Error deleting user');
    }
  }
}