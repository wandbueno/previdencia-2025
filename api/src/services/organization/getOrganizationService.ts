import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { parseJSON } from '../../utils/database';

interface Organization {
  id: string;
  name: string;
  subdomain: string;
  state: string;
  city: string;
  services: string;
  active: number;
  created_at: string;
  updated_at: string;
}

interface OrganizationResponse {
  id: string;
  name: string;
  subdomain: string;
  state: string;
  city: string;
  services: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string; 
}

export class GetOrganizationService {
  async execute(subdomain: string): Promise<OrganizationResponse> {
    try {
      const mainDb = db.getMainDb();

      const organization = mainDb.prepare(`
        SELECT * FROM organizations 
        WHERE subdomain = ? AND active = 1
      `).get(subdomain) as Organization | undefined;

      if (!organization) {
        throw new AppError('Organization not found');
      }

      return {
        id: organization.id,
        name: organization.name,
        subdomain: organization.subdomain,
        state: organization.state,
        city: organization.city,
        services: parseJSON<string[]>(organization.services),
        active: Boolean(organization.active),
        createdAt: organization.created_at,
        updatedAt: organization.updated_at
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error getting organization:', error);
      throw new AppError('Error getting organization');
    }
  }
}
