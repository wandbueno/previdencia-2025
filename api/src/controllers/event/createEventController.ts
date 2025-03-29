import { Request, Response } from 'express';
import { z } from 'zod';
import { CreateEventService } from '../../services/event/createEventService';
import { AppError } from '../../errors/AppError';

export class CreateEventController {
  async handle(request: Request, response: Response) {
    try {
      const createEventSchema = z.object({
        type: z.enum(['PROOF_OF_LIFE', 'RECADASTRATION']),
        title: z.string().min(3),
        description: z.string().optional(),
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        organizationId: z.string().uuid()
      });

      const data = createEventSchema.parse(request.body);
      const { isSuperAdmin } = request.user!;

      const organizationId = isSuperAdmin 
        ? data.organizationId 
        : request.user!.organizationId;

      if (!organizationId) {
        throw new AppError('Organization ID not found', 401);
      }

      const createEventService = new CreateEventService();
      const event = await createEventService.execute({
        ...data,
        organizationId
      });

      return response.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return response.status(400).json({
          message: 'Erro de validação',
          details: error.errors
        });
      }
      if (error instanceof AppError) {
        return response.status(error.statusCode).json({ message: error.message });
      }
      return response.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}