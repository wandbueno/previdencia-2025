import { Request, Response } from 'express';
import { ReviewProofOfLifeService } from '../../services/proofOfLife/reviewProofOfLifeService';
import { z } from 'zod';

const PROOF_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
} as const;

type ProofStatus = keyof typeof PROOF_STATUS;

export class ReviewProofOfLifeController {
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

    const reviewProofOfLifeService = new ReviewProofOfLifeService();
    const proof = await reviewProofOfLifeService.execute({
      id,
      organizationId,
      reviewerId,
      ...data
    });

    return response.json(proof);
  }
}