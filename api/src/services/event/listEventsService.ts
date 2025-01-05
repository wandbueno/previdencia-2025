import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { Event, EventType, EventResponse, EventStatus } from '../../types/event';

interface ListEventsServiceParams {
  organizationId?: string;
  userId?: string;
}

type Organization = { id: string; subdomain: string; name: string };

export class ListEventsService {
  async execute({ organizationId, userId }: ListEventsServiceParams): Promise<EventResponse[]> {
    const mainDb = db.getMainDb();
    
    let organizations: Organization[];

    if (organizationId) {
      const organization = mainDb.prepare(`
        SELECT id, subdomain, name FROM organizations 
        WHERE id = ? AND active = 1
      `).get(organizationId) as Organization;

      if (!organization) {
        throw new AppError('Organization not found or inactive');
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

      // For each event, get the proof of life status if user is provided
      for (const event of orgEvents) {
        let status: EventStatus | undefined;

        if (userId && event.type === 'PROOF_OF_LIFE') {
          const proof = organizationDb.prepare(`
            SELECT status FROM proof_of_life 
            WHERE user_id = ? AND event_id = ?
            ORDER BY created_at DESC
            LIMIT 1
          `).get(userId, event.id) as { status: EventStatus } | undefined;

          if (proof) {
            status = proof.status;
          }
        }

        events.push({
          id: event.id,
          type: event.type,
          title: event.title,
          description: event.description,
          start_date: event.start_date,
          end_date: event.end_date,
          active: event.active,
          status,
          organizationId: org.id,
          organizationName: org.name,
          created_at: event.created_at,
          updated_at: event.updated_at
        });
      }
    }

    return events;
  }
}