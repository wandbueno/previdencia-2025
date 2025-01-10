import { Request, Response } from 'express';
import { ListProofOfLifeService } from '../../services/proofOfLife/listProofOfLifeService';

export class ListProofOfLifeController {
  async handle(request: Request, response: Response) {
    try {
      const { organizationId, id: userId } = request.user;

      if (!organizationId) {
        return response.status(401).json({ error: 'Unauthorized' });
      }

      const listProofOfLifeService = new ListProofOfLifeService();
      const proofs = await listProofOfLifeService.execute({
        organizationId,
        userId
      });

      return response.json(proofs);
    } catch (error: any) {
      console.error('Error listing proofs of life:', error);
      return response.status(error.statusCode || 500).json({
        error: error.message || 'Internal server error'
      });
    }
  }
}