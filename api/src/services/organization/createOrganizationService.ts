import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { generateId, getCurrentTimestamp, stringifyJSON } from '../../utils/database';

interface CreateOrganizationRequest {
  name: string;
  subdomain: string;
  state: string;
  city: string;
  services: string[];
}

export class CreateOrganizationService {
  async execute({ name, subdomain, state, city, services }: CreateOrganizationRequest) {
    try {
      const mainDb = db.getMainDb();

      // Check if subdomain is already in use
      const organizationExists = mainDb.prepare(
        'SELECT 1 FROM organizations WHERE subdomain = ?'
      ).get(subdomain);

      if (organizationExists) {
        throw new AppError('Subdomain already in use');
      }

      const id = generateId();
      const timestamp = getCurrentTimestamp();
      const servicesJson = stringifyJSON(services);

      // Create organization in main database
      mainDb.prepare(`
        INSERT INTO organizations (id, name, subdomain, state, city, services, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, name, subdomain, state, city, servicesJson, timestamp, timestamp);

      // Create organization database
      const organizationDb = db.createOrganizationDb(subdomain);

      return {
        id,
        name,
        subdomain,
        state,
        city,
        services,
        active: true,
        createdAt: timestamp,
        updatedAt: timestamp
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error creating organization:', error);
      throw new AppError('Error creating organization');
    }
  }
}