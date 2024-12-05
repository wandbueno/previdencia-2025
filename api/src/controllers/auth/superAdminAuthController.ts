import { Request, Response } from 'express';
import { SuperAdminAuthService } from '../../services/auth/superAdminAuthService';
import { z } from 'zod';

export class SuperAdminAuthController {
  async handle(request: Request, response: Response) {
    const loginSchema = z.object({
      email: z.string().email('Email inválido'),
      password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
    });

    const { email, password } = loginSchema.parse(request.body);

    const superAdminAuthService = new SuperAdminAuthService();

    const result = await superAdminAuthService.execute({
      email,
      password
    });

    return response.json(result);
  }
}