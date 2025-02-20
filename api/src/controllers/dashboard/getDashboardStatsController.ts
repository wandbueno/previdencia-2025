import { Request, Response } from 'express';
import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export class GetDashboardStatsController {
  async handle(request: Request, response: Response) {
    try {
      const { organizationId } = request.user;

      if (!organizationId) {
        throw new AppError('Organization ID not found', 401);
      }

      const mainDb = db.getMainDb();
      
      const organization = mainDb.prepare(`
        SELECT subdomain, name, city, state FROM organizations 
        WHERE id = ? AND active = 1
      `).get(organizationId) as { subdomain: string; name: string; city: string; state: string } | undefined;

      if (!organization) {
        throw new AppError('Organization not found or inactive');
      }

      const organizationDb = await db.getOrganizationDb(organization.subdomain);

      // Total de usuários ativos
      const totalUsers = organizationDb.prepare(`
        SELECT COUNT(*) as count
        FROM app_users
        WHERE active = 1
      `).get() as { count: number };

      // Provas de vida do mês atual
      const currentMonth = format(new Date(), 'yyyy-MM');
      const proofsThisMonth = organizationDb.prepare(`
        SELECT COUNT(*) as count
        FROM proof_of_life
        WHERE strftime('%Y-%m', created_at) = ?
      `).get(currentMonth) as { count: number };

      // Provas pendentes de análise
      const pendingProofs = organizationDb.prepare(`
        SELECT COUNT(*) as count
        FROM proof_of_life
        WHERE status = 'SUBMITTED'
      `).get() as { count: number };

      // Provas por status (últimos 6 meses)
      const sixMonthsAgo = format(subMonths(new Date(), 6), 'yyyy-MM-dd');
      const proofsByStatus = organizationDb.prepare(`
        SELECT 
          status,
          COUNT(*) as count
        FROM proof_of_life
        WHERE created_at >= ?
        GROUP BY status
      `).all(sixMonthsAgo) as { status: string; count: number }[];

      // Provas por mês (últimos 6 meses)
      const proofsByMonth = organizationDb.prepare(`
        SELECT 
          strftime('%Y-%m', created_at) as month,
          COUNT(*) as count
        FROM proof_of_life
        WHERE created_at >= ?
        GROUP BY strftime('%Y-%m', created_at)
        ORDER BY month DESC
      `).all(sixMonthsAgo) as { month: string; count: number }[];

      // Últimas atividades
      const recentActivities = organizationDb.prepare(`
        SELECT 
          p.id,
          p.status,
          p.created_at,
          u.name as user_name,
          a.name as reviewer_name,
          h.action,
          h.comments
        FROM proof_of_life p
        JOIN app_users u ON u.id = p.user_id
        LEFT JOIN proof_of_life_history h ON h.proof_id = p.id
        LEFT JOIN admin_users a ON a.id = h.reviewed_by
        ORDER BY p.created_at DESC
        LIMIT 10
      `).all() as any[];

      // Provas de vida recentes (últimas 24 horas)
      const recentProofs = organizationDb.prepare(`
        SELECT 
          p.id,
          p.created_at,
          u.name as user_name,
          p.status
        FROM proof_of_life p
        JOIN app_users u ON u.id = p.user_id
        WHERE p.created_at >= datetime('now', '-1 day')
        ORDER BY p.created_at DESC
        LIMIT 5
      `).all() as any[];

      // Alertas
      const nearExpirationCount = organizationDb.prepare(`
        SELECT COUNT(*) as count
        FROM app_users u
        LEFT JOIN proof_of_life p ON p.user_id = u.id
        WHERE p.id IS NULL OR p.created_at < date('now', '-11 months')
      `).get() as { count: number };

      return response.json({
        organization: {
          name: organization.name,
          city: organization.city,
          state: organization.state
        },
        stats: {
          totalUsers: totalUsers.count,
          proofsThisMonth: proofsThisMonth.count,
          pendingProofs: pendingProofs.count,
          nearExpiration: nearExpirationCount.count
        },
        charts: {
          proofsByStatus,
          proofsByMonth
        },
        activities: recentActivities,
        alerts: {
          nearExpiration: nearExpirationCount.count,
          pendingReview: pendingProofs.count
        },
        recentProofs
      });
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      if (error instanceof AppError) {
        return response.status(error.statusCode).json({ error: error.message });
      }
      return response.status(500).json({ error: 'Internal server error' });
    }
  }
}
