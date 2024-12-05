import { Request, Response } from 'express';
import { CreateProofOfLifeService } from '../../services/proofOfLife/createProofOfLifeService';
import { z } from 'zod';

export class CreateProofOfLifeController {
  async handle(request: Request, response: Response) {
    const { id: userId, organizationId } = request.user;

    const createProofSchema = z.object({
      selfieUrl: z.string().min(1, 'Selfie é obrigatória'),
      documentUrl: z.string().min(1, 'Documento é obrigatório')
    });

    const data = createProofSchema.parse(request.body);

    const createProofOfLifeService = new CreateProofOfLifeService();
    const proof = await createProofOfLifeService.execute({
      userId: userId as string,
      organizationId: organizationId as string,
      ...data
    });

    return response.status(201).json(proof);
  }
}