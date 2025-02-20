import { db } from '../../lib/database';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { AppError } from '../../errors/AppError';

interface AuthRequest {
  email: string;
  password: string;
}

interface SuperAdmin {
  id: string;
  name: string;
  email: string;
  password: string;
  active: number;
}

export class SuperAdminAuthService {
  async execute({ email, password }: AuthRequest) {
    try {
      const mainDb = db.getMainDb();

      const superAdmin = mainDb.prepare(
        'SELECT * FROM super_admins WHERE email = ?'
      ).get(email) as SuperAdmin | undefined;

      if (!superAdmin) {
        throw new AppError('Email ou senha inválidos', 401);
      }

      if (!superAdmin.active) {
        throw new AppError('Usuário inativo', 401);
      }

      const passwordMatch = await compare(password, superAdmin.password);

      if (!passwordMatch) {
        throw new AppError('Email ou senha inválidos', 401);
      }

      const token = sign(
        {
          id: superAdmin.id,
          email: superAdmin.email,
          isSuperAdmin: true
        },
        process.env.JWT_SECRET as string,
        {
          expiresIn: '1d'
        }
      );

      return {
        id: superAdmin.id,
        name: superAdmin.name,
        email: superAdmin.email,
        isSuperAdmin: true,
        token
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error in super admin authentication:', error);
      throw new AppError('Internal server error', 500);
    }
  }
}