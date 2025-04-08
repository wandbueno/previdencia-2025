import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { getCurrentTimestamp } from '../../utils/database';
import { UserTableType } from '../../types/user';
import { hash } from 'bcryptjs';

interface UpdateUserRequest {
  id: string;
  organizationId: string;
  name: string;
  email?: string | null;
  active: boolean;
  tableType: UserTableType;
  password?: string | null;
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
  insuredName?: string | null;
  legalRepresentative?: string | null;
}

export class UpdateUserService {
  async execute(data: UpdateUserRequest) {
    try {
      const mainDb = db.getMainDb();

      // Buscar a organização
      const organization = mainDb.prepare(`
        SELECT subdomain, name FROM organizations 
        WHERE id = ? AND active = 1
      `).get(data.organizationId) as { subdomain: string; name: string } | undefined;

      if (!organization) {
        throw new AppError('Organization not found or inactive');
      }

      // Usar o banco da organização
      const database = await db.getOrganizationDb(organization.subdomain);
      const tableName = data.tableType === 'admin' ? 'admin_users' : 'app_users';

      // Verificar se o usuário existe
      const user = database.prepare(`
        SELECT * FROM ${tableName} WHERE id = ?
      `).get(data.id);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Atualizar o usuário
      if (data.tableType === 'app') {
        // Atualizar usuário do app
        database.prepare(`
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
            insured_name = ?,
            legal_representative = ?,
            ${data.password ? 'password = ?,' : ''}
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
          data.insuredName,
          data.legalRepresentative,
          ...(data.password ? [await hash(data.password, 8)] : []),
          getCurrentTimestamp(),
          data.id
        );
      } else {
        // Atualizar usuário admin
        if (data.password) {
          const hashedPassword = await hash(data.password, 8);
          database.prepare(`
            UPDATE ${tableName} SET
              name = ?,
              email = ?,
              active = ?,
              password = ?,
              updated_at = ?
            WHERE id = ?
          `).run(
            data.name,
            data.email,
            data.active ? 1 : 0,
            hashedPassword,
            getCurrentTimestamp(),
            data.id
          );
        } else {
          database.prepare(`
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
      }

      // Retornar o usuário atualizado
      const updatedUser = database.prepare(`
        SELECT * FROM ${tableName} WHERE id = ?
      `).get(data.id);

      return updatedUser;
    } catch (error) {
      console.error('Error in UpdateUserService:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Error updating user', 500);
    }
  }
}