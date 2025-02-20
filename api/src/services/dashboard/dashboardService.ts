import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';

interface DashboardStats {
  totalUsers: number;
  completedSubmissions: number;
  pendingSubmissions: number;
}

export class DashboardService {
  async getStats(organizationId: string): Promise<DashboardStats> {
    try {
      const mainDb = db.getMainDb();

      // Get organization
      const organization = mainDb.prepare(`
        SELECT subdomain FROM organizations 
        WHERE id = ? AND active = 1
      `).get(organizationId) as { subdomain: string } | undefined;

      if (!organization) {
        throw new AppError('Organization not found or inactive');
      }

      const organizationDb = await db.getOrganizationDb(organization.subdomain);

      // Get total users
      const totalUsers = organizationDb.prepare(`
        SELECT COUNT(*) as count FROM app_users WHERE active = 1
      `).get() as { count: number };

      // Get completed submissions
      const completedSubmissions = organizationDb.prepare(`
        SELECT COUNT(*) as count 
        FROM (
          SELECT id FROM proof_of_life WHERE status = 'APPROVED'
          UNION ALL
          SELECT id FROM recadastration WHERE status = 'APPROVED'
        )
      `).get() as { count: number };

      // Get pending submissions
      const pendingSubmissions = organizationDb.prepare(`
        SELECT COUNT(*) as count 
        FROM (
          SELECT id FROM proof_of_life WHERE status = 'PENDING'
          UNION ALL
          SELECT id FROM recadastration WHERE status = 'PENDING'
        )
      `).get() as { count: number };

      return {
        totalUsers: totalUsers.count,
        completedSubmissions: completedSubmissions.count,
        pendingSubmissions: pendingSubmissions.count
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error getting dashboard stats:', error);
      throw new AppError('Error getting dashboard stats');
    }
  }
}