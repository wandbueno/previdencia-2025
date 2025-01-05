import { Request, Response } from 'express';
import { CreateProofOfLifeService } from '../../services/proofOfLife/createProofOfLifeService';
import { z } from 'zod';
import { AppError } from '../../errors/AppError';

export class CreateProofOfLifeController {
  async handle(request: Request, response: Response) {
    const { id: userId, organizationId } = request.user;

    if (!userId || !organizationId) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    const createProofSchema = z.object({
      selfieUrl: z.string().min(1, 'Selfie é obrigatória'),
      documentUrl: z.string().min(1, 'Documento é obrigatório'),
      eventId: z.string().uuid('ID do evento inválido')
    });

    try {
      const data = createProofSchema.parse(request.body);

      const createProofOfLifeService = new CreateProofOfLifeService();
      const proof = await createProofOfLifeService.execute({
        userId,
        organizationId,
        ...data
      });

      return response.status(201).json(proof);
    } catch (error) {
      console.error('Error creating proof of life:', error);
      
      if (error instanceof z.ZodError) {
        return response.status(400).json({ 
          error: 'Validation error',
          details: error.errors 
        });
      }

      if (error instanceof AppError) {
        return response.status(400).json({ error: error.message });
      }

      return response.status(500).json({ error: 'Internal server error' });
    }
  }
}