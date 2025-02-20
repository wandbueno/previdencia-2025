import { Request, Response } from 'express';
import { z } from 'zod';
import { AppError } from '../../errors/AppError';
import { UpdateEventService } from '../../services/event/updateEventService';

export class UpdateEventController {
  async handle(request: Request, response: Response) {
    try {
      const { id } = request.params;
      const { organizationId, isSuperAdmin } = request.user!;
      const { organizationId: eventOrgId, ...data } = request.body;

      console.log('Update Request:', {
        params: request.params,
        body: request.body,
        user: request.user,
        eventOrgId,
        data
      });

      if (!isSuperAdmin && !organizationId) {
        throw new AppError('Organization ID not found', 401);
      }

      const updateEventSchema = z.object({
        type: z.enum(['PROOF_OF_LIFE', 'RECADASTRATION']),
        title: z.string().min(3),
        description: z.string().optional(),
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-03:00$/),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-03:00$/),
        active: z.boolean().optional()
      });

      try {
        const validatedData = updateEventSchema.parse(data);
        console.log('Validated Data:', validatedData);

        const updateEventService = new UpdateEventService();
        const updatedEvent = await updateEventService.execute({
          id,
          organizationId: eventOrgId || organizationId,
          ...validatedData
        });

        return response.status(200).json({ 
          message: 'Evento atualizado com sucesso',
          event: updatedEvent
        });
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          return response.status(400).json({
            message: 'Data e hora em formato inválido. Use o formato: YYYY-MM-DDTHH:mm:ss-03:00',
            details: validationError.errors
          });
        }
        console.error('Validation Error:', validationError);
        throw validationError;
      }
    } catch (error) {
      if (error instanceof AppError) {
        return response.status(error.statusCode).json({ message: error.message });
      }
      console.error('Update Error:', error);
      return response.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}