// api/src/controllers/auth/appAuthController.ts
import { Request, Response } from 'express';
import { z } from 'zod';
import { AppAuthService } from '../../services/auth/appAuthService';

export class AppAuthController {
  async handle(request: Request, response: Response) {
    try {
      const loginSchema = z.object({
        cpf: z.string().regex(/^\d{11}$/, 'CPF inválido'),
        password: z.string().min(5, 'Senha deve ter no mínimo 5 caracteres'),
        subdomain: z.string().min(3, 'Subdomínio inválido')
      });

      const data = loginSchema.parse(request.body);
      const appAuthService = new AppAuthService();
      const result = await appAuthService.execute(data);

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
