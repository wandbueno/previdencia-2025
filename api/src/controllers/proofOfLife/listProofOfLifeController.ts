import { Request, Response } from 'express';
import { ListProofOfLifeService } from '../../services/proofOfLife/listProofOfLifeService';
import { z } from 'zod';

export class ListProofOfLifeController {
  async handle(request: Request, response: Response) {
    try {
      const { organizationId, id: userId, role } = request.user;

      if (!organizationId) {
        return response.status(401).json({ error: 'Unauthorized' });
      }

      // Get status from query params if provided
      const { status } = request.query;

      // Validate status if provided
      if (status && !['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED'].includes(status as string)) {
        return response.status(400).json({ error: 'Invalid status' });
      }

      const listProofOfLifeService = new ListProofOfLifeService();
      const proofs = await listProofOfLifeService.execute({
        organizationId,
        status: status as 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | undefined,
        // Only filter by userId if it's a regular user
        userId: role === 'USER' ? userId : undefined
      });

      return response.json(proofs);
    } catch (error) {
      console.error('Error listing proofs:', error);
      return response.status(500).json({ error: 'Internal server error' });
    }
  }
}