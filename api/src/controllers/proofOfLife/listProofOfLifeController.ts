import { Request, Response } from 'express';
import { ListProofOfLifeService } from '../../services/proofOfLife/listProofOfLifeService';
import { z } from 'zod';

const PROOF_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
} as const;

type ProofStatus = keyof typeof PROOF_STATUS;

export class ListProofOfLifeController {
  async handle(request: Request, response: Response) {
    const { organizationId, id: userId, role } = request.user;
    const { status } = request.query;

    if (!organizationId) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    // Validate status if provided
    if (status) {
      const statusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED']);
      try {
        statusSchema.parse(status);
      } catch {
        return response.status(400).json({ error: 'Invalid status' });
      }
    }

    const listProofOfLifeService = new ListProofOfLifeService();
    const proofs = await listProofOfLifeService.execute({
      organizationId,
      status: status as ProofStatus | undefined,
      // Only filter by userId if it's a regular user
      userId: role === 'USER' ? userId : undefined
    });

    return response.json(proofs);
  }
}