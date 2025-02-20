import { Request, Response } from 'express';
import { DeleteOrganizationService } from '../../services/organization/deleteOrganizationService';
import { AppError } from '../../errors/AppError';

export class DeleteOrganizationController {
  async handle(request: Request, response: Response) {
    try {
      const { id } = request.params;

      const deleteOrganizationService = new DeleteOrganizationService();
      await deleteOrganizationService.execute(id);

      return response.status(204).send();
    } catch (error) {
      console.error('Error in DeleteOrganizationController:', error);

      if (error instanceof AppError) {
        return response.status(error.statusCode).json({
          error: error.message
        });
      }

      return response.status(500).json({
        error: 'Internal server error'
      });
    }
  }
}