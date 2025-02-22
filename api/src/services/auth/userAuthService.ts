import { db } from '../../lib/database';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { AppError } from '../../errors/AppError';

type UserRole = 'USER' | 'ADMIN';

interface Organization {
  id: string;
  name: string;
  subdomain: string;
  active: number; // SQLite armazena boolean como 0 ou 1
  services?: any[];
}

interface User {
  id: string;
  name: string;
  cpf: string;
  password: string;
  role: UserRole;
  organization_id: string;
  active: number;
}

interface AuthRequest {
  cpf: string;
  password: string;
  subdomain: string;
}

export class UserAuthService {
  async execute({ cpf, password, subdomain }: AuthRequest) {
    const organization = db.getMainDb().prepare(`
      SELECT o.*, s.* FROM organizations o
      LEFT JOIN services s ON s.organization_id = o.id
      WHERE o.subdomain = ?
    `).get(subdomain) as Organization;

    if (!organization) {
      throw new AppError('Organização não encontrada', 401);
    }

    if (!organization.active) {
      throw new AppError('Organização inativa', 401);
    }

    const user = db.getMainDb().prepare(`
      SELECT * FROM users 
      WHERE cpf = ? 
      AND organization_id = ? 
      AND role = ? 
      AND active = 1
    `).get(cpf, organization.id, 'USER') as User;

    if (!user) {
      throw new AppError('CPF ou senha inválidos', 401);
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new AppError('CPF ou senha inválidos', 401);
    }

    const token = sign(
      {
        id: user.id,
        organizationId: organization.id,
        role: user.role
      },
      process.env.JWT_SECRET || 'default',
      {
        expiresIn: '1d'
      }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        cpf: user.cpf,
        role: user.role
      },
      organization: {
        id: organization.id,
        name: organization.name,
        services: organization.services
      }
    };
  }
}