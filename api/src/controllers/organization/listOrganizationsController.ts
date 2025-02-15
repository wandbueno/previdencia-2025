import { Request, Response } from 'express';
import { z } from 'zod';
import { ListOrganizationsService } from '../../services/organization/listOrganizationsService';
import { AppError } from '../../errors/AppError';

const listOrganizationsSchema = z.object({
  active: z.string().optional().transform(val => val === 'true'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres').optional(),
  city: z.string().min(2, 'Cidade deve ter no mínimo 2 caracteres').optional(),
  search: z.string().min(3, 'Termo de busca deve ter no mínimo 3 caracteres').optional(),
});

export class ListOrganizationsController {
  async handle(request: Request, response: Response) {
    try {
      console.log('Listing organizations...');
      const listOrganizationsService = new ListOrganizationsService();
      const organizations = await listOrganizationsService.execute();
      console.log('Found organizations:', organizations.length);
      return response.json(organizations);
    } catch (error) {
      console.error('Error in ListOrganizationsController:', error);

      if (error instanceof z.ZodError) {
        return response.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
      }

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