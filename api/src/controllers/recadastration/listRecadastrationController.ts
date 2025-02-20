import { Request, Response } from 'express';
import { ListRecadastrationService } from '../../services/recadastration/listRecadastrationService';
import { z } from 'zod';

const RECADASTRATION_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
} as const;

type RecadastrationStatus = keyof typeof RECADASTRATION_STATUS;

export class ListRecadastrationController {
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

    const listRecadastrationService = new ListRecadastrationService();
    const recadastrations = await listRecadastrationService.execute({
      organizationId,
      status: status as RecadastrationStatus | undefined,
      // Only filter by userId if it's a regular user
      userId: role === 'USER' ? userId : undefined
    });

    return response.json(recadastrations);
  }
}