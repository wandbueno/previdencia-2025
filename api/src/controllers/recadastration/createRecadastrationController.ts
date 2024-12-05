import { Request, Response } from 'express';
import { CreateRecadastrationService } from '../../services/recadastration/createRecadastrationService';
import { z } from 'zod';

export class CreateRecadastrationController {
  async handle(request: Request, response: Response) {
    const { id: userId, organizationId } = request.user;

    if (!userId || !organizationId) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    const createRecadastrationSchema = z.object({
      data: z.object({
        address: z.object({
          street: z.string().min(1, 'Rua é obrigatória'),
          number: z.string().min(1, 'Número é obrigatório'),
          complement: z.string().optional(),
          neighborhood: z.string().min(1, 'Bairro é obrigatório'),
          city: z.string().min(1, 'Cidade é obrigatória'),
          state: z.string().length(2, 'Estado deve ter 2 caracteres'),
          zipCode: z.string().regex(/^\d{8}$/, 'CEP inválido')
        }),
        phone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido'),
        maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']),
        dependents: z.array(z.object({
          name: z.string().min(1, 'Nome é obrigatório'),
          birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
          relationship: z.string().min(1, 'Parentesco é obrigatório')
        })).optional()
      }),
      documentsUrls: z.object({
        addressProof: z.string().min(1, 'Comprovante de residência é obrigatório'),
        identityDocument: z.string().min(1, 'Documento de identidade é obrigatório'),
        marriageCertificate: z.string().optional()
      })
    });

    const data = createRecadastrationSchema.parse(request.body);

    const createRecadastrationService = new CreateRecadastrationService();
    const recadastration = await createRecadastrationService.execute({
      userId,
      organizationId,
      ...data
    });

    return response.status(201).json(recadastration);
  }
}