import { Request, Response } from 'express';
import { ListOrganizationsService } from '../../services/organization/listOrganizationsService';

export class ListOrganizationsController {
  async handle(request: Request, response: Response) {
    try {
      const listOrganizationsService = new ListOrganizationsService();
      const organizations = await listOrganizationsService.execute();
      return response.json(organizations);
    } catch (error) {
      console.error('Error listing organizations:', error);
      return response.status(500).json({ error: 'Internal server error' });
    }
  }

  async handlePublic(request: Request, response: Response) {
    try {
      const listOrganizationsService = new ListOrganizationsService();
      const organizations = await listOrganizationsService.executePublic();
      return response.json(organizations);
    } catch (error) {
      console.error('Error listing public organizations:', error);
      return response.status(500).json({ error: 'Internal server error' });
    }
  }
}