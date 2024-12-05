import { Request, Response } from 'express';
import { UpdateOrganizationService } from '../../services/organization/updateOrganizationService';
import { z } from 'zod';

export class UpdateOrganizationController {
  async handle(request: Request, response: Response) {
    const { id } = request.params;

    const updateOrganizationSchema = z.object({
      name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
      state: z.string().length(2, 'Estado deve ter 2 caracteres'),
      city: z.string().min(3, 'Cidade deve ter no mínimo 3 caracteres'),
      active: z.boolean(),
      services: z.array(z.string()).min(1, 'Selecione pelo menos um serviço')
    });

    const data = updateOrganizationSchema.parse(request.body);

    const updateOrganizationService = new UpdateOrganizationService();
    const organization = await updateOrganizationService.execute({
      id,
      ...data
    });

    return response.json(organization);
  }
}