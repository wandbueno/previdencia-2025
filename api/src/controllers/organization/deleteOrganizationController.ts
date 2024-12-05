import { Request, Response } from 'express';
import { DeleteOrganizationService } from '../../services/organization/deleteOrganizationService';

export class DeleteOrganizationController {
  async handle(request: Request, response: Response) {
    const { id } = request.params;

    const deleteOrganizationService = new DeleteOrganizationService();
    await deleteOrganizationService.execute(id);

    return response.status(204).send();
  }
}