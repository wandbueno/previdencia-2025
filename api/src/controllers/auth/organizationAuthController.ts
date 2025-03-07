import { Request, Response } from 'express';
import { OrganizationAuthService } from '../../services/auth/organizationAuthService';
import { z } from 'zod';

export class OrganizationAuthController {
  async handle(request: Request, response: Response) {
    try {
      const loginSchema = z.object({
        email: z.string().email('Email inválido'),
        password: z.string().min(5, 'Senha deve ter no mínimo 5 caracteres'),
        subdomain: z.string().min(3, 'Subdomínio inválido')
      });

      const data = loginSchema.parse(request.body);

      const organizationAuthService = new OrganizationAuthService();
      const result = await organizationAuthService.execute(data);

      return response.json(result);
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