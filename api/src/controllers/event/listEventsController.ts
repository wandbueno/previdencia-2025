import { Request, Response } from 'express';
import { ListEventsService } from '../../services/event/listEventsService';
import { z } from 'zod';
import { EventType } from '../../types/event';
import { AppError } from '../../errors/AppError';

export class ListEventsController {
  async handle(request: Request, response: Response) {
    try {
      const querySchema = z.object({
        type: z.enum(['PROOF_OF_LIFE', 'RECADASTRATION']).optional(),
        active: z.string().optional().transform(val => val === 'true')
      });

      const { type, active } = querySchema.parse(request.query);
      const { organizationId } = request.user;

      if (!organizationId) {
        throw new AppError('Organization ID not found', 401);
      }

      const listEventsService = new ListEventsService();
      const events = await listEventsService.execute({
        organizationId,
        type: type as EventType,
        active
      });

      return response.json(events);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return response.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
      }

      return response.status(error.statusCode || 500).json({
        error: error.message || 'Internal server error'
      });
    }
  }
}