import { Request, Response } from 'express';
import { z } from 'zod';
import { DeleteUserService } from '../../services/user/deleteUserService';

export class DeleteUserController {
  async handle(request: Request, response: Response) {
    try {
      const { subdomain, id } = request.params;

      const deleteUserService = new DeleteUserService();
      await deleteUserService.execute({
        id,
        subdomain,
        type: 'app'
      });

      return response.status(204).send();
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

  async handleAdmin(request: Request, response: Response) {
    try {
      const querySchema = z.object({
        type: z.enum(['admin', 'app']),
        organizationId: z.string().uuid()
      });

      const { id } = request.params;
      const { type, organizationId } = querySchema.parse(request.query);

      const deleteUserService = new DeleteUserService();
      await deleteUserService.execute({
        id,
        type,
        organizationId
      });

      return response.status(204).send();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return response.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
      }

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