import { Request, Response } from 'express';
import { z } from 'zod';
import { UpdateOrganizationService } from '../../services/organization/updateOrganizationService';
import { AppError } from '../../errors/AppError';

const updateOrganizationSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').optional(),
  cnpj: z.string().regex(/^\d{14}$/, 'CNPJ deve conter 14 dígitos').optional(),
  state: z.string().length(2, 'Estado deve ter 2 caracteres').optional(),
  city: z.string().min(2, 'Cidade deve ter no mínimo 2 caracteres').optional(),
  address: z.string().min(5, 'Endereço deve ter no mínimo 5 caracteres').optional(),
  cep: z.string().regex(/^\d{8}$/, 'CEP deve conter 8 dígitos').optional(),
  phone: z.string().regex(/^\d{10,11}$/, 'Telefone deve conter 10 ou 11 dígitos').optional(),
  email: z.string().email('Email inválido').optional(),
  logo_url: z.string().optional(),
  services: z.array(z.string()).min(1, 'Pelo menos um serviço deve ser selecionado').optional(),
  active: z.boolean().optional()
});

export class UpdateOrganizationController {
  async handle(request: Request, response: Response) {
    try {
      const { id } = request.params;
      const data = updateOrganizationSchema.parse(request.body);

      const updateOrganizationService = new UpdateOrganizationService();
      const organization = await updateOrganizationService.execute(id, data);

      return response.json(organization);
    } catch (error) {
      console.error('Error in UpdateOrganizationController:', error);

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