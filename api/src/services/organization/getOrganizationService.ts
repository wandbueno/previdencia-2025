import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { Organization, OrganizationRow } from '../../types/organization';

export class GetOrganizationService {
  async execute(id: string): Promise<Organization> {
    try {
      const mainDb = db.getMainDb();

      const organization = mainDb.prepare(`
        SELECT * FROM organizations WHERE id = ?
      `).get(id) as OrganizationRow | undefined;

      if (!organization) {
        throw new AppError('Organização não encontrada', 404);
      }

      return {
        id: organization.id,
        name: organization.name,
        subdomain: organization.subdomain,
        cnpj: organization.cnpj,
        state: organization.state,
        city: organization.city,
        address: organization.address,
        cep: organization.cep,
        phone: organization.phone,
        email: organization.email,
        logo_url: organization.logo_url === null ? null : organization.logo_url,
        active: Boolean(organization.active),
        services: JSON.parse(organization.services),
        created_at: organization.created_at,
        updated_at: organization.updated_at
      };
    } catch (error) {
      console.error('Error in GetOrganizationService:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Error getting organization');
    }
  }

  async executeBySubdomain(subdomain: string): Promise<Organization> {
    try {
      const mainDb = db.getMainDb();

      const organization = mainDb.prepare(`
        SELECT * FROM organizations WHERE subdomain = ?
      `).get(subdomain) as OrganizationRow | undefined;

      if (!organization) {
        throw new AppError('Organização não encontrada', 404);
      }

      return {
        id: organization.id,
        name: organization.name,
        subdomain: organization.subdomain,
        cnpj: organization.cnpj,
        state: organization.state,
        city: organization.city,
        address: organization.address,
        cep: organization.cep,
        phone: organization.phone,
        email: organization.email,
        logo_url: organization.logo_url === null ? null : organization.logo_url,
        active: Boolean(organization.active),
        services: JSON.parse(organization.services),
        created_at: organization.created_at,
        updated_at: organization.updated_at
      };
    } catch (error) {
      console.error('Error in GetOrganizationService:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Error getting organization');
    }
  }
}
