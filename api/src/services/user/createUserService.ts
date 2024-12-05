import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { hash } from 'bcryptjs';
import { generateId, getCurrentTimestamp } from '../../utils/database';

interface CreateUserRequest {
  name: string;
  email: string;
  cpf: string;
  password: string;
  type: 'admin' | 'app';
  organizationId: string;
}

export class CreateUserService {
  async execute({ name, email, cpf, password, type, organizationId }: CreateUserRequest) {
    try {
      const mainDb = db.getMainDb();

      // Get organization
      const organization = mainDb.prepare(`
        SELECT subdomain FROM organizations 
        WHERE id = ? AND active = 1
      `).get(organizationId) as { subdomain: string } | undefined;

      if (!organization) {
        throw new AppError('Organization not found or inactive');
      }

      const organizationDb = await db.getOrganizationDb(organization.subdomain);
      const tableName = type === 'admin' ? 'admin_users' : 'app_users';

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
        type === 'admin' ? 'ADMIN' : 'USER',
        timestamp,
        timestamp
      );

      return {
        id,
        name,
        email,
        cpf,
        role: type === 'admin' ? 'ADMIN' : 'USER',
        active: true,
        createdAt: timestamp,
        updatedAt: timestamp,
        organizationId
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