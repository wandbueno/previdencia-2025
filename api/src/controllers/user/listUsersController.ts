import { Request, Response } from 'express';
import { z } from 'zod';
import { ListUsersService } from '../../services/user/listUsersService';

export class ListUsersController {
  async handle(request: Request, response: Response) {
    try {
      const { subdomain } = request.params;
      const { type } = request.query;

      const querySchema = z.object({
        type: z.enum(['admin', 'app']).optional()
      });

      const validatedQuery = querySchema.parse({ type });

      const listUsersService = new ListUsersService();
      const users = await listUsersService.execute({ 
        subdomain,
        type: validatedQuery.type
      });

      return response.json(users);
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

  async handleAdmin(request: Request, response: Response) {
    try {
      const querySchema = z.object({
        type: z.enum(['admin', 'app']),
        organizationId: z.string().uuid()
      });

      const { type, organizationId } = querySchema.parse(request.query);

      const listUsersService = new ListUsersService();
      const users = await listUsersService.execute({ type, organizationId });

      return response.json(users);
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