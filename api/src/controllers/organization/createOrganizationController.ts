import { Request, Response } from 'express';
import { z } from 'zod';
import { CreateOrganizationService } from '../../services/organization/createOrganizationService';

export class CreateOrganizationController {
  async handle(request: Request, response: Response) {
    const createOrganizationSchema = z.object({
      name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
      subdomain: z.string().min(3, 'Subdomínio deve ter no mínimo 3 caracteres')
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Subdomínio inválido'),
      state: z.string().length(2, 'Estado deve ter 2 caracteres'),
      city: z.string().min(3, 'Cidade deve ter no mínimo 3 caracteres'),
      services: z.array(z.string()).min(1, 'Selecione pelo menos um serviço')
    });

    const data = createOrganizationSchema.parse(request.body);

    const createOrganizationService = new CreateOrganizationService();
    const organization = await createOrganizationService.execute(data);

    return response.status(201).json(organization);
  }
}