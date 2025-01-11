import { Request, Response } from 'express';
import { ListProofOfLifeService } from '../../services/proofOfLife/listProofOfLifeService';

export class ListProofOfLifeController {
  // Rota para usuários do app (histórico)
  async handleHistory(request: Request, response: Response) {
    try {
      const { organizationId, id: userId } = request.user;
      const { status } = request.query;

      if (!organizationId || !userId) {
        return response.status(401).json({ error: 'Unauthorized' });
      }

      // Valida status se fornecido
      if (status && !['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED'].includes(status as string)) {
        return response.status(400).json({ error: 'Invalid status' });
      }

      const listProofOfLifeService = new ListProofOfLifeService();
      const proofs = await listProofOfLifeService.execute({
        organizationId,
        userId,
        status: status as 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | undefined,
        history: true // Indica que é listagem de histórico
      });

      return response.json(proofs);
    } catch (error) {
      console.error('Error listing proof history:', error);
      return response.status(500).json({ error: 'Internal server error' });
    }
  }

  // Rota para admin (todas as provas)
  async handleAdmin(request: Request, response: Response) {
    try {
      const { organizationId } = request.user;
      const { status } = request.query;

      if (!organizationId) {
        return response.status(401).json({ error: 'Unauthorized' });
      }

      // Valida status se fornecido
      if (status && !['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED'].includes(status as string)) {
        return response.status(400).json({ error: 'Invalid status' });
      }

      const listProofOfLifeService = new ListProofOfLifeService();
      const proofs = await listProofOfLifeService.execute({
        organizationId,
        status: status as 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | undefined,
        history: false // Indica que é listagem administrativa
      });

      return response.json(proofs);
    } catch (error) {
      console.error('Error listing proofs:', error);
      return response.status(500).json({ error: 'Internal server error' });
    }
  }
}