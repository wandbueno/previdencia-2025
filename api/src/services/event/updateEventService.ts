import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { EventType } from '../../types/event';

interface UpdateEventParams {
  id: string;
  organizationId: string;
  type: EventType;
  title: string;
  description?: string;
  startDate: string; // Format: YYYY-MM-DDTHH:mm:ss-03:00
  endDate: string; // Format: YYYY-MM-DDTHH:mm:ss-03:00
  active?: boolean;
}

export class UpdateEventService {
  async execute(params: UpdateEventParams) {
    const mainDb = db.getMainDb();
    
    const organization = mainDb.prepare(`
      SELECT subdomain FROM organizations 
      WHERE id = ? AND active = 1
    `).get(params.organizationId) as { subdomain: string } | undefined;

    if (!organization) {
      throw new AppError('Organização não encontrada ou inativa');
    }

    // Validar formato das datas
    const startDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-03:00$/;
    const endDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-03:00$/;

    if (!startDateRegex.test(params.startDate)) {
      throw new AppError('Data de início inválida. Use o formato: YYYY-MM-DDTHH:mm:ss-03:00');
    }

    if (!endDateRegex.test(params.endDate)) {
      throw new AppError('Data de término inválida. Use o formato: YYYY-MM-DDTHH:mm:ss-03:00');
    }

    const organizationDb = await db.getOrganizationDb(organization.subdomain);

    // Verifica se o evento existe
    const event = organizationDb.prepare(`
      SELECT id FROM events WHERE id = ?
    `).get(params.id);

    if (!event) {
      throw new AppError('Evento não encontrado');
    }

    // Atualiza o evento
    const result = organizationDb.prepare(`
      UPDATE events 
      SET type = ?,
          title = ?,
          description = ?,
          start_date = ?,
          end_date = ?,
          active = ?,
          updated_at = DATETIME('now')
      WHERE id = ?
      RETURNING *
    `).get(
      params.type,
      params.title,
      params.description || null,
      params.startDate,
      params.endDate,
      params.active === undefined ? 1 : params.active ? 1 : 0,
      params.id
    );

    if (!result) {
      throw new AppError('Erro ao atualizar evento');
    }

    return result;
  }
}