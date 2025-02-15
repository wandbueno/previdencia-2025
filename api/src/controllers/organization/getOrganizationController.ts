import { Request, Response } from 'express';
import { z } from 'zod';
import { GetOrganizationService } from '../../services/organization/getOrganizationService';
import { AppError } from '../../errors/AppError';

export class GetOrganizationController {
  async handle(request: Request, response: Response) {
    try {
      const { id } = request.params;

      const getOrganizationService = new GetOrganizationService();
      const organization = await getOrganizationService.execute(id);

      return response.json(organization);
    } catch (error) {
      console.error('Error in GetOrganizationController:', error);

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

  async handleBySubdomain(request: Request, response: Response) {
    try {
      const { subdomain } = request.params;

      const getOrganizationService = new GetOrganizationService();
      const organization = await getOrganizationService.executeBySubdomain(subdomain);

      return response.json(organization);
    } catch (error) {
      console.error('Error in GetOrganizationController:', error);

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