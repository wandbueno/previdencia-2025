import { Request, Response } from 'express';
import { UserAuthService } from '../../services/auth/userAuthService';
import { z } from 'zod';

export class UserAuthController {
  async handle(request: Request, response: Response) {
    const loginSchema = z.object({
      cpf: z.string().regex(/^\d{11}$/, 'CPF inválido'),
      password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
      subdomain: z.string().min(3, 'Subdomínio inválido')
    });

    const { cpf, password, subdomain } = loginSchema.parse(request.body);

    const userAuthService = new UserAuthService();

    const result = await userAuthService.execute({
      cpf,
      password,
      subdomain
    });

    return response.json(result);
  }
}