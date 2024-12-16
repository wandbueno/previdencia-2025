import { Request, Response } from 'express';
import { DashboardService } from '../../services/dashboard/dashboardService';

export class DashboardController {
  async getStats(request: Request, response: Response) {
    try {
      const { organizationId } = request.user;

      if (!organizationId) {
        return response.status(401).json({ error: 'Organization ID not found' });
      }

      const dashboardService = new DashboardService();
      const stats = await dashboardService.getStats(organizationId);

      return response.json(stats);
    } catch (error: any) {
      return response.status(error.statusCode || 500).json({
        error: error.message || 'Internal server error'
      });
    }
  }
}