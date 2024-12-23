import { Request, Response } from 'express';
import { CreateUserService } from '../../services/user/createUserService';
import { z } from 'zod';
import { UserTableType } from '../../types/user';

export class CreateUserController {
  async handleAdmin(request: Request, response: Response) {
    try {
      const createUserSchema = z.object({
        name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
        email: z.string().email('Email inválido'),
        cpf: z.string().regex(/^\d{11}$/, 'CPF inválido'),
        password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
        type: z.enum(['admin', 'app']),
        organizationId: z.string().uuid('ID da organização inválido'),
        canProofOfLife: z.boolean().optional(),
        canRecadastration: z.boolean().optional()
      });

      const data = createUserSchema.parse(request.body);
      const createUserService = new CreateUserService();
      const user = await createUserService.execute({
        ...data,
        tableType: data.type as UserTableType
      });

      return response.status(201).json(user);
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

  async handle(request: Request, response: Response) {
    try {
      const { subdomain } = request.params;

      const createUserSchema = z.object({
        name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
        email: z.string().email('Email inválido'),
        cpf: z.string().regex(/^\d{11}$/, 'CPF inválido'),
        password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
        type: z.enum(['admin', 'app']),
        organizationId: z.string().uuid('ID da organização inválido'),
        canProofOfLife: z.boolean().optional(),
        canRecadastration: z.boolean().optional()
      });

      const data = createUserSchema.parse(request.body);

      const createUserService = new CreateUserService();
      const user = await createUserService.execute({
        ...data,
        tableType: data.type as UserTableType,
        organizationId: request.organization?.id || ''
      });

      return response.status(201).json(user);
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