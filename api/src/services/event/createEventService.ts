import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { generateId, getCurrentTimestamp } from '../../utils/database';
import { CreateEventDTO, Event } from '../../types/event';

export class CreateEventService {
  async execute(data: CreateEventDTO & { organizationId: string }): Promise<Event> {
    try {
      const mainDb = db.getMainDb();

      // Get organization
      const organization = mainDb.prepare(`
        SELECT subdomain, services FROM organizations 
        WHERE id = ? AND active = 1
      `).get(data.organizationId) as { subdomain: string; services: string } | undefined;

      if (!organization) {
        throw new AppError('Organization not found or inactive');
      }

      // Check if service is enabled for organization
      const services = JSON.parse(organization.services);
      if (!services.includes(data.type)) {
        throw new AppError(`${data.type} service is not enabled for this organization`);
      }

      const organizationDb = await db.getOrganizationDb(organization.subdomain);

      // Check for overlapping active events of same type
      const overlappingEvent = organizationDb.prepare(`
        SELECT 1 FROM events
        WHERE type = ?
        AND active = 1
        AND (
          (start_date BETWEEN ? AND ?) OR
          (end_date BETWEEN ? AND ?) OR
          (start_date <= ? AND end_date >= ?)
        )
      `).get(
        data.type,
        data.startDate,
        data.endDate,
        data.startDate,
        data.endDate,
        data.startDate,
        data.endDate
      );

      if (overlappingEvent) {
        throw new AppError(`There is already an active ${data.type} event in this period`);
      }

      const id = generateId();
      const timestamp = getCurrentTimestamp();

      // Create event
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
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error creating event:', error);
      throw new AppError('Error creating event');
    }
  }
}