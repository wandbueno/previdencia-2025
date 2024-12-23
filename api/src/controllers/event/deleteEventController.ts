import { Request, Response } from 'express';
import { AppError } from '../../errors/AppError';
import { DeleteEventService } from '../../services/event/deleteEventService';

export class DeleteEventController {
  async handle(request: Request, response: Response) {
    try {
      const { id } = request.params;
      const { organizationId, isSuperAdmin } = request.user!;
      const { organizationId: eventOrgId } = request.body;

      // Se for superadmin, usa o organizationId do evento
      // Se não, usa o organizationId do usuário
      const targetOrgId = isSuperAdmin ? eventOrgId : organizationId;

      if (!targetOrgId) {
        throw new AppError('Organization ID not found', 401);
      }

      const deleteEventService = new DeleteEventService();
      await deleteEventService.execute({ 
        id,
        organizationId: targetOrgId
      });

      return response.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        return response.status(error.statusCode).json({ message: error.message });
      }
      return response.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
} 