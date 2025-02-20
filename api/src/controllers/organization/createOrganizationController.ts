import { Request, Response } from 'express';
import { z } from 'zod';
import { CreateOrganizationService } from '../../services/organization/createOrganizationService';
import { AppError } from '../../errors/AppError';

const createOrganizationSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  subdomain: z.string().min(3, 'Subdomínio deve ter no mínimo 3 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Subdomínio deve conter apenas letras minúsculas, números e hífen'),
  cnpj: z.string().regex(/^\d{14}$/, 'CNPJ deve conter 14 dígitos'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres'),
  city: z.string().min(2, 'Cidade deve ter no mínimo 2 caracteres'),
  address: z.string().min(5, 'Endereço deve ter no mínimo 5 caracteres'),
  cep: z.string().regex(/^\d{8}$/, 'CEP deve conter 8 dígitos'),
  phone: z.string().regex(/^\d{10,11}$/, 'Telefone deve conter 10 ou 11 dígitos'),
  email: z.string().email('Email inválido'),
  logo_url: z.string().nullable(),
  services: z.array(z.string()).min(1, 'Pelo menos um serviço deve ser selecionado'),
  active: z.boolean().default(true)
});

export class CreateOrganizationController {
  async handle(request: Request, response: Response) {
    try {
      console.log('Received organization data:', request.body);
      const data = createOrganizationSchema.parse(request.body);
      console.log('Parsed organization data:', data);

      const createOrganizationService = new CreateOrganizationService();
      const organization = await createOrganizationService.execute(data);
      console.log('Created organization:', organization);

      return response.status(201).json(organization);
    } catch (error) {
      console.error('Error in CreateOrganizationController:', error);

      if (error instanceof z.ZodError) {
        return response.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
      }

      if (error instanceof AppError) {
        return response.status(error.statusCode).json({
          error: error.message
        });
      }

      return response.status(500).json({
        error: 'Internal server error'
      });
    }
  }
}