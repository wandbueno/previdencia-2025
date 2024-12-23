import { Request, Response } from 'express';
import { ListEventsService } from '../../services/event/listEventsService';
import { z } from 'zod';
import { EventType } from '../../types/event';
import { AppError } from '../../errors/AppError';

interface ListEventsParams {
  organizationId: string | null;
  type?: EventType;
  active?: boolean;
}

export class ListEventsController {
  async handle(request: Request, response: Response) {
    try {
      const { organizationId } = request.query;

      const listEventsService = new ListEventsService();
      const events = await listEventsService.execute({ 
        organizationId: organizationId as string 
      });

      return response.json(events);
    } catch (error) {
      if (error instanceof AppError) {
        return response.status(error.statusCode).json({ message: error.message });
      }
      return response.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}