import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { Event, EventType, EventResponse } from '../../types/event';

interface ListEventsServiceParams {
  organizationId?: string;
}

type Organization = { id: string; subdomain: string; name: string };

export class ListEventsService {
  async execute({ organizationId }: ListEventsServiceParams) {
    const mainDb = db.getMainDb();
    
    let organizations: Organization[];

    if (organizationId) {
      const organization = mainDb.prepare(`
        SELECT id, subdomain, name FROM organizations 
        WHERE id = ? AND active = 1
      `).get(organizationId) as Organization;

      if (!organization) {
        throw new AppError('Organização não encontrada ou inativa');
      }

      organizations = [organization];
    } else {
      organizations = mainDb.prepare(`
        SELECT id, subdomain, name FROM organizations 
        WHERE active = 1
      `).all() as Organization[];
    }

    const events: EventResponse[] = [];

    for (const org of organizations) {
      const organizationDb = await db.getOrganizationDb(org.subdomain);
      
      const orgEvents = organizationDb.prepare(`
        SELECT * FROM events
        ORDER BY created_at DESC
      `).all() as Array<{
        id: string;
        type: EventType;
        title: string;
        description: string | null;
        start_date: string;
        end_date: string;
        active: boolean;
        created_at: string;
        updated_at: string;
      }>;

      events.push(
        ...orgEvents.map(event => ({
          id: event.id,
          type: event.type,
          title: event.title,
          description: event.description || undefined,
          start_date: event.start_date,
          end_date: event.end_date,
          active: event.active,
          created_at: event.created_at,
          updated_at: event.updated_at,
          organizationId: org.id,
          organizationName: org.name
        }))
      );
    }

    return events;
  }
}