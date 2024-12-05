import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { parseJSON } from '../../utils/database';

interface Organization {
  id: string;
  name: string;
  subdomain: string;
  state: string;
  city: string;
  active: number;
  services: string;
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

export class ListOrganizationsService {
  async execute(): Promise<OrganizationResponse[]> {
    try {
      const mainDb = db.getMainDb();

      const organizations = mainDb.prepare(`
        SELECT * FROM organizations 
        WHERE active = 1
        ORDER BY name ASC
      `).all() as Organization[];

      return organizations.map((org: Organization) => ({
        id: org.id,
        name: org.name,
        subdomain: org.subdomain,
        state: org.state,
        city: org.city,
        services: parseJSON<string[]>(org.services),
        active: Boolean(org.active),
        createdAt: org.created_at,
        updatedAt: org.updated_at
      }));
    } catch (error) {
      console.error('Error listing organizations:', error);
      throw new AppError('Error listing organizations');
    }
  }

  async executePublic(): Promise<OrganizationResponse[]> {
    try {
      const mainDb = db.getMainDb();

      const organizations = mainDb.prepare(`
        SELECT * FROM organizations 
        WHERE active = 1
        ORDER BY name ASC
      `).all() as Organization[];

      return organizations.map((org: Organization) => ({
        id: org.id,
        name: org.name,
        subdomain: org.subdomain,
        state: org.state,
        city: org.city,
        services: parseJSON<string[]>(org.services),
        active: Boolean(org.active),
        createdAt: org.created_at,
        updatedAt: org.updated_at
      }));
    } catch (error) {
      console.error('Error listing public organizations:', error);
      throw new AppError('Error listing organizations');
    }
  }
}