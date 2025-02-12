import { Request, Response } from 'express';
import { z } from 'zod';
import { UpdateUserService } from '../../services/user/updateUserService';
import { UserTableType } from '../../types/user';

export class UpdateUserController {
  async handle(request: Request, response: Response) {
    try {
      const { subdomain, id } = request.params;
      const { type } = request.body;

      const updateUserSchema = z.object({
        name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
        email: z.string().email('Email inválido'),
        active: z.boolean(),
        type: z.enum(['admin', 'app']),
        canProofOfLife: z.boolean().optional(),
        canRecadastration: z.boolean().optional(),
        rg: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        registrationNumber: z.string().optional(),
        processNumber: z.string().optional(),
        benefitEndDate: z.string().optional(),
        legalRepresentative: z.string().optional()
      });

      const data = updateUserSchema.parse(request.body);

      const updateUserService = new UpdateUserService();
      const user = await updateUserService.execute({
        id,
        ...data,
        subdomain,
        tableType: type as UserTableType
      });

      return response.json(user);
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

  async handleAdmin(request: Request, response: Response) {
    try {
      const { id } = request.params;
      const { type, organizationId } = request.body;

      const updateUserSchema = z.object({
        name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
        email: z.string().email('Email inválido'),
        active: z.boolean(),
        type: z.enum(['admin', 'app']),
        organizationId: z.string().uuid('ID da organização inválido'),
        canProofOfLife: z.boolean().optional(),
        canRecadastration: z.boolean().optional(),
        rg: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        registrationNumber: z.string().optional(),
        processNumber: z.string().optional(),
        benefitEndDate: z.string().optional(),
        legalRepresentative: z.string().optional()
      });

      const data = updateUserSchema.parse(request.body);

      const updateUserService = new UpdateUserService();
      const user = await updateUserService.execute({
        id,
        ...data,
        tableType: type as UserTableType,
        organizationId
      });

      return response.json(user);
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