import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { Organization, OrganizationRow } from '../../types/organization';

interface ListOrganizationsServiceParams {
  active?: boolean;
  state?: string;
  city?: string;
  search?: string;
}

export class ListOrganizationsService {
  async execute(params: ListOrganizationsServiceParams = {}): Promise<Organization[]> {
    try {
      const mainDb = db.getMainDb();

      const { active, state, city, search } = params;

      let query = `
        SELECT *
        FROM organizations
        WHERE 1 = 1
      `;

      const queryParams: any[] = [];

      if (active !== undefined) {
        query += ` AND active = ?`;
        queryParams.push(active ? 1 : 0);
      }

      if (state) {
        query += ` AND state = ?`;
        queryParams.push(state);
      }

      if (city) {
        query += ` AND city LIKE ?`;
        queryParams.push(`%${city}%`);
      }

      if (search) {
        query += ` AND (name LIKE ? OR subdomain LIKE ?)`;
        queryParams.push(`%${search}%`, `%${search}%`);
      }

      query += ` ORDER BY name ASC`;

      console.log('Executing query:', query);
      console.log('Query params:', queryParams);

      const organizations = mainDb.prepare(query).all(...queryParams) as OrganizationRow[];

      console.log('Found organizations:', organizations.length);
      if (organizations.length > 0) {
        console.log('First organization:', organizations[0]);
      }

      return organizations.map(org => ({
        ...org,
        active: Boolean(org.active),
        services: org.services ? JSON.parse(org.services) : []
      }));
    } catch (error) {
      console.error('Error in ListOrganizationsService:', error);
      throw new AppError('Error listing organizations', 400);
    }
  }
}