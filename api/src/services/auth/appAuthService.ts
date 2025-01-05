import { db } from '../../lib/database';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { AppError } from '../../errors/AppError';

interface AuthRequest {
  cpf: string;
  password: string;
  subdomain: string;
}

interface Organization {
  id: string;
  name: string;
  subdomain: string;
  state: string;
  city: string;
  active: number;
}

interface AppUser {
  id: string;
  name: string;
  cpf: string;
  email: string;
  password: string;
  role: string;
  active: number;
  can_proof_of_life: number;
  can_recadastration: number;
}

export class AppAuthService {
  async execute({ cpf, password, subdomain }: AuthRequest) {
    try {
      const mainDb = db.getMainDb();

      // Get organization
      const organization = mainDb.prepare(`
        SELECT * FROM organizations 
        WHERE subdomain = ? AND active = 1
      `).get(subdomain) as Organization | undefined;

      if (!organization) {
        throw new AppError('Organization not found or inactive', 401);
      }

      const organizationDb = await db.getOrganizationDb(subdomain);

      // Get app user
      const user = organizationDb.prepare(`
        SELECT * FROM app_users 
        WHERE cpf = ? AND active = 1
      `).get(cpf) as AppUser | undefined;

      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }

      const passwordMatch = await compare(password, user.password);

      if (!passwordMatch) {
        throw new AppError('Invalid credentials', 401);
      }

      const token = sign(
        {
          id: user.id,
          role: user.role,
          organizationId: organization.id
        },
        process.env.JWT_SECRET as string,
        {
          expiresIn: '1d'
        }
      );

      return {
        token,
        id: user.id,
        name: user.name,
        cpf: user.cpf,
        email: user.email,
        role: user.role,
        canProofOfLife: Boolean(user.can_proof_of_life),
        canRecadastration: Boolean(user.can_recadastration),
        organization: {
          id: organization.id,
          name: organization.name,
          subdomain: organization.subdomain,
          state: organization.state,
          city: organization.city
        }
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Error in app authentication:', error);
      throw new AppError('Internal server error', 500);
    }
  }
}
