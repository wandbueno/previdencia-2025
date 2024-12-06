import { Request, Response } from 'express';
import { z } from 'zod';
import { DeleteUserService } from '../../services/user/deleteUserService';
import { UserTableType } from '../../types/user';

export class DeleteUserController {
  async handle(request: Request, response: Response) {
    try {
      const { id } = request.params;
      const { type, organizationId } = request.query;

      const querySchema = z.object({
        type: z.enum(['admin', 'app']),
        organizationId: z.string().uuid()
      });

      const validatedQuery = querySchema.parse({ type, organizationId });

      const deleteUserService = new DeleteUserService();
      await deleteUserService.execute({
        id,
        tableType: validatedQuery.type as UserTableType,
        organizationId: validatedQuery.organizationId
      });

      return response.status(204).send();
    } catch (error: any) {
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