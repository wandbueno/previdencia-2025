import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { Event, EventType } from '../../types/event';

interface ListEventsRequest {
  organizationId: string;
  type?: EventType;
  active?: boolean;
  userId?: string;
}

export class ListEventsService {
  async execute({ organizationId, type, active, userId }: ListEventsRequest): Promise<Event[]> {
    try {
      const mainDb = db.getMainDb();

      // Get organization subdomain
      const organization = mainDb.prepare(`
        SELECT subdomain FROM organizations 
        WHERE id = ? AND active = 1
      `).get(organizationId) as { subdomain: string } | undefined;

      if (!organization) {
        throw new AppError('Organization not found or inactive');
      }

      const organizationDb = await db.getOrganizationDb(organization.subdomain);

      let query = `
        SELECT 
          id, type, title, description,
          start_date as startDate,
          end_date as endDate,
          active,
          created_at as createdAt,
          updated_at as updatedAt
        FROM events
        WHERE 1=1
      `;

      const params: any[] = [];

      if (type) {
        query += ' AND type = ?';
        params.push(type);
      }

      if (typeof active === 'boolean') {
        query += ' AND active = ?';
        params.push(active ? 1 : 0);
      }

      // If userId is provided, check for pending submissions
      if (userId) {
        query += `
          AND NOT EXISTS (
            SELECT 1 FROM proof_of_life
            WHERE event_id = events.id AND user_id = ?
            UNION
            SELECT 1 FROM recadastration
            WHERE event_id = events.id AND user_id = ?
          )
        `;
        params.push(userId, userId);
      }

      query += ' ORDER BY start_date DESC';

      const events = organizationDb.prepare(query).all(...params) as Omit<Event, 'organizationId'>[];

      return events.map(event => ({
        ...event,
        organizationId,
        active: Boolean(event.active)
      }));
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error listing events:', error);
      throw new AppError('Error listing events');
    }
  }
}