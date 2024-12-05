import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { getCurrentTimestamp, stringifyJSON } from '../../utils/database';

interface UpdateOrganizationRequest {
  id: string;
  name: string;
  state: string;
  city: string;
  active: boolean;
  services: string[];
}

export class UpdateOrganizationService {
  async execute({ id, name, state, city, active, services }: UpdateOrganizationRequest) {
    try {
      const mainDb = db.getMainDb();

      const organization = mainDb.prepare(
        'SELECT * FROM organizations WHERE id = ?'
      ).get(id);

      if (!organization) {
        throw new AppError('Organization not found');
      }

      const timestamp = getCurrentTimestamp();
      const servicesJson = stringifyJSON(services);

      mainDb.prepare(`
        UPDATE organizations
        SET name = ?, state = ?, city = ?, active = ?, services = ?, updated_at = ?
        WHERE id = ?
      `).run(name, state, city, active ? 1 : 0, servicesJson, timestamp, id);

      return {
        id,
        name,
        state,
        city,
        active,
        services,
        updatedAt: timestamp
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error updating organization:', error);
      throw new AppError('Error updating organization');
    }
  }
}