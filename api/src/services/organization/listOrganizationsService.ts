import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { ListOrganizationsFilters, Organization, OrganizationRow } from '../../types/organization';

export class ListOrganizationsService {
  async execute(filters: ListOrganizationsFilters = {}): Promise<Organization[]> {
    try {
      const mainDb = db.getMainDb();

      // Query simples para testar
      const query = 'SELECT * FROM organizations ORDER BY name ASC';
      console.log('Executing query:', query);

      const organizations = mainDb.prepare(query).all() as OrganizationRow[];
      console.log('Found organizations:', organizations.length);
      console.log('First organization:', organizations[0]);

      return organizations.map((org: OrganizationRow): Organization => {
        console.log('Mapping organization:', org.id);
        return {
          id: org.id,
          name: org.name,
          subdomain: org.subdomain,
          cnpj: org.cnpj,
          state: org.state,
          city: org.city,
          address: org.address,
          cep: org.cep,
          phone: org.phone,
          email: org.email,
          logo_url: org.logo_url,
          active: Boolean(org.active),
          services: org.services ? JSON.parse(org.services) : [],
          created_at: org.created_at,
          updated_at: org.updated_at
        };
      });
    } catch (error) {
      console.error('Error in ListOrganizationsService:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Error listing organizations');
    }
  }
}