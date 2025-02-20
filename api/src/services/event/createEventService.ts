import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { generateId, getCurrentTimestamp } from '../../utils/database';
import { CreateEventDTO, Event } from '../../types/event';

interface CreateEventServiceParams {
  type: 'PROOF_OF_LIFE' | 'RECADASTRATION';
  title: string;
  description?: string;
  startDate: string; // Format: YYYY-MM-DDTHH:mm:ss-03:00
  endDate: string; // Format: YYYY-MM-DDTHH:mm:ss-03:00
  organizationId: string;
}

export class CreateEventService {
  async execute(data: CreateEventServiceParams): Promise<Event> {
    try {
      const mainDb = db.getMainDb();

      // Verificar se a organização existe e tem o serviço habilitado
      const organization = mainDb.prepare(`
        SELECT subdomain, services FROM organizations 
        WHERE id = ? AND active = 1
      `).get(data.organizationId) as { subdomain: string; services: string } | undefined;

      if (!organization) {
        throw new AppError('Organização não encontrada ou inativa');
      }

      // Verificar se o serviço está habilitado para a organização
      const services = JSON.parse(organization.services);
      if (!services.includes(data.type)) {
        throw new AppError(`O serviço ${data.type === 'PROOF_OF_LIFE' ? 'Prova de Vida' : 'Recadastramento'} não está habilitado para esta organização`);
      }

      // Validar formato das datas
      const startDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-03:00$/;
      const endDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-03:00$/;

      if (!startDateRegex.test(data.startDate)) {
        throw new AppError('Data de início inválida. Use o formato: YYYY-MM-DDTHH:mm:ss-03:00');
      }

      if (!endDateRegex.test(data.endDate)) {
        throw new AppError('Data de término inválida. Use o formato: YYYY-MM-DDTHH:mm:ss-03:00');
      }

      const organizationDb = await db.getOrganizationDb(organization.subdomain);

      const id = generateId();
      const timestamp = getCurrentTimestamp();

      // Criar evento
      organizationDb.prepare(`
        INSERT INTO events (
          id, type, title, description,
          start_date, end_date, active,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
      `).run(
        id,
        data.type,
        data.title,
        data.description || null,
        data.startDate,
        data.endDate,
        timestamp,
        timestamp
      );

      return {
        id,
        organizationId: data.organizationId,
        type: data.type,
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        active: true,
        createdAt: timestamp,
        updatedAt: timestamp
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro ao criar evento:', error);
      throw new AppError('Erro ao criar evento');
    }
  }
}