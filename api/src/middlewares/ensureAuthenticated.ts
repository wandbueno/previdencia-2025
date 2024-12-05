import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { AppError } from '../errors/AppError';

interface TokenPayload {
  id: string;
  email?: string;
  isSuperAdmin?: boolean;
  organizationId?: string;
}

export function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new AppError('Token não fornecido', 401);
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = verify(
      token,
      process.env.JWT_SECRET as string
    ) as TokenPayload;

    request.user = {
      id: decoded.id,
      email: decoded.email,
      isSuperAdmin: decoded.isSuperAdmin,
      organizationId: decoded.organizationId
    };

    return next();
  } catch {
    throw new AppError('Token inválido', 401);
  }
}