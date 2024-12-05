import { Request, Response, NextFunction } from 'express';
import { db } from '../lib/database';
import { AppError } from '../errors/AppError';

export async function setupMultiTenancy(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const subdomain = req.headers['x-organization-subdomain'] as string;

  if (!subdomain) {
    return next();
  }

  try {
    const mainDb = db.getMainDb();

    const organization = mainDb.prepare(`
      SELECT id, name, subdomain, state, city, active, services
      FROM organizations
      WHERE subdomain = ?
    `).get(subdomain);

    if (!organization) {
      throw new AppError('Organization not found', 404);
    }

    if (!organization.active) {
      throw new AppError('Organization is inactive', 403);
    }

    // Add organization context to request
    req.organization = {
      ...organization,
      services: JSON.parse(organization.services)
    };
    
    next();
  } catch (error) {
    next(error);
  }
}