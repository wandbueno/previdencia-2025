import { prisma } from '../../lib/prisma';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { AppError } from '../../errors/AppError';
import { UserRole } from '@prisma/client';

interface AuthRequest {
  cpf: string;
  password: string;
  subdomain: string;
}

export class UserAuthService {
  async execute({ cpf, password, subdomain }: AuthRequest) {
    const organization = await prisma.organization.findUnique({
      where: { subdomain },
      include: { services: true }
    });

    if (!organization) {
      throw new AppError('Organização não encontrada', 401);
    }

    if (!organization.active) {
      throw new AppError('Organização inativa', 401);
    }

    const user = await prisma.user.findFirst({
      where: {
        cpf,
        organizationId: organization.id,
        role: UserRole.USER,
        active: true
      }
    });

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
      process.env.JWT_SECRET as string,
      {
        expiresIn: '1d'
      }
    );

    return {
      id: user.id,
      name: user.name,
      cpf: user.cpf,
      role: user.role,
      organization: {
        id: organization.id,
        name: organization.name,
        subdomain: organization.subdomain,
        services: organization.services
      },
      token
    };
  }
}