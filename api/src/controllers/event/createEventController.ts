import { Request, Response } from 'express';
import { z } from 'zod';
import { CreateEventService } from '../../services/event/createEventService';
import { AppError } from '../../errors/AppError';

export class CreateEventController {
  async handle(request: Request, response: Response) {
    try {
      const createEventSchema = z.object({
        type: z.enum(['PROOF_OF_LIFE', 'RECADASTRATION']),
        title: z.string().min(3, 'Title must have at least 3 characters'),
        description: z.string().optional(),
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
      });

      const data = createEventSchema.parse(request.body);
      const { organizationId } = request.user;

      if (!organizationId) {
        throw new AppError('Organization ID not found', 401);
      }

      const createEventService = new CreateEventService();
      const event = await createEventService.execute({
        ...data,
        organizationId
      });

      return response.status(201).json(event);
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