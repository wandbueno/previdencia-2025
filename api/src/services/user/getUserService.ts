import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { UserResponse } from '../../types/user';

interface GetUserRequest {
  id: string;
}

export class GetUserService {
  async execute({ id }: GetUserRequest): Promise<UserResponse> {
    try {
      const mainDb = db.getMainDb();

      // Primeiro, encontrar em qual organização o usuário está
      const organizations = mainDb.prepare(`
        SELECT subdomain FROM organizations WHERE active = 1
      `).all() as { subdomain: string }[];

      let user: UserResponse | undefined;

      // Procurar o usuário em cada organização
      for (const org of organizations) {
        const organizationDb = await db.getOrganizationDb(org.subdomain);
        
        // Campos para usuários do app
        const appUserFields = `
          id, name, email, cpf, rg, role, active,
          can_proof_of_life as canProofOfLife,
          can_recadastration as canRecadastration,
          birth_date as birthDate,
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

        // Buscar usuário na tabela app_users
        const foundUser = organizationDb.prepare(`
          SELECT ${appUserFields}
          FROM app_users
          WHERE id = ?
        `).get(id) as UserResponse | undefined;

        if (foundUser) {
          user = foundUser;
          break;
        }
      }

      if (!user) {
        throw new AppError('User not found');
      }

      return user;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Error getting user');
    }
  }
}
