import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { getCurrentTimestamp } from '../../utils/database';
import { UserTableType } from '../../types/user';

interface UpdateUserRequest {
  id: string;
  subdomain: string;
  name: string;
  email?: string | null;
  active: boolean;
  tableType: UserTableType;
  canProofOfLife?: boolean;
  canRecadastration?: boolean;
  rg?: string;
  birthDate?: string;
  address?: string | null;
  phone?: string | null;
  registrationNumber?: string | null;
  processNumber?: string | null;
  benefitStartDate?: string;
  benefitEndDate?: string;
  benefitType?: 'APOSENTADORIA' | 'PENSAO';
  retirementType?: string | null;
  pensionGrantorName?: string | null;
  legalRepresentative?: string | null;
}

export class UpdateUserService {
  async execute(data: UpdateUserRequest) {
    try {
      const organizationDb = await db.getOrganizationDb(data.subdomain);
      const tableName = data.tableType === 'admin' ? 'admin_users' : 'app_users';

      // Verificar se o usuário existe
      const user = organizationDb.prepare(`
        SELECT * FROM ${tableName} WHERE id = ?
      `).get(data.id);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Atualizar o usuário
      if (data.tableType === 'app') {
        organizationDb.prepare(`
          UPDATE ${tableName} SET
            name = ?,
            email = ?,
            active = ?,
            can_proof_of_life = ?,
            can_recadastration = ?,
            rg = ?,
            birth_date = ?,
            address = ?,
            phone = ?,
            registration_number = ?,
            process_number = ?,
            benefit_start_date = ?,
            benefit_end_date = ?,
            benefit_type = ?,
            retirement_type = ?,
            pension_grantor_name = ?,
            legal_representative = ?,
            updated_at = ?
          WHERE id = ?
        `).run(
          data.name,
          data.email,
          data.active ? 1 : 0,
          data.canProofOfLife ? 1 : 0,
          data.canRecadastration ? 1 : 0,
          data.rg,
          data.birthDate,
          data.address,
          data.phone,
          data.registrationNumber,
          data.processNumber,
          data.benefitStartDate,
          data.benefitEndDate,
          data.benefitType,
          data.retirementType,
          data.pensionGrantorName,
          data.legalRepresentative,
          getCurrentTimestamp(),
          data.id
        );
      } else {
        organizationDb.prepare(`
          UPDATE ${tableName} SET
            name = ?,
            email = ?,
            active = ?,
            updated_at = ?
          WHERE id = ?
        `).run(
          data.name,
          data.email,
          data.active ? 1 : 0,
          getCurrentTimestamp(),
          data.id
        );
      }

      // Retornar o usuário atualizado
      const updatedUser = organizationDb.prepare(`
        SELECT * FROM ${tableName} WHERE id = ?
      `).get(data.id);

      return updatedUser;
    } catch (error) {
      console.error('Error in UpdateUserService:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Error updating user');
    }
  }
}