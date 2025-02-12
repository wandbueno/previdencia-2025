import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { getCurrentTimestamp } from '../../utils/database';
import { UserType, UserTableType } from '../../types/user';

interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  active: number;
  role: UserType;
  can_proof_of_life?: number;
  can_recadastration?: number;
}

interface UpdateUserRequest {
  id: string;
  name: string;
  email?: string;
  active: boolean;
  subdomain?: string;
  tableType: UserTableType;
  organizationId?: string;
  canProofOfLife?: boolean;
  canRecadastration?: boolean;
  rg: string;
  birthDate: string;
  address?: string;
  phone?: string;
  registrationNumber?: string;
  processNumber?: string;
  benefitStartDate: string;
  benefitEndDate: string;
  benefitType: 'APOSENTADORIA' | 'PENSAO';
  retirementType?: string;
  insuredName?: string;
  legalRepresentative?: string;
}

export class UpdateUserService {
  async execute({ 
    id, 
    name, 
    email, 
    active, 
    subdomain, 
    tableType, 
    organizationId,
    canProofOfLife,
    canRecadastration,
    rg,
    birthDate,
    address,
    phone,
    registrationNumber,
    processNumber,
    benefitStartDate,
    benefitEndDate,
    benefitType,
    retirementType,
    insuredName,
    legalRepresentative
  }: UpdateUserRequest) {
    try {
      const mainDb = db.getMainDb();
      const tableName = tableType === 'admin' ? 'admin_users' : 'app_users';

      // Get organization info
      const organization = mainDb.prepare(`
        SELECT id, subdomain, name FROM organizations 
        WHERE ${subdomain ? 'subdomain = ?' : 'id = ?'} AND active = 1
      `).get(subdomain || organizationId) as { id: string; subdomain: string; name: string } | undefined;

      if (!organization) {
        throw new AppError('Organization not found or inactive');
      }

      const organizationDb = await db.getOrganizationDb(organization.subdomain);

      // Check if user exists
      const user = organizationDb.prepare(`
        SELECT id, email, name, active, role, can_proof_of_life, can_recadastration 
        FROM ${tableName} WHERE id = ?
      `).get(id) as DatabaseUser | undefined;

      if (!user) {
        throw new AppError('User not found');
      }

      // Check if email is already in use by another user
      if (email && email !== user.email) {
        const emailExists = organizationDb.prepare(`
          SELECT 1 FROM ${tableName} WHERE email = ? AND id != ?
        `).get(email, id);

        if (emailExists) {
          throw new AppError('Email already in use');
        }
      }

      const timestamp = getCurrentTimestamp();

      // Start transaction
      organizationDb.exec('BEGIN TRANSACTION');

      try {
        // Update user
        const query = tableName === 'app_users'
          ? `
            UPDATE ${tableName}
            SET name = ?, 
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
                updated_at = ?
            WHERE id = ?
          `
          : `
            UPDATE ${tableName}
            SET name = ?, 
                email = ?, 
                active = ?,
                updated_at = ?
            WHERE id = ?
          `;

        const params = tableName === 'app_users'
          ? [
              name,
              email || null,
              active ? 1 : 0,
              canProofOfLife ? 1 : 0,
              canRecadastration ? 1 : 0,
              rg,
              birthDate,
              address || null,
              phone || null,
              registrationNumber || null,
              processNumber || null,
              benefitStartDate,
              benefitEndDate,
              benefitType,
              retirementType || null,
              insuredName || null,
              legalRepresentative || null,
              timestamp,
              id
            ]
          : [
              name,
              email || null,
              active ? 1 : 0,
              timestamp,
              id
            ];

        const result = organizationDb.prepare(query).run(...params);

        if (result.changes === 0) {
          throw new AppError('Error updating user');
        }

        // Commit transaction
        organizationDb.exec('COMMIT');

        return {
          id,
          name,
          email,
          active,
          canProofOfLife: tableName === 'app_users' ? Boolean(canProofOfLife) : undefined,
          canRecadastration: tableName === 'app_users' ? Boolean(canRecadastration) : undefined,
          rg,
          birthDate,
          address,
          phone,
          registrationNumber,
          processNumber,
          benefitStartDate,
          benefitEndDate,
          benefitType,
          retirementType,
          insuredName,
          legalRepresentative,
          updatedAt: timestamp,
          organizationId: organization.id,
          organizationName: organization.name
        };
      } catch (error) {
        // Rollback on error
        organizationDb.exec('ROLLBACK');
        throw error;
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error updating user:', error);
      throw new AppError('Error updating user');
    }
  }
}