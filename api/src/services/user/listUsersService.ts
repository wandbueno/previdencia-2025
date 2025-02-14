import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { UserTableType, UserResponse } from '../../types/user';

interface ListUsersRequest {
  subdomain?: string;
  tableType?: UserTableType;
  organizationId?: string;
}

export class ListUsersService {
  async execute({ subdomain, tableType, organizationId }: ListUsersRequest): Promise<UserResponse[]> {
    try {
      const mainDb = db.getMainDb();
      const tableName = tableType === 'admin' ? 'admin_users' : 'app_users';

      // Query base para usuários do app
      const appUserFields = `
        id, name, email, cpf, role, active,
        can_proof_of_life as canProofOfLife,
        can_recadastration as canRecadastration,
        rg, birth_date as birthDate,
        address, phone,
        registration_number as registrationNumber,
        process_number as processNumber,
        benefit_start_date as benefitStartDate,
        benefit_end_date as benefitEndDate,
        benefit_type as benefitType,
        retirement_type as retirementType,
        insured_name as insuredName,
        legal_representative as legalRepresentative,
        created_at as createdAt,
        updated_at as updatedAt
      `;

      // Query base para usuários admin
      const adminUserFields = `
        id, name, email, cpf, role, active,
        created_at as createdAt,
        updated_at as updatedAt
      `;

      // Para admin do órgão listando seus próprios usuários
      if (subdomain) {
        const organization = mainDb.prepare(`
          SELECT id, name FROM organizations 
          WHERE subdomain = ? AND active = 1
        `).get(subdomain) as { id: string; name: string } | undefined;

        if (!organization) {
          throw new AppError('Organization not found or inactive');
        }

        const organizationDb = await db.getOrganizationDb(subdomain);
        
        const query = `
          SELECT ${tableName === 'app_users' ? appUserFields : adminUserFields}
          FROM ${tableName}
          ORDER BY name ASC
        `;

        const users = organizationDb.prepare(query).all() as UserResponse[];

        return users.map(user => ({
          ...user,
          active: Boolean(user.active),
          canProofOfLife: user.canProofOfLife ? Boolean(user.canProofOfLife) : undefined,
          canRecadastration: user.canRecadastration ? Boolean(user.canRecadastration) : undefined,
          organizationId: organization.id,
          organizationName: organization.name
        }));
      }

      // Para super admin listando usuários de uma organização específica
      if (organizationId) {
        const organization = mainDb.prepare(`
          SELECT subdomain, name FROM organizations 
          WHERE id = ? AND active = 1
        `).get(organizationId) as { subdomain: string; name: string } | undefined;

        if (!organization) {
          throw new AppError('Organization not found or inactive');
        }

        const organizationDb = await db.getOrganizationDb(organization.subdomain);
        
        const query = `
          SELECT ${tableName === 'app_users' ? appUserFields : adminUserFields}
          FROM ${tableName}
          ORDER BY name ASC
        `;

        const users = organizationDb.prepare(query).all() as UserResponse[];

        return users.map(user => ({
          ...user,
          active: Boolean(user.active),
          canProofOfLife: user.canProofOfLife ? Boolean(user.canProofOfLife) : undefined,
          canRecadastration: user.canRecadastration ? Boolean(user.canRecadastration) : undefined,
          organizationId,
          organizationName: organization.name
        }));
      }

      throw new AppError('Invalid request parameters');
    } catch (error) {
      console.error('Error listing users:', error);
      throw new AppError('Error listing users');
    }
  }
}