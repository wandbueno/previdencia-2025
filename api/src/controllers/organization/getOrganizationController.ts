import { Request, Response } from 'express';
import { GetOrganizationService } from '../../services/organization/getOrganizationService';

export class GetOrganizationController {
  async handle(request: Request, response: Response) {
    try {
      const { subdomain } = request.params;

      const getOrganizationService = new GetOrganizationService();
      const organization = await getOrganizationService.execute(subdomain);

      return response.json(organization);
    } catch (error) {
      if (error instanceof Error) {
        return response.status(400).json({
          error: error.message
        });
      }
      return response.status(500).json({
        error: 'Internal server error'
      });
    }
  }
}