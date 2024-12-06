import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { hash } from 'bcryptjs';
import { generateId, getCurrentTimestamp } from '../../utils/database';
import { CreateUserDTO, UserType } from '../../types/user';

export class CreateUserService {
  async execute({ name, email, cpf, password, tableType, organizationId }: CreateUserDTO) {
    try {
      const mainDb = db.getMainDb();
      const tableName = tableType === 'admin' ? 'admin_users' : 'app_users';
      const role: UserType = tableType === 'admin' ? 'ADMIN' : 'USER';

      // Get organization
      const organization = mainDb.prepare(`
        SELECT subdomain, name FROM organizations 
        WHERE id = ? AND active = 1
      `).get(organizationId) as { subdomain: string; name: string } | undefined;

      if (!organization) {
        throw new AppError('Organization not found or inactive');
      }

      const organizationDb = await db.getOrganizationDb(organization.subdomain);

      // Check if email is already in use
      const emailExists = organizationDb.prepare(`
        SELECT 1 FROM ${tableName} WHERE email = ?
      `).get(email);

      if (emailExists) {
        throw new AppError('Email already in use');
      }

      // Check if CPF is already in use
      const cpfExists = organizationDb.prepare(`
        SELECT 1 FROM ${tableName} WHERE cpf = ?
      `).get(cpf);

      if (cpfExists) {
        throw new AppError('CPF already in use');
      }

      const id = generateId();
      const hashedPassword = await hash(password, 8);
      const timestamp = getCurrentTimestamp();

      // Create user in organization database
      organizationDb.prepare(`
        INSERT INTO ${tableName} (
          id, name, cpf, email, password,
          role, active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
      `).run(
        id,
        name,
        cpf,
        email,
        hashedPassword,
        role,
        timestamp,
        timestamp
      );

      return {
        id,
        name,
        email,
        cpf,
        role,
        active: true,
        createdAt: timestamp,
        updatedAt: timestamp,
        organizationId,
        organizationName: organization.name
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error creating user:', error);
      throw new AppError('Error creating user');
    }
  }
}