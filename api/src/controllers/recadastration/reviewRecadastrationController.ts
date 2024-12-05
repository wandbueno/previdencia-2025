import { Request, Response } from 'express';
import { ReviewRecadastrationService } from '../../services/recadastration/reviewRecadastrationService';
import { z } from 'zod';

const RECADASTRATION_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
} as const;

type RecadastrationStatus = keyof typeof RECADASTRATION_STATUS;

export class ReviewRecadastrationController {
  async handle(request: Request, response: Response) {
    const { organizationId, id: reviewerId } = request.user;
    const { id } = request.params;

    if (!organizationId || !reviewerId) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    const reviewSchema = z.object({
      status: z.enum(['APPROVED', 'REJECTED']),
      comments: z.string().optional()
    });

    const data = reviewSchema.parse(request.body);

    const reviewRecadastrationService = new ReviewRecadastrationService();
    const recadastration = await reviewRecadastrationService.execute({
      id,
      organizationId,
      reviewerId,
      ...data
    });

    return response.json(recadastration);
  }
}