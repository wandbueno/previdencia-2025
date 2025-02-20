import { Request, Response } from 'express';
import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { format, subMonths } from 'date-fns';

export class GetSuperAdminStatsController {
  async handle(request: Request, response: Response) {
    try {
      const mainDb = db.getMainDb();

      // Total de organizações
      const totalOrganizations = mainDb.prepare(`
        SELECT COUNT(*) as count
        FROM organizations
        WHERE active = 1
      `).get() as { count: number };

      // Crescimento mês a mês
      const monthlyGrowth = mainDb.prepare(`
        WITH monthly_counts AS (
          SELECT 
            strftime('%Y-%m', created_at) as month,
            COUNT(*) as count
          FROM organizations
          WHERE active = 1
          GROUP BY strftime('%Y-%m', created_at)
        )
        SELECT 
          month,
          count,
          count - LAG(count) OVER (ORDER BY month) as growth
        FROM monthly_counts
        ORDER BY month DESC
        LIMIT 6
      `).all() as { month: string; count: number; growth: number }[];

      // Organizações por estado
      const organizationsByState = mainDb.prepare(`
        SELECT 
          state,
          COUNT(*) as count
        FROM organizations
        WHERE active = 1
        GROUP BY state
        ORDER BY count DESC
      `).all() as { state: string; count: number }[];

      // Estatísticas de uso do sistema
      const systemStats = {
        totalUsers: 0,
        totalProofs: 0,
        pendingProofs: 0,
        proofsByStatus: {
          SUBMITTED: 0,
          APPROVED: 0,
          REJECTED: 0
        }
      };

      // Alertas do sistema
      const systemAlerts = [];

      // Buscar todas as organizações ativas
      const organizations = mainDb.prepare(`
        SELECT id, name, subdomain, services FROM organizations WHERE active = 1
      `).all() as { id: string; name: string; subdomain: string; services: string }[];

      // Processando cada organização
      for (const org of organizations) {
        try {
          const orgDb = await db.getOrganizationDb(org.subdomain);

          // Verificar se a tabela proof_of_life existe
          const tableExists = orgDb.prepare(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='proof_of_life'
          `).get();

          if (!tableExists) {
            continue;
          }

          // Total de usuários
          const users = orgDb.prepare(`
            SELECT COUNT(*) as count
            FROM app_users
            WHERE active = 1
          `).get() as { count: number };
          systemStats.totalUsers += users.count;

          // Total de provas e status
          const proofStats = orgDb.prepare(`
            SELECT 
              COUNT(*) as total,
              SUM(CASE WHEN status = 'SUBMITTED' THEN 1 ELSE 0 END) as submitted,
              SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved,
              SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected
            FROM proof_of_life
          `).get() as { 
            total: number; 
            submitted: number;
            approved: number;
            rejected: number;
          };

          systemStats.totalProofs += proofStats.total;
          systemStats.pendingProofs += proofStats.submitted;
          systemStats.proofsByStatus.SUBMITTED += proofStats.submitted;
          systemStats.proofsByStatus.APPROVED += proofStats.approved;
          systemStats.proofsByStatus.REJECTED += proofStats.rejected;

          // Taxa de rejeição
          if (proofStats.total > 0) {
            const rejectionRate = Math.round((proofStats.rejected / proofStats.total) * 100);
            if (rejectionRate > 30) {
              systemAlerts.push({
                type: 'error',
                message: `Alta taxa de rejeição em ${org.name}`,
                details: { organization: org.name, rate: `${rejectionRate}%` }
              });
            }
          }

          // Verificar inatividade
          const lastActivity = orgDb.prepare(`
            SELECT MAX(created_at) as last_activity
            FROM proof_of_life
          `).get() as { last_activity: string };

          if (!lastActivity.last_activity || new Date(lastActivity.last_activity) < subMonths(new Date(), 1)) {
            systemAlerts.push({
              type: 'warning',
              message: `${org.name} está sem atividade há mais de 30 dias`,
              details: { 
                organization: org.name,
                lastActivity: lastActivity.last_activity 
                  ? format(new Date(lastActivity.last_activity), 'dd/MM/yyyy')
                  : 'Nenhuma atividade registrada'
              }
            });
          }
        } catch (error) {
          console.error(`Error getting stats for ${org.subdomain}:`, error);
          continue;
        }
      }

      return response.json({
        stats: {
          totalOrganizations: totalOrganizations.count,
          systemStats
        },
        charts: {
          organizationsByState,
          monthlyGrowth
        },
        systemAlerts
      });
    } catch (error) {
      console.error('Error getting super admin dashboard stats:', error);
      if (error instanceof AppError) {
        return response.status(error.statusCode).json({ error: error.message });
      }
      return response.status(500).json({ error: 'Internal server error' });
    }
  }
}
