import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { db } from '../lib/database';

interface Organization {
  id: string;
  name: string;
  subdomain: string;
}

declare module 'express' {
  interface Request {
    organization?: Organization;
  }
}

export async function ensureOrganizationAdmin(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const { subdomain } = request.params;
  const { id: userId } = request.user;

  if (!subdomain || !userId) {
    throw new AppError('Unauthorized', 403);
  }

  try {
    // Get organization from main database
    const mainDb = db.getMainDb();
    const organization = mainDb.prepare(`
      SELECT id, name, subdomain FROM organizations 
      WHERE subdomain = ? AND active = 1
    `).get(subdomain) as Organization | undefined;

    if (!organization) {
      throw new AppError('Organization not found or inactive', 404);
    }

    // Get organization database
    const organizationDb = await db.getOrganizationDb(subdomain);

    // Check if user is an admin in this organization
    const adminUser = organizationDb.prepare(`
      SELECT id, role FROM admin_users 
      WHERE id = ? AND active = 1 AND role = 'ADMIN'
    `).get(userId);

    if (!adminUser) {
      throw new AppError('User is not an admin of this organization', 403);
    }

    // Add organization to request
    request.organization = organization;

    return next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Error checking organization admin permissions', 500);
  }
}