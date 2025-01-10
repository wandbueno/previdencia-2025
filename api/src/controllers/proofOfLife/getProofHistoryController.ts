import { Request, Response } from 'express';
import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';

export class GetProofHistoryController {
  async handle(request: Request, response: Response) {
    try {
      const { id } = request.params;
      const { organizationId } = request.user;

      if (!organizationId) {
        throw new AppError('Organization ID not found', 401);
      }

      const mainDb = db.getMainDb();
      
      const organization = mainDb.prepare(`
        SELECT subdomain FROM organizations 
        WHERE id = ? AND active = 1
      `).get(organizationId) as { subdomain: string } | undefined;

      if (!organization) {
        throw new AppError('Organization not found or inactive');
      }

      const organizationDb = await db.getOrganizationDb(organization.subdomain);

      const history = organizationDb.prepare(`
        SELECT 
          h.*,
          a.name as reviewer_name
        FROM proof_of_life_history h
        LEFT JOIN admin_users a ON a.id = h.reviewed_by
        WHERE h.proof_id = ?
        ORDER BY h.created_at ASC
      `).all(id);

      return response.json(history);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error getting proof history:', error);
      throw new AppError('Error getting proof history');
    }
  }
}