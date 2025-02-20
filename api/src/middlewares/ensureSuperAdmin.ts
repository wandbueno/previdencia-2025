import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export function ensureSuperAdmin(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const { isSuperAdmin } = request.user;

  if (!isSuperAdmin) {
    throw new AppError('Acesso não autorizado', 403);
  }

  return next();
}