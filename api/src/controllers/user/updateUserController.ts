import { Request, Response } from 'express';
import { z } from 'zod';
import { UpdateUserService } from '../../services/user/updateUserService';

export class UpdateUserController {
  async handle(request: Request, response: Response) {
    try {
      const { subdomain, id } = request.params;

      const updateUserSchema = z.object({
        name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
        email: z.string().email('Email inválido'),
        active: z.boolean()
      });

      const data = updateUserSchema.parse(request.body);

      const updateUserService = new UpdateUserService();
      const user = await updateUserService.execute({
        id,
        ...data,
        subdomain,
        type: 'app'
      });

      return response.json(user);
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
      const updateUserSchema = z.object({
        name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
        email: z.string().email('Email inválido'),
        active: z.boolean(),
        type: z.enum(['admin', 'app']),
        organizationId: z.string().uuid('ID da organização inválido')
      });

      const { id } = request.params;
      const data = updateUserSchema.parse(request.body);

      const updateUserService = new UpdateUserService();
      const user = await updateUserService.execute({
        id,
        ...data
      });

      return response.json(user);
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